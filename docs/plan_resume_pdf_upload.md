# Plan: PDF Resume Upload (Slice 12D)

**Date:** 2026-03-04  
**Author:** AdaL  
**Status:** Draft  
**Branch:** `feature/resume-upload-fix`

---

## TL;DR

Add a PDF upload option to the employee resume page. The PDF is parsed server-side to extract text, which is then fed into the **existing** resume ingestion pipeline unchanged. No new ingestion pipeline, no changes to matching/embedding/skill-extraction logic.

---

## 1. Current State (Exploration Summary)

### Existing Resume Ingestion Pipeline

```
Employee pastes text
  → POST /api/ingest/resume  { resumeText }
    → Auth check
    → Input validation (min 50 chars)
    → insert_active_resume RPC (SCD2 — deactivate old, insert new)
    → extractSkillsFromResume(resumeText) — OpenAI function calling + Zod validation
    → normalizeSkills() — taxonomy lookup
    → Insert resume_skills rows
    → Invalidate gap_analysis_cache
    → generateEmbedding(resumeText) — non-fatal
    → Update resume status → "ready"
    → Return { resumeId, parsed, matchedSkills }
```

### Key Files

| File | Role |
|------|------|
| `src/app/api/ingest/resume/route.ts` | API route — full pipeline orchestration (186 lines) |
| `src/lib/ingestion/resume-parser.ts` | LLM skill extraction (OpenAI + Zod) |
| `src/lib/ingestion/skill-normalizer.ts` | Taxonomy matching |
| `src/lib/openai/embeddings.ts` | Embedding generation |
| `src/lib/types/resume.ts` | Zod schemas for extraction output |
| `src/components/resume-upload.tsx` | UI — paste textarea + submit |
| `src/app/employee/resume/page.tsx` | Page wrapper |

### Architectural Constraints (from CLAUDE.md)

- No new dependencies without approval → **`pdf-parse` pre-approved by user**
- Minimal diffs / no refactor mania
- Business logic in `src/lib/**`, not in route handlers or components
- Keep handlers thin — orchestration only
- Must build (`npm run build`)

---

## 2. Design

### 2.1 Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Employee Resume Page                │
│                                                     │
│   ┌─────────────┐          ┌──────────────────┐    │
│   │ Paste Text  │          │ Upload PDF       │    │
│   │ (existing)  │          │ (.pdf only)      │    │
│   └──────┬──────┘          └────────┬─────────┘    │
│          │                          │               │
└──────────┼──────────────────────────┼───────────────┘
           │                          │
           ▼                          ▼
  POST /api/ingest/resume    POST /api/ingest/resume/pdf
  { resumeText }             { FormData: file }
                                      │
                              ┌───────▼────────┐
                              │ Validate file  │
                              │ (type, size)   │
                              └───────┬────────┘
                                      │
                              ┌───────▼────────┐
                              │ pdf-parse      │
                              │ extract text   │
                              └───────┬────────┘
                                      │
                              ┌───────▼────────┐
                              │ Clean/sanitize │
                              │ extracted text │
                              └───────┬────────┘
                                      │
                    ┌─────────────────▼──────────────────┐
                    │   EXISTING PIPELINE (reused)       │
                    │   insert_active_resume RPC         │
                    │   → extractSkillsFromResume()      │
                    │   → normalizeSkills()              │
                    │   → insert resume_skills           │
                    │   → generateEmbedding()            │
                    │   → update status → "ready"        │
                    └────────────────────────────────────┘
