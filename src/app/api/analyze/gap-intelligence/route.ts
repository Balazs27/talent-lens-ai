import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimit } from "@/lib/rate-limit"
import { analyzeGapIntelligence } from "@/lib/analysis/gap-intelligence-analyzer"
import type { DeterministicGap } from "@/lib/types/gap-analysis"
import type { GapIntelligenceResponse } from "@/lib/types/gap-intelligence"

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
    .from("gap_intelligence_cache")
    .select("intelligence, created_at")
    .eq("job_id", jobId)
    .eq("resume_id", resumeId)
    .eq("mode", mode)
    .single()

  if (cached) {
    const age = Date.now() - new Date(cached.created_at).getTime()
    if (age < CACHE_TTL_MS) {
      return NextResponse.json({
        intelligence: cached.intelligence,
        cached: true,
      } satisfies GapIntelligenceResponse)
    }
  }

  // 5. Fetch deterministic gap data
  const { data: deterministicRaw, error: rpcError } = await supabase.rpc("get_gap_analysis", {
    p_job_id: jobId,
    p_resume_id: resumeId,
  })

  if (rpcError || !deterministicRaw) {
    console.error("[analyze/gap-intelligence] get_gap_analysis failed:", rpcError?.message)
    return NextResponse.json(
      { error: "Failed to fetch gap data", detail: rpcError?.message },
      { status: 500 }
    )
  }

  const deterministic = deterministicRaw as DeterministicGap

  // 6. Guard: nothing to analyze if no missing skills
  if (
    deterministic.missing_required.length === 0 &&
    deterministic.missing_preferred.length === 0
  ) {
    return NextResponse.json({
      intelligence: null,
      cached: false,
    } satisfies GapIntelligenceResponse)
  }

  // 7. Call LLM (non-fatal — returns null on failure)
  let intelligence = null
  try {
    intelligence = await analyzeGapIntelligence(
      deterministic as unknown as Record<string, unknown>
    )
  } catch (err) {
    console.error(
      "[analyze/gap-intelligence] LLM failed:",
      err instanceof Error ? err.message : err
    )
  }

  // 8. Store in cache (admin client — bypasses RLS)
  const admin = createAdminClient()
  await admin.from("gap_intelligence_cache").upsert(
    {
      job_id: jobId,
      resume_id: resumeId,
      mode,
      intelligence,
      created_at: new Date().toISOString(),
    },
    { onConflict: "job_id,resume_id,mode" }
  )

  // 9. Return
  return NextResponse.json({
    intelligence,
    cached: false,
  } satisfies GapIntelligenceResponse)
}
