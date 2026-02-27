import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimit } from "@/lib/rate-limit"
import { explainMatch } from "@/lib/analysis/match-explainer"
import type { DeterministicGap } from "@/lib/types/gap-analysis"
import type { MatchExplanationResponse } from "@/lib/types/match-explanation"

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(request: Request) {
  const rateLimitResponse = rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  const supabase = await createClient()

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Parse + validate body
  let body: { jobId?: string; resumeId?: string; mode?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { jobId, resumeId, mode } = body
  if (!jobId || !resumeId || !mode) {
    return NextResponse.json(
      { error: "jobId, resumeId, and mode are required" },
      { status: 400 }
    )
  }
  if (mode !== "employee" && mode !== "hr") {
    return NextResponse.json(
      { error: "mode must be 'employee' or 'hr'" },
      { status: 400 }
    )
  }

  // 3. Access control
  if (mode === "employee") {
    const { data: resume } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single()

    if (!resume) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "hr") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  // 4. Check cache (authenticated client — respects RLS)
  const { data: cached } = await supabase
    .from("match_explanation_cache")
    .select("explanation, created_at")
    .eq("job_id", jobId)
    .eq("resume_id", resumeId)
    .eq("mode", mode)
    .single()

  if (cached) {
    const age = Date.now() - new Date(cached.created_at).getTime()
    if (age < CACHE_TTL_MS) {
      return NextResponse.json({
        explanation: cached.explanation,
        cached: true,
      } satisfies MatchExplanationResponse)
    }
  }

  // 5. Fetch signals in parallel
  const [scoresResult, gapResult] = await Promise.all([
    supabase.rpc("get_match_scores", { p_job_id: jobId, p_resume_id: resumeId }),
    supabase.rpc("get_gap_analysis", { p_job_id: jobId, p_resume_id: resumeId }),
  ])

  if (scoresResult.error || !scoresResult.data) {
    console.error("[explain/match] get_match_scores failed:", scoresResult.error?.message)
    return NextResponse.json(
      { error: "Failed to fetch match signals", detail: scoresResult.error?.message },
      { status: 500 }
    )
  }

  // get_match_scores returns a table (array); take the first row
  const scores = Array.isArray(scoresResult.data)
    ? scoresResult.data[0]
    : scoresResult.data

  if (!scores) {
    return NextResponse.json(
      { error: "No match data found for this pair" },
      { status: 404 }
    )
  }

  // 6. Extract skill names from gap analysis (non-fatal if gap fails)
  const gap = gapResult.data as DeterministicGap | null

  function extractNames(arr: Array<Record<string, unknown>> | null | undefined): string[] {
    if (!arr) return []
    return arr
      .map((s) => String(s.skill_name ?? ""))
      .filter(Boolean)
  }

  const matchedRequired  = extractNames(gap?.matched_required)
  const missingRequired  = extractNames(gap?.missing_required)
  const missingPreferred = extractNames(gap?.missing_preferred)

  // 7. Call LLM (non-fatal — returns null on failure)
  let explanation = null
  try {
    explanation = await explainMatch({
      title:              scores.title as string,
      hybridScore:        scores.hybrid_score as number,
      deterministicScore: scores.deterministic_score_normalized as number,
      semanticSimilarity: scores.semantic_similarity as number,
      matchedRequired,
      missingRequired,
      missingPreferred,
    })
  } catch (err) {
    console.error(
      "[explain/match] LLM failed:",
      err instanceof Error ? err.message : err
    )
  }

  // 8. Store in cache (admin client — bypasses RLS)
  const admin = createAdminClient()
  await admin.from("match_explanation_cache").upsert(
    {
      job_id:      jobId,
      resume_id:   resumeId,
      mode,
      explanation,
      created_at:  new Date().toISOString(),
    },
    { onConflict: "job_id,resume_id,mode" }
  )

  // 9. Return
  return NextResponse.json({
    explanation,
    cached: false,
  } satisfies MatchExplanationResponse)
}
