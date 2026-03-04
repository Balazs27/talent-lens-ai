const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MIN_TEXT_LENGTH = 50

/**
 * Extract and clean plain text from a PDF buffer.
 *
 * Uses `unpdf` — a lightweight PDF extraction library designed for
 * serverless/Node.js environments (no web worker or DOMMatrix required).
 *
 * Validates:
 * - File size ≤ 5MB
 * - PDF magic bytes (%PDF header)
 * - Extracted text has at least 50 characters (not image-only / encrypted)
 *
 * Returns cleaned text ready to be fed into the resume ingestion pipeline.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Guard: file size
  if (buffer.byteLength > MAX_FILE_SIZE) {
    throw new PdfExtractionError(
      `File too large. Maximum allowed size is 5MB (got ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB).`
    )
  }

  // Guard: magic bytes — PDFs must start with "%PDF"
  const header = buffer.subarray(0, 4).toString("ascii")
  if (header !== "%PDF") {
    throw new PdfExtractionError(
      "Invalid file. Please upload a valid PDF document."
    )
  }

  let pages: string[]
  try {
    // Dynamic import — unpdf is ESM-only
    const { extractText } = await import("unpdf")
    const result = await extractText(new Uint8Array(buffer))
    pages = result.text
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[pdf-text-extractor] PDF parse failed:", msg)
    throw new PdfExtractionError(
      "Could not read the PDF. It may be encrypted or corrupted."
    )
  }

  // Join all pages with double newline separator, then clean
  const rawText = pages.join("\n\n")
  const cleaned = cleanPdfText(rawText)

  if (cleaned.length < MIN_TEXT_LENGTH) {
    throw new PdfExtractionError(
      "Could not extract enough text from the PDF. " +
        "The file may be image-based (scanned) or have no selectable text. " +
        "Please paste your resume text instead."
    )
  }

  return cleaned
}

/**
 * Sanitize raw text extracted from a PDF:
 * - Remove null bytes and non-printable control characters (except newlines/tabs)
 * - Collapse runs of blank lines to a single blank line
 * - Collapse runs of spaces/tabs on a single line
 * - Trim leading/trailing whitespace
 */
function cleanPdfText(raw: string): string {
  return raw
    // Remove null bytes and control chars except \t (tab), \n (newline), \r (carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    // Collapse horizontal whitespace on each line
    .replace(/[^\S\n]+/g, " ")
    // Collapse more than 2 consecutive newlines into 2
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export class PdfExtractionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PdfExtractionError"
  }
}