```

### 2.2 Strategy: Extract Shared Pipeline Logic

**Current problem:** The full pipeline (steps 3–10) lives inside `POST /api/ingest/resume/route.ts`. To reuse it from the PDF route without duplicating ~120 lines, we **extract** the core pipeline into a shared function.

**Plan:**
1. Create `src/lib/ingestion/resume-ingest-pipeline.ts` — extracts steps 3–10 from the existing route into a reusable `ingestResume(supabase, resumeText)` function.
2. Refactor `src/app/api/ingest/resume/route.ts` to call this shared function (thin handler).
3. New `src/app/api/ingest/resume/pdf/route.ts` also calls the same shared function after PDF parsing.

This keeps both routes thin and avoids code duplication.

### 2.3 PDF Text Extraction

**Library:** `pdf-parse` (npm package, ~50KB, no native deps, widely used)
- Extracts text from PDF buffers
- Handles multi-page documents
- Pure JS — no system dependencies

**Text cleaning after extraction:**
- Collapse excessive whitespace/newlines
- Remove null bytes and control characters
- Trim to reasonable length (same 8000-char limit as embedding, but allow full text for extraction)

Create: `src/lib/ingestion/pdf-text-extractor.ts`

### 2.4 Security

| Concern | Mitigation |
|---------|------------|
| File size | Reject > 5MB before parsing |
| File type | Check MIME type (`application/pdf`) AND file extension |
| PDF magic bytes | Validate first bytes are `%PDF` |
| Malicious content | pdf-parse operates on text layer only, no JS execution |
| Text length | Enforce min 50 chars after extraction (same as paste) |
| Auth | Same auth check as existing route |
| Rate limiting | Reuse existing `rateLimit()` |

### 2.5 UI Changes

Update `src/components/resume-upload.tsx`:
- Add tab/toggle: "Paste Text" | "Upload PDF"
- PDF upload section:
  - Styled drop zone / file input (`.pdf` only, max 5MB)
  - File name display after selection
  - Upload button with loading state
  - Error display (file too large, wrong type, extraction failed)
- Both paths show the same success result (IngestResult)

**No changes to:** resume page wrapper, sidebar, layout.

---

## 3. Files to Create/Modify

### New Files (4)

| File | Purpose |
|------|---------|
| `src/lib/ingestion/pdf-text-extractor.ts` | PDF → text extraction + cleaning |
| `src/lib/ingestion/resume-ingest-pipeline.ts` | Shared pipeline logic (extracted from route) |
| `src/app/api/ingest/resume/pdf/route.ts` | New API route for PDF upload |
| `docs/ARCHITECTURE_RESUME_UPLOAD.md` | Architecture documentation |

### Modified Files (3)

| File | Change |
|------|--------|
| `src/app/api/ingest/resume/route.ts` | Refactor to use shared pipeline function |
| `src/components/resume-upload.tsx` | Add PDF upload UI (tab toggle + file input) |
| `docs/TRACKER.md` | Add Slice 12D checklist |

### Dependency Change (1)

| File | Change |
|------|--------|
| `package.json` | Add `pdf-parse` dependency |

**Total: 4 new + 3 modified + 1 dependency = 8 files**

---

## 4. Implementation Steps (Ordered)

### Step 1: Add dependency
```bash
npm install pdf-parse
```
Also install types if available (`@types/pdf-parse` or declare module).

### Step 2: Create `src/lib/ingestion/pdf-text-extractor.ts`
- `extractTextFromPdf(buffer: Buffer): Promise<string>`
- Validate PDF magic bytes (`%PDF`)
- Call `pdf-parse` to extract text
- Clean text: collapse whitespace, remove control chars, trim
- Throw descriptive error if extraction yields empty text

### Step 3: Create `src/lib/ingestion/resume-ingest-pipeline.ts`
- Extract steps 3–10 from existing route into:
  ```ts
  export async function ingestResumeText(
    supabase: SupabaseClient,
    resumeText: string
  ): Promise<IngestResult>
  ```
- Returns the same shape as current API response body
- Handles all error cases with typed errors (not HTTP responses)

### Step 4: Refactor `src/app/api/ingest/resume/route.ts`
- Keep: auth check, rate limiting, JSON parsing, input validation
- Replace: steps 3–10 with call to `ingestResumeText()`
- Verify: identical behavior (same response shape, same error codes)

### Step 5: Create `src/app/api/ingest/resume/pdf/route.ts`
- Rate limiting + auth check (same as text route)
- Parse FormData, extract file
- Validate: file exists, is PDF (MIME + magic bytes), ≤ 5MB
- Call `extractTextFromPdf(buffer)`
- Validate extracted text length ≥ 50 chars
- Call `ingestResumeText(supabase, extractedText)`
- Return same IngestResult shape

### Step 6: Update `src/components/resume-upload.tsx`
- Add mode toggle: "Paste Text" | "Upload PDF"
- PDF mode: file input (accept=".pdf"), file size client-side check
- Submit PDF via FormData to `/api/ingest/resume/pdf`
- Show same result UI for both modes
- Loading/error states for both modes

### Step 7: Create `docs/ARCHITECTURE_RESUME_UPLOAD.md`
- Flow diagram (text version of §2.1)
- UI flow description
- Backend flow description
- Security constraints
- Future improvements (DOCX support)

### Step 8: Update `docs/TRACKER.md`
- Add Slice 12D with checklist items

---

## 5. Acceptance Criteria

- [ ] Employee can paste text (existing behavior unchanged)
- [ ] Employee can upload a `.pdf` file and have skills extracted
- [ ] PDF > 5MB is rejected with clear error
- [ ] Non-PDF files are rejected
- [ ] Empty/unreadable PDFs show clear error
- [ ] Loading state shown during PDF processing
- [ ] Success result is identical format for both paste and PDF
- [ ] `npm run build` passes
- [ ] No changes to: matching logic, embedding generation, skill extraction prompts, database schema
- [ ] Architecture doc created
- [ ] Tracker updated

---

## 6. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `pdf-parse` fails on some PDFs (image-only, encrypted) | Medium | Show clear error message; document limitation |
| PDF text extraction is slow for large files | Low | 5MB limit + server-side processing; pdf-parse is fast for text extraction |
| `pdf-parse` types missing | Low | Create local type declaration if `@types/pdf-parse` unavailable |
| Refactoring shared pipeline introduces regression | Low | Extract logic identically; verify same response shape; test both paths |

---

## 7. Future Improvements (Out of Scope)

- DOCX support (would need `mammoth` or similar)
- OCR for image-based PDFs (would need Tesseract or cloud OCR)
- Drag-and-drop upload zone
- Resume preview before submission
- Multiple file formats in single upload flow

---

## 8. Slice 12D — Tracker Checklist (to add)

```markdown
## Slice 12D — Resume PDF Upload

