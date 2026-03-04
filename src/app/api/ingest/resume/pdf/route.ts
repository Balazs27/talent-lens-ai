import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"
import {
  extractTextFromPdf,
  PdfExtractionError,
} from "@/lib/ingestion/pdf-text-extractor"
import {
  ingestResumeText,
  IngestPipelineError,
} from "@/lib/ingestion/resume-ingest-pipeline"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

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

  // 2. Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Expected multipart/form-data." },
      { status: 400 }
    )
  }

  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file uploaded. Send a PDF as 'file' field." },
      { status: 400 }
    )
  }

  // 3. Validate file type (MIME)
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Invalid file type. Only PDF files are accepted." },
      { status: 400 }
    )
  }

  // 4. Validate file size (server-side — client may bypass)
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: `File too large. Maximum allowed size is 5MB (got ${(file.size / 1024 / 1024).toFixed(1)}MB).`,
      },
      { status: 413 }
    )
  }

  // 5. Extract text from PDF (also validates magic bytes + min text length)
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let resumeText: string
  try {
    resumeText = await extractTextFromPdf(buffer)
  } catch (err) {
    if (err instanceof PdfExtractionError) {
      return NextResponse.json({ error: err.message }, { status: 422 })
    }
    return NextResponse.json(
      { error: "Failed to process PDF. Please try again or paste your text." },
      { status: 500 }
    )
  }

  // 6. Run shared ingestion pipeline with the extracted text
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
