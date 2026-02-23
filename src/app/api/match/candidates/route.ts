import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. HR role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "hr") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // 3. Require jobId query param
  const jobId = request.nextUrl.searchParams.get("jobId")
  if (!jobId) {
    return NextResponse.json(
      { error: "jobId query parameter is required" },
      { status: 400 }
    )
  }

  // 4. Call deterministic matching RPC
  const { data: matches, error: rpcError } = await supabase.rpc(
    "match_candidates_for_job",
    { p_job_id: jobId }
  )

  if (rpcError) {
    console.error("[match/candidates] RPC failed:", rpcError.message, rpcError.code)
    return NextResponse.json(
      { error: "Matching failed", detail: rpcError.message },
      { status: 500 }
    )
  }

  // 5. Return results (already sorted by score from RPC)
  return NextResponse.json({
    jobId,
    matches: matches ?? [],
  })
}