### Backend
- [ ] Add `pdf-parse` dependency
- [ ] Create PDF text extractor (`src/lib/ingestion/pdf-text-extractor.ts`)
- [ ] Extract shared pipeline logic (`src/lib/ingestion/resume-ingest-pipeline.ts`)
- [ ] Refactor existing text route to use shared pipeline
- [ ] Create PDF upload route (`/api/ingest/resume/pdf`)
- [ ] Security: file size limit (5MB), PDF-only validation, magic bytes check
- [ ] Error handling: empty PDF, extraction failure, auth

### Frontend
- [ ] Add paste/upload toggle to ResumeUpload component
- [ ] PDF file input with .pdf filter
- [ ] Client-side file size validation
- [ ] Loading state for PDF upload
- [ ] Error display for PDF-specific failures
- [ ] Same result UI for both modes

### Documentation
- [ ] Create `docs/ARCHITECTURE_RESUME_UPLOAD.md`
- [ ] Update `docs/TRACKER.md` with Slice 12D

### Verification
- [ ] `npm run build` passes
- [ ] Test: paste text still works (regression)
- [ ] Test: upload valid PDF → skills extracted
- [ ] Test: upload >5MB PDF → rejected
- [ ] Test: upload non-PDF → rejected
- [ ] Test: upload image-only PDF → graceful error
```
