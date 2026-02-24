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
- [x] Tested on 3 real resumes

## Slice 2 — Job Ingestion (HR)
- [x] UI: JD editor page exists
- [x] API: POST `/api/ingest/job` implemented
- [x] LLM extraction prompt + schema implemented
- [x] DB: `jobs` row written + status updates
- [x] DB: `job_skills` written
- [ ] (Optional) `embeddings` written
- [x] Tested on 3 real job descriptions

## Slice 3 — Matching (Employee → Jobs)
- [x] RPC: `match_jobs_for_resume` exists and works
- [x] Deterministic overlap scoring implemented
- [x] Weighted score implemented (required*3, preferred*1, nice_to_have*0.5, missing_required*-4)
- [x] UI: ranked jobs list shown for a resume
- [x] Missing skills displayed
- [ ] Results look plausible on real data

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
- [ ] Better spacing and alignment across pages
- [ ] Consistent button styles & card layout
- [ ] Improve score badges
- [ ] Reduce clutter, cleaner gap cards
- [ ] Ensure typography consistency

### 6C — Landing Page (Hard requirement)
- [ ] Landing page exists (modern SaaS look)
- [ ] Hero + product explanation + CTA to Login
- [ ] Accessible from root `/`
- [ ] Works on desktop + mobile

### Deployment + Demo
- [ ] No obvious security issues (XSS, secrets)
- [ ] README is accurate (setup + env vars)
- [ ] Deployed to Vercel
- [ ] Demo script prepared (key features to show, talking points)