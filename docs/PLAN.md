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
**Goal:** Employee sees ranked jobs based on skill overlap.

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

**Includes**
- Deterministic gap list (job skills minus resume skills)
- LLM recommendations + time-to-close (structured JSON)
- Cache layer for speed

**Done when**
- Click → results within a few seconds
- Output is structured and readable

---

## Slice 6 — Polish & Demo Readiness

### 6A — Small Enhancements (Functional)
**Goal:** No broken routes; demo feels complete.
- Fix HR "View Candidates" routing
- Add HR Invite button (UI-only toast)
- Improve HR/Employee dashboards (avoid empty state)
- Employee Apply button (UI-only toast)
- Employee job description modal
- Employee “View Matches” CTA after resume extraction
- Wire "My Skills" page

### 6A.2 — Layout Corrections
- Move Invite / Apply / Analyze Gap buttons to right side of cards (inline with header)
- Ensure cards expand vertically slightly for better spacing
- Maintain consistent spacing and alignment

### 6B — UI Consistency (Visual)
**Goal:** Consistent spacing, cards, buttons, badges, typography.

### 6C — Landing Page (Hard requirement)
**Goal:** Modern SaaS landing page at `/` with CTA to login.

**Important demo rule (V1): Latest resume**
Because a user may have multiple resumes, all Employee-side views must use the **latest resume**:
- `ORDER BY resumes.created_at DESC LIMIT 1`
Show label: “Using latest resume”
(No schema changes; “active resume” is V2.)

---

## Working Agreement with Agents
- Agents must implement **one scoped task per run**.
- Agents must update `TRACKER.md`.
- If scope expands beyond definition, pause and propose trade-offs.
- Read `POLISH.md` during Slice 6 work to avoid drift.