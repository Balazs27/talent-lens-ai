import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimit } from "@/lib/rate-limit"
import { extractSkillsFromJD } from "@/lib/ingestion/jd-parser"
import { generateEmbedding } from "@/lib/openai/embeddings"
import { SchemaValidationError } from "@/lib/ingestion/resume-parser"
import { findOrCreateSkills, type NormalizationResult } from "@/lib/ingestion/skill-normalizer"
import type { JobExtraction, ExtractedJobSkill } from "@/lib/types/job"

export async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const supabase = await createClient()
  // Admin client needed for skills auto-creation (no INSERT RLS on skills table)
  const admin = createAdminClient()

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Explicit HR role verification
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.role !== "hr") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // 3. Validate input
  let body: { jdText?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const jdText = body.jdText?.trim()
  if (!jdText || jdText.length < 50) {
    return NextResponse.json(
      { error: "jdText is required (minimum 50 characters)" },
      { status: 400 }
    )
  }

  // 4. Insert job row (status: processing, parsed: {}, seniority: null)
  //    title is NOT NULL in schema — use placeholder; overwritten in step 9
  const { data: job, error: insertError } = await supabase
    .from("jobs")
    .insert({
      created_by: user.id,
      title: "Untitled",
      raw_text: jdText,
      status: "processing",
      parsed: {},
      seniority: null,
    })
    .select("id")
    .single()

  if (insertError || !job) {
    // TEMP DEBUG: log Supabase error for diagnosis
    console.error("[ingest/job] Insert failed:", insertError?.message, insertError?.code)
    return NextResponse.json(
      { error: "Failed to create job record", detail: insertError?.message },
      { status: 500 }
    )
  }

  const jobId = job.id

  // 5. Call OpenAI + validate with Zod
  let extraction: JobExtraction
  try {
    extraction = await extractSkillsFromJD(jdText)
  } catch (err) {
    await supabase
      .from("jobs")
      .update({ status: "error" })
      .eq("id", jobId)

    if (err instanceof SchemaValidationError) {
      return NextResponse.json(
        { error: "Extraction output failed validation", jobId },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { error: "Skill extraction failed", jobId },
      { status: 500 }
    )
  }

  // 6. Normalize + auto-create skills against the taxonomy
  const extractedNames = extraction.skills.map((s) => s.name)
  let normalizedSkills: NormalizationResult[]
  try {
    normalizedSkills = await findOrCreateSkills(admin, supabase, extractedNames)
  } catch {
    await supabase
      .from("jobs")
      .update({ status: "error" })
      .eq("id", jobId)
    return NextResponse.json(
      { error: "Skill normalization failed", jobId },
      { status: 500 }
    )
  }

  // 7. Build job_skills rows — lookup importance/min_years from extraction
  const skillMap = new Map<string, ExtractedJobSkill>(
    extraction.skills.map((s) => [s.name.trim().toLowerCase(), s])
  )

  const jobSkillRows = normalizedSkills.map((ns) => {
    const extracted = skillMap.get(ns.originalName.trim().toLowerCase())
    return {
      job_id: jobId,
      skill_id: ns.skillId,
      importance: extracted?.importance ?? "required",
      min_years: extracted?.min_years ?? null,
    }
  })

  // 8. Insert job_skills
  if (jobSkillRows.length > 0) {
    const { error: skillsError } = await supabase
      .from("job_skills")
      .insert(jobSkillRows)

    if (skillsError) {
      await supabase
        .from("jobs")
        .update({ status: "error" })
        .eq("id", jobId)
      return NextResponse.json(
        { error: "Failed to save extracted skills", jobId },
        { status: 500 }
      )
    }
  }

  // 8.5. Generate and store embedding (non-fatal — job becomes ready regardless)
  try {
    const embedding = await generateEmbedding(jdText)
    await supabase
      .from("jobs")
      .update({ embedding })
      .eq("id", jobId)
  } catch (err) {
    console.error(
      "[ingest/job] Embedding failed:",
      err instanceof Error ? err.message : err
    )
  }

  // 9. Update job: parsed, seniority, title, company, location, status = ready
  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      parsed: extraction as unknown as Record<string, unknown>,
      seniority: extraction.seniority,
      title: extraction.title ?? "Untitled",
      company: extraction.company,
      location: extraction.location,
      status: "ready",
    })
    .eq("id", jobId)

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update job", jobId },
      { status: 500 }
    )
  }

  // 10. Return result
  return NextResponse.json({
    jobId,
    status: "ready",
    parsed: extraction,
    matchedSkills: normalizedSkills.map((ns) => {
      const extracted = skillMap.get(ns.originalName.trim().toLowerCase())
      return {
        skillId: ns.skillId,
        canonicalName: ns.canonicalName,
        category: ns.category,
        importance: extracted?.importance ?? "required",
        minYears: extracted?.min_years ?? null,
      }
    }),
  })
}
