# TalentLens AI — Build Tracker (V1)

Use this checklist to track progress. Agents must update it as work is completed.

## Slice 0 — Foundations
- [x] Supabase project created (hosted or local)
- [x] Migrations applied (extensions, profiles, baseline tables)
- [x] Auth working in Next.js (login/signup/logout)
- [x] Role stored in `profiles` (employee/hr)
- [x] Middleware enforces role-based routing
- [x] Employee dashboard page loads
- [x] HR dashboard page loads
- [x] Manual test documented (steps + expected behavior)

## Slice 1 — Resume Ingestion (Employee)
- [x] UI: resume paste/upload page exists
- [x] API: POST `/api/ingest/resume` implemented
- [x] LLM extraction prompt + schema implemented
- [x] Skill normalization implemented (taxonomy lookup + alias mapping)
- [x] DB: `resumes` row written + status updates
- [x] DB: `resume_skills` written
- [x] (Optional) `embeddings` written
- [x] Errors handled properly (400/401/500)
- [x] Tested on 3 real resumes

## Slice 1.1 — Single Active Resume (SCD2) (Employee)

- [x] DB: Add `resumes.is_active` boolean (default true) via migration (`00013_resume_is_active.sql`)
- [x] DB: Backfill so each user has exactly 1 active resume (latest = true, others = false)
- [x] DB: Add partial unique index (one active resume per user where `is_active=true`)
- [x] API: Resume upload deactivates previous resumes before inserting new active resume (atomic via `insert_active_resume` RPC)
- [x] DB: `resume_skills` always tied to the newly created `resume_id` only
- [x] Matching: Employee job matching uses active resume only (`employee/matches`, `employee/skills`, `employee/dashboard`, `api/match/jobs` — all use `.eq("is_active", true)`)
- [x] Matching: HR candidate matching does not duplicate candidates due to old resumes (`match_candidates_for_job` RPC filters `r.is_active = true`; HR dashboard candidate count filtered)
- [x] RLS/Queries: No queries fetch `resume_skills` by `user_id` (must be by active `resume_id`)
- [x] Verification: SQL checks + manual test checklist (upload 2–3 resumes, confirm 1 active)

## Slice 2 — Job Ingestion (HR)
- [x] UI: JD editor page exists
- [x] API: POST `/api/ingest/job` implemented
- [x] LLM extraction prompt + schema implemented
- [x] DB: `jobs` row written + status updates
- [x] DB: `job_skills` written
- [x] (Optional) `embeddings` written
- [x] Tested on 3 real job descriptions

## Slice 3 — Matching (Employee → Jobs)
- [x] RPC: `match_jobs_for_resume` exists and works
- [x] Deterministic overlap scoring implemented
- [x] Weighted score implemented (required*3, preferred*1, nice_to_have*0.5, missing_required*-4)
- [x] UI: ranked jobs list shown for a resume
- [x] Missing skills displayed
- [ ] Results look plausible on real data

## Slice 3.1 — Match Quality & Gap Alignment

- [x] Employee match RPC filters score > 0 (`match_jobs_for_resume` — HAVING clause added in 00014)
- [x] Gap analysis RPC aligned with matching logic (`get_gap_analysis` — skill presence check fixed in 00014)
- [x] Gap readiness % reflects required skill coverage (absent skills now always classified as missing)
- [x] Negative matches no longer shown to employee
- [x] Empty state UX improved for 0 matches ("No strong matches" + "Update Resume" link)

## Slice 4 — Matching (HR → Candidates)
- [x] RPC: `match_candidates_for_job` exists and works
- [x] Deterministic overlap scoring implemented
- [x] UI: ranked candidates list for a job
- [x] Explainability shown (overlap + missing)
- [x] HR jobs listing page with "View Candidates" links
- [ ] Results look plausible on real data

## Slice 5 — Gap Analysis
- [x] UI: “Analyze gap” button exists
- [x] API: POST `/api/analyze/gap` implemented
- [x] Deterministic gap list works
- [x] LLM recommendations integrated (structured JSON)
- [x] Cached or computed efficiently

## Slice 6 — Polish & Demo Readiness
### 6A — Small Enhancements (Functional polish)
- [x] HR: Fix “View Candidates” routing (no 404)
- [x] HR: Add Invite button on candidate cards (UI-only toast)
- [x] HR: Dashboard tiles not empty + copy fixes (“Job description processing”)
- [x] HR: "View Candidates" CTA after job extraction
- [x] Employee: Add Apply button on matches cards (UI-only toast)
- [x] Employee: Job description modal (click job title/card)
- [x] Employee: “View Matches” CTA after resume extraction
- [x] Employee: My Skills page wired to latest resume skills
- [ ] Global: Better empty states + subtle loading polish

### 6A.2 — Layout Corrections
- [x] Move Invite / Apply / Analyze Gap buttons to right side of cards (inline with header)
- [x] Ensure cards expand vertically slightly for better spacing
- [x] Maintain consistent spacing and alignment
- [x] HR Dashboard: Avg. Match Score computed from RPCs
- [x] Employee Dashboard: Real metrics (resumes, matches, skills) from latest resume

### 6B — UI Consistency (Visual)
- [x] Better spacing and alignment across pages
- [x] Consistent button styles & card layout
- [x] Improve score badges
- [x] Reduce clutter, cleaner gap cards
- [x] Ensure typography consistency

### 6C — Landing Page (Hard requirement)
- [x] Landing page exists (modern SaaS look)
- [x] Hero + product explanation + CTA to Login
- [x] Accessible from root `/`
- [x] Works on desktop + mobile

### Deployment + Demo
- [x] No obvious security issues (XSS, secrets)
- [x] README is accurate (setup + env vars)
- [x] Deployed to Vercel
- [x] Demo script prepared (key features to show, talking points)

## Slice 7 — Embedding Infrastructure

- [x] DB: Add `resumes.embedding vector(1536)` (`00015_embeddings.sql`)
- [x] DB: Add `jobs.embedding vector(1536)` (`00015_embeddings.sql`)
- [x] DB: Add ivfflat indexes for both embeddings (cosine ops) + ANALYZE
- [x] API: Resume ingestion generates + stores embedding (non-fatal step 8.5)
- [x] API: Job ingestion generates + stores embedding (non-fatal step 8.5)
- [x] Backfill: `scripts/backfill-embeddings.ts` — embed existing ready rows with NULL embedding
- [x] Verification: SQL checks confirm embeddings populated for new ingests

## Slice 8 — Semantic Match RPC

- [x] DB: Add RPC `match_jobs_semantic(p_resume_id, p_limit)` returning job_id + similarity + basic job fields (`00016_semantic_match_rpc.sql`)
- [x] DB: RPC filters out NULL embeddings (resume and job) and only returns active jobs
- [x] DB: RPC ordered by vector distance (cosine) and limited (default top 20)
- [ ] Verification: SQL smoke test for similarity on real resume/job data
- [ ] Regression: deterministic matching still works unchanged