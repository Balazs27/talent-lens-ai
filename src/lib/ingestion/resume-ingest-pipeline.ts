import type { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  extractSkillsFromResume,
  SchemaValidationError,
} from "@/lib/ingestion/resume-parser"
import { generateEmbedding } from "@/lib/openai/embeddings"
import { normalizeSkills } from "@/lib/ingestion/skill-normalizer"
import type { ResumeExtraction, ExtractedSkill } from "@/lib/types/resume"

export interface IngestResult {
  resumeId: string
  status: string
  parsed: ResumeExtraction
  matchedSkills: Array<{
    skillId: number
    canonicalName: string
    category: string
    proficiency: string | null
    confidence: number
    yearsExperience: number | null
  }>
}

/**
 * Core resume ingestion pipeline — shared by both text-paste and PDF-upload routes.
 *
 * Steps:
 *   1. Atomically insert new active resume (deactivates prior resumes via RPC)
 *   2. LLM skill extraction (OpenAI function calling + Zod validation)
 *   3. Skill normalization against taxonomy
 *   4. Insert resume_skills rows
 *   5. Invalidate gap analysis cache
 *   6. Generate and store embedding (non-fatal)
 *   7. Mark resume status → "ready"
 *
 * Throws typed errors rather than returning HTTP responses — callers handle HTTP concerns.
 */
export async function ingestResumeText(
  supabase: SupabaseClient,
  resumeText: string
): Promise<IngestResult> {
  // Step 1 — Atomically deactivate old resumes + insert new active resume
  const { data: resumeId, error: insertError } = await supabase.rpc(
    "insert_active_resume",
    { p_raw_text: resumeText }
  )

  if (insertError || !resumeId) {
    throw new IngestPipelineError("Failed to create resume record", "insert", 500)
  }

  // Step 2 — LLM extraction + Zod schema validation
  let extraction: ResumeExtraction
  try {
    extraction = await extractSkillsFromResume(resumeText)
  } catch (err) {
    await supabase.from("resumes").update({ status: "error" }).eq("id", resumeId)

    if (err instanceof SchemaValidationError) {
      throw new IngestPipelineError(
        "Extraction output failed validation",
        "extraction_validation",
        422,
        resumeId
      )
    }
    throw new IngestPipelineError(
      "Skill extraction failed",
      "extraction",
      500,
      resumeId
    )
  }

  // Step 3 — Normalize extracted skill names against the skills taxonomy
  const extractedNames = extraction.skills.map((s) => s.name)
  let normalizedSkills
  try {
    normalizedSkills = await normalizeSkills(supabase, extractedNames)
  } catch {
    await supabase.from("resumes").update({ status: "error" }).eq("id", resumeId)
    throw new IngestPipelineError(
      "Skill normalization failed",
      "normalization",
      500,
      resumeId
    )
  }

  // Step 4 — Build and insert resume_skills rows
  const skillMap = new Map<string, ExtractedSkill>(
    extraction.skills.map((s) => [s.name.trim().toLowerCase(), s])
  )

  const resumeSkillRows = normalizedSkills.map((ns) => {
    const extracted = skillMap.get(ns.originalName.trim().toLowerCase())
    return {
      resume_id: resumeId,
      skill_id: ns.skillId,
      proficiency: extracted?.proficiency ?? null,
      years_experience: extracted?.years_experience ?? null,
      confidence: extracted?.confidence ?? 1.0,
      source: "extracted" as const,
    }
  })

  if (resumeSkillRows.length > 0) {
    const { error: skillsError } = await supabase
      .from("resume_skills")
      .insert(resumeSkillRows)

    if (skillsError) {
      await supabase.from("resumes").update({ status: "error" }).eq("id", resumeId)
      throw new IngestPipelineError(
        "Failed to save extracted skills",
        "skills_insert",
        500,
        resumeId
      )
    }
  }

  // Step 5 — Invalidate gap analysis cache for this user (admin client — no DELETE policy)
  const admin = createAdminClient()
  await admin.from("gap_analysis_cache").delete().eq("resume_id", resumeId)

  // Step 6 — Generate and store embedding (non-fatal — resume becomes ready regardless)
  try {
    const embedding = await generateEmbedding(resumeText)
    await supabase.from("resumes").update({ embedding }).eq("id", resumeId)
  } catch (err) {
    console.error(
      "[ingest-pipeline] Embedding failed:",
      err instanceof Error ? err.message : err
    )
  }

  // Step 7 — Mark resume as ready with parsed extraction JSON
  const { error: updateError } = await supabase
    .from("resumes")
    .update({
      parsed: extraction as unknown as Record<string, unknown>,
      status: "ready",
    })
    .eq("id", resumeId)

  if (updateError) {
    throw new IngestPipelineError(
      "Failed to update resume",
      "status_update",
      500,
      resumeId
    )
  }

  // Build matched skills response shape
  const matchedSkills = normalizedSkills.map((ns) => {
    const extracted = skillMap.get(ns.originalName.trim().toLowerCase())
    return {
      skillId: ns.skillId,
      canonicalName: ns.canonicalName,
      category: ns.category,
      proficiency: extracted?.proficiency ?? null,
      confidence: extracted?.confidence ?? 1.0,
      yearsExperience: extracted?.years_experience ?? null,
    }
  })

  return {
    resumeId,
    status: "ready",
    parsed: extraction,
    matchedSkills,
  }
}

export class IngestPipelineError extends Error {
  constructor(
    message: string,
    public readonly stage: string,
    public readonly httpStatus: number,
    public readonly resumeId?: string
  ) {
    super(message)
    this.name = "IngestPipelineError"
  }
}
