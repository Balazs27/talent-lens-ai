import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  extractSkillsFromResume,
  SchemaValidationError,
} from "@/lib/ingestion/resume-parser"
import { normalizeSkills } from "@/lib/ingestion/skill-normalizer"
import type { ResumeExtraction, ExtractedSkill } from "@/lib/types/resume"

export async function POST(request: Request) {
  const supabase = await createClient()

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Validate input
  let body: { resumeText?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const resumeText = body.resumeText?.trim()
  if (!resumeText || resumeText.length < 50) {
    return NextResponse.json(
      { error: "resumeText is required (minimum 50 characters)" },
      { status: 400 }
    )
  }

  // 3. Insert resume row (status: processing, parsed: null)
  const { data: resume, error: insertError } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      raw_text: resumeText,
      status: "processing",
      parsed: null,
    })
    .select("id")
    .single()

  if (insertError || !resume) {
    return NextResponse.json(
      { error: "Failed to create resume record" },
      { status: 500 }
    )
  }

  const resumeId = resume.id

  // 4. Call OpenAI + validate with Zod
  let extraction: ResumeExtraction
  try {
    extraction = await extractSkillsFromResume(resumeText)
  } catch (err) {
    await supabase
      .from("resumes")
      .update({ status: "error" })
      .eq("id", resumeId)

    if (err instanceof SchemaValidationError) {
      return NextResponse.json(
        { error: "Extraction output failed validation", resumeId },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { error: "Skill extraction failed", resumeId },
      { status: 500 }
    )
  }

  // 5. Normalize skills against taxonomy
  const extractedNames = extraction.skills.map((s) => s.name)
  let normalizedSkills
  try {
    normalizedSkills = await normalizeSkills(supabase, extractedNames)
  } catch {
    await supabase
      .from("resumes")
      .update({ status: "error" })
      .eq("id", resumeId)
    return NextResponse.json(
      { error: "Skill normalization failed", resumeId },
      { status: 500 }
    )
  }

  // 6. Build resume_skills rows — lookup confidence/proficiency from extraction
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

  // 7. Insert resume_skills (Zod-validated data only)
  if (resumeSkillRows.length > 0) {
    const { error: skillsError } = await supabase
      .from("resume_skills")
      .insert(resumeSkillRows)

    if (skillsError) {
      await supabase
        .from("resumes")
        .update({ status: "error" })
        .eq("id", resumeId)
      return NextResponse.json(
        { error: "Failed to save extracted skills", resumeId },
        { status: 500 }
      )
    }
  }

  // 8. Invalidate gap analysis cache for this resume (admin client — no DELETE policy)
  const admin = createAdminClient()
  await admin
    .from("gap_analysis_cache")
    .delete()
    .eq("resume_id", resumeId)

  // 9. Update resume: parsed = validated JSON, status = ready
  const { error: updateError } = await supabase
    .from("resumes")
    .update({
      parsed: extraction as unknown as Record<string, unknown>,
      status: "ready",
    })
    .eq("id", resumeId)

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update resume", resumeId },
      { status: 500 }
    )
  }

  // 10. Return result
  return NextResponse.json({
    resumeId,
    status: "ready",
    parsed: extraction,
    matchedSkills: normalizedSkills.map((ns) => {
      const extracted = skillMap.get(ns.originalName.trim().toLowerCase())
      return {
        skillId: ns.skillId,
        canonicalName: ns.canonicalName,
        category: ns.category,
        proficiency: extracted?.proficiency ?? null,
        confidence: extracted?.confidence ?? 1.0,
        yearsExperience: extracted?.years_experience ?? null,
      }
    }),
  })
}
