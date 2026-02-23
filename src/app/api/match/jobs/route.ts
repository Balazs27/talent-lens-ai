import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Fetch user's latest resume with status='ready'
  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (resumeError || !resume) {
    return NextResponse.json(
      { error: "No ready resume found. Please upload a resume first." },
      { status: 400 }
    )
  }

  // 3. Call deterministic matching RPC
  const { data: matches, error: rpcError } = await supabase.rpc(
    "match_jobs_for_resume",
    { p_resume_id: resume.id }
  )

  if (rpcError) {
    console.error("[match/jobs] RPC failed:", rpcError.message, rpcError.code)
    return NextResponse.json(
      { error: "Matching failed", detail: rpcError.message },
      { status: 500 }
    )
  }

  // 4. Return results (already sorted by score from RPC)
  return NextResponse.json({
    resumeId: resume.id,
    matches: matches ?? [],
  })
}
