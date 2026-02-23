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
- [ ] (Optional) `embeddings` written
- [x] Errors handled properly (400/401/500)
- [ ] Tested on 3 real resumes

## Slice 2 — Job Ingestion (HR)
- [ ] UI: JD editor page exists
- [ ] API: POST `/api/ingest/job` implemented
- [ ] LLM extraction prompt + schema implemented
- [ ] DB: `jobs` row written + status updates
- [ ] DB: `job_skills` written
- [ ] (Optional) `embeddings` written
- [ ] Tested on 3 real job descriptions

## Slice 3 — Matching (Employee → Jobs)
- [ ] RPC: `match_jobs_for_resume` exists and works
- [ ] Similarity floor implemented
- [ ] Deterministic overlap scoring implemented
- [ ] Weighted score implemented
- [ ] UI: ranked jobs list shown for a resume
- [ ] Missing skills displayed
- [ ] Results look plausible on real data

## Slice 4 — Matching (HR → Candidates)
- [ ] RPC: `match_candidates_for_job` exists and works
- [ ] Deterministic overlap scoring implemented
- [ ] UI: ranked candidates list for a job
- [ ] Explainability shown (overlap + missing)
- [ ] Results look plausible on real data

## Slice 5 — Gap Analysis
- [ ] UI: “Analyze gap” button exists
- [ ] API: POST `/api/analyze/gap` implemented
- [ ] Deterministic gap list works
- [ ] (Optional) LLM recommendations integrated
- [ ] Cached or computed efficiently

## Slice 6 — Polish & Demo Readiness
- [ ] Loading states everywhere needed
- [ ] No obvious security issues (XSS, secrets)
- [ ] README is accurate (setup + env vars)
- [ ] Deployed to Vercel
- [ ] Demo script prepared