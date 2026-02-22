# TalentLens AI — Development Plan (V1)

This plan is optimized for **shipping a working demo fast** using vertical slices.
Each slice ends with something clickable and testable.

## Principles
- Build **vertical slices** (DB → API → UI → verify).
- Keep scope tight. Avoid overengineering early.
- Prioritize the “magic loop”: resume upload ↔ job posting ↔ matching results.

---

## Slice 0 — Foundations
**Goal:** You can log in and see different pages for employee vs HR.

**Includes**
- Supabase Auth wired into Next.js
- Profiles table is populated / role assigned
- Route groups: `(employee)` and `(hr)`
- Role-based routing guard in middleware

**Done when**
- You can sign up/login
- You can set a user role (employee/hr)
- Employee can access employee dashboard
- HR can access HR dashboard
- Unauthorized role access redirects cleanly

---

## Slice 1 — Resume Ingestion (Employee)
**Goal:** Employee can paste resume text and get extracted skills stored.

**Includes**
- POST `/api/ingest/resume`
- Insert into `resumes`, `resume_skills`
- Optional embedding insert into `embeddings`
- Employee UI: paste + submit + results view
- Status handling: pending/ready/error

**Done when**
- Works on 3 real resumes (messy text)
- Extracted skills display + persisted
- Errors return correct status codes

---

## Slice 2 — Job Ingestion (HR)
**Goal:** HR can paste JD and get extracted requirements stored.

**Includes**
- POST `/api/ingest/job`
- Insert into `jobs`, `job_skills`
- Optional embedding insert
- HR UI: paste + submit + view JD requirements

**Done when**
- Works on 3 real job descriptions

---

## Slice 3 — Matching (Employee → Jobs)
**Goal:** Employee sees ranked jobs based on vector similarity + skill overlap.

**Includes**
- RPC `match_jobs_for_resume`
- Deterministic overlap score + weighted score
- Employee UI: ranked list + missing skills

**Done when**
- Rankings are plausible
- Similarity floor prevents garbage matches

---

## Slice 4 — Matching (HR → Candidates)
**Goal:** HR sees ranked candidates for a job.

**Includes**
- RPC `match_candidates_for_job`
- Candidate ranking UI
- Explainable overlap + missing skills

**Done when**
- HR can click a job and see ranked candidates

---

## Slice 5 — Gap Analysis (On-demand)
**Goal:** “Analyze gap” provides actionable view.

**Options**
- V1: deterministic gap list (job skills minus resume skills)
- V1.5: LLM recommendations + time-to-close

**Done when**
- Click → results within a few seconds
- Output is structured and readable

---

## Slice 6 — Polish & Demo Readiness
- loading states
- error handling
- basic caching to `match_scores`
- nicer UI
- deployment checklist

---

## Working Agreement with Agents
- Agents must implement **one slice per task**.
- Agents must update `docs/TRACKER.md`.
- If scope expands beyond slice definition, pause and propose trade-offs.