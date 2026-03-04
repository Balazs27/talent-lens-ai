# Architecture: Resume Upload

**Last updated:** 2026-03-04  
**Slice:** 12D — Resume PDF Upload  
**Status:** Implemented

---

## TL;DR

Employees can now upload a PDF resume in addition to pasting plain text. The PDF is parsed server-side to extract text, which is then fed into the **unchanged** resume ingestion pipeline. No second pipeline was created.

---

## UI Flow

```
/employee/resume
  │
  ├── [Paste Text] tab (default)
  │     └── Textarea input
  │           └── POST /api/ingest/resume  { resumeText }
  │
  └── [Upload PDF] tab
        └── Click-to-select file zone (.pdf, max 5MB)
              └── POST /api/ingest/resume/pdf  (multipart/form-data, field: "file")
```

Both paths render the same extraction result UI upon success.

---

## Backend Flow

### Text Path (existing, unchanged)

```
POST /api/ingest/resume
  body: { resumeText: string }
    │
    ├── Auth check (Supabase session)
    ├── Rate limit
    ├── Input validation (min 50 chars)
    └── ingestResumeText(supabase, resumeText)
          │
          ├── insert_active_resume RPC (atomic SCD2: deactivate old → insert new)
          ├── extractSkillsFromResume()  ← OpenAI function calling + Zod
          ├── normalizeSkills()          ← taxonomy lookup
          ├── INSERT resume_skills
          ├── DELETE gap_analysis_cache  ← invalidate stale cache
          ├── generateEmbedding()        ← non-fatal
          └── UPDATE resumes SET status='ready', parsed=...
```

### PDF Path (new)

```
POST /api/ingest/resume/pdf
  body: multipart/form-data, field "file"
    │
    ├── Auth check (Supabase session)
    ├── Rate limit
    ├── FormData parsing
    ├── File type validation (MIME: application/pdf)
    ├── File size validation (≤ 5MB, server-side)
    ├── extractTextFromPdf(buffer)
    │     ├── Magic bytes check (%PDF header)
    │     ├── pdf-parse: extract text layer
    │     ├── Text cleaning (control chars, whitespace)
    │     └── Min length check (≥ 50 chars)
    └── ingestResumeText(supabase, extractedText)   ← same shared function
          └── (identical pipeline as text path above)
```

---

## Code Structure

```
src/
  lib/
    ingestion/
      pdf-text-extractor.ts          ← PDF → text (new)
      resume-ingest-pipeline.ts      ← shared pipeline (new, extracted from route)
      resume-parser.ts               ← LLM extraction (unchanged)
      skill-normalizer.ts            ← taxonomy matching (unchanged)
  app/
    api/
      ingest/
        resume/
          route.ts                   ← text path (refactored: thin handler)
          pdf/
            route.ts                 ← PDF path (new)
  components/
    resume-upload.tsx                ← UI: tab toggle + both forms (updated)
```

---

## Security Constraints

| Concern | Enforcement |
|---------|-------------|
| File size | ≤ 5MB enforced client-side (UX) AND server-side (HTTP 413) |
| File type (MIME) | `application/pdf` required (HTTP 400 otherwise) |
| File type (magic bytes) | First 4 bytes must be `%PDF` (inside `extractTextFromPdf`) |
| Minimum content | Extracted text ≥ 50 chars (HTTP 422 with clear message) |
| Auth | Same Supabase session check as existing routes |
| Rate limiting | Reuses existing `rateLimit()` middleware |
| Malicious content | `pdf-parse` operates on text layer only — no JavaScript execution |
| Encrypted/corrupted PDFs | Caught and returned as 422 with user-friendly message |

---

## Dependency

| Package | Version | Purpose | Bundle impact |
|---------|---------|---------|--------------|
| `unpdf` | `^0.12` | PDF text extraction (server-side only) | lightweight, server only |

`unpdf` is a lightweight PDF extraction library designed for serverless and Node.js environments. Unlike `pdf-parse` v2 (which requires web workers and `DOMMatrix`), `unpdf` works natively in server-side contexts without browser APIs. It is used exclusively in server-side code (`src/lib/ingestion/pdf-text-extractor.ts`) and is never bundled into the client.

---

## Error Handling

| Scenario | HTTP Status | User message |
|----------|------------|-------------|
| Non-PDF file type | 400 | "Invalid file type. Only PDF files are accepted." |
| File > 5MB | 413 | "File too large. Maximum allowed size is 5MB." |
| Invalid/corrupt PDF | 422 | "Could not read the PDF. It may be encrypted or corrupted." |
| Image-only PDF (no text layer) | 422 | "Could not extract enough text from the PDF. The file may be image-based…" |
| LLM extraction failure | 500 | "Skill extraction failed" |
| Network error (client) | — | "Network error. Please try again." |

---

## Known Limitations

- **Image-based (scanned) PDFs** are not supported. These PDFs contain no text layer; OCR would be required (out of scope).
- **Encrypted/password-protected PDFs** will fail extraction with a clear error.
- **Complex PDF layouts** (multi-column, tables) may produce slightly garbled text, but the LLM extraction step is generally robust to this.

---

## Future Improvements

| Improvement | Notes |
|-------------|-------|
| DOCX support | Would require `mammoth` or similar library (additional dep approval needed) |
| OCR for scanned PDFs | Would require Tesseract or cloud Vision API (significant complexity) |
| Drag-and-drop upload | UI enhancement, no backend changes needed |
| Resume preview before submit | Show extracted text for user confirmation before ingestion |
| Multi-format upload flow | Single file input accepting PDF + DOCX + TXT |
