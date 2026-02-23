import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { analyzeGapWithLLM } from "@/lib/analysis/gap-analyzer"
import type { DeterministicGap } from "@/lib/types/gap-analysis"

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

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
    // Employee must own the resume
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
    // HR role check
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
    .from("gap_analysis_cache")
    .select("deterministic, llm_result, created_at")
    .eq("job_id", jobId)
    .eq("resume_id", resumeId)
    .eq("mode", mode)
    .single()

  if (cached) {
    const age = Date.now() - new Date(cached.created_at).getTime()
    if (age < CACHE_TTL_MS) {
      return NextResponse.json({
        deterministic: cached.deterministic,
        llm: cached.llm_result,
        cached: true,
      })
    }
  }

  // 5. Call deterministic RPC
  const { data: deterministicRaw, error: rpcError } = await supabase.rpc(
    "get_gap_analysis",
    { p_job_id: jobId, p_resume_id: resumeId }
  )

  if (rpcError) {
    console.error("[analyze/gap] RPC failed:", rpcError.message)
    return NextResponse.json(
      { error: "Gap analysis failed", detail: rpcError.message },
      { status: 500 }
    )
  }

  const deterministic = deterministicRaw as DeterministicGap

  // 6. Call LLM for recommendations
  let llmResult = null
  try {
    llmResult = await analyzeGapWithLLM(
      deterministic as unknown as Record<string, unknown>,
      mode
    )
  } catch (err) {
    // LLM failure is non-fatal — return deterministic without LLM
    console.error(
      "[analyze/gap] LLM failed:",
      err instanceof Error ? err.message : err
    )
  }

  // 7. Store in cache (admin client — bypasses RLS, no INSERT policy)
  const admin = createAdminClient()
  await admin.from("gap_analysis_cache").upsert(
    {
      job_id: jobId,
      resume_id: resumeId,
      mode,
      deterministic,
      llm_result: llmResult,
      created_at: new Date().toISOString(),
    },
    { onConflict: "job_id,resume_id,mode" }
  )

  // 8. Return result
  return NextResponse.json({
    deterministic,
    llm: llmResult,
    cached: false,
  })
}
