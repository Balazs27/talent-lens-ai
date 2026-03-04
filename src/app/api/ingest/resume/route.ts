import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"
import { ingestResumeText, IngestPipelineError } from "@/lib/ingestion/resume-ingest-pipeline"

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

  // 3. Run shared ingestion pipeline
  try {
    const result = await ingestResumeText(supabase, resumeText)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof IngestPipelineError) {
      return NextResponse.json(
        { error: err.message, resumeId: err.resumeId },
        { status: err.httpStatus }
      )
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
