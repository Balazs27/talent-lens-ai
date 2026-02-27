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

## Slice 9 — Hybrid Scoring

- [x] DB: Update `match_jobs_for_resume` to include `semantic_similarity` (`00017_hybrid_scoring.sql`)
- [x] DB: Add `deterministic_score_normalized` (0–1, clamped + normalized by max_possible_score)
- [x] DB: Add `hybrid_score` (0.6 × det_norm + 0.4 × semantic; 0.0 fallback when embeddings absent)
- [x] DB: Update filtering logic to use `hybrid_score >= 0.35`, ORDER BY hybrid_score DESC, LIMIT 20
- [x] Verification: SQL smoke tests show chef resume returns 0 matches / low hybrid_score for tech jobs
- [x] Verification: Tech resume ranks relevant tech jobs higher than unrelated jobs
- [ ] Regression: HR matching RPC unchanged; gap analysis unchanged

## Slice 10.1 — Thresholding & Tiers

- [x] Define thresholds for Strong/Potential/Weak matches (Strong ≥0.60, Potential 0.45–0.60, Weak 0.35–0.45)
- [x] Default view hides weak matches
- [x] Optional toggle: “Show weak matches” (client state in `MatchList`)
- [x] Tier computed in UI from `hybrid_score` — no DB change needed

## Slice 10.2 — UI Update (Hybrid Match UX)

- [x] Employee matches cards show Match % (`Math.round(hybrid_score * 100)`)
- [x] Remove raw score display from UI (`score` prop removed from `JobMatchCard`)
- [x] Show `X / Y required` matched count and missing required prominently
- [x] Tier pill badge on each card (Strong/Potential/Weak)
- [x] Sorting by `hybrid_score` (RPC already orders DESC)
- [ ] Verify gap analysis readiness % is consistent with card counts

## Slice 11 — Hybrid Candidate Matching (HR Side)

- [x] DB: Update match_candidates_for_job to include semantic_similarity
- [x] DB: Add deterministic_score_normalized
- [x] DB: Add hybrid_score (same weights as employee)
- [x] DB: Apply HR-specific hybrid threshold (>= 0.30)
- [x] UI: Candidate cards show Match %
- [x] UI: Hide weak candidates by default
- [x] UI: Add "Show weak candidates" toggle
- [x] Verification: Ranking reflects hybrid score
- [x] Regression: Employee matching unaffected

## Slice 12A — Match Exploration UX

### 12A.1 Filters
- [x] Add filter bar (search, location, match %, sort) — `src/components/match-filter-bar.tsx`
- [x] Client-side filtering logic — `src/lib/match-filters.ts`
- [x] Sorting control (hybrid, semantic, deterministic)
- [ ] Persist filter state in URL (optional)

### 12A.2 Card Enhancements
- [x] Add semantic % metric
- [x] Add skill coverage %
- [x] Add top 3 matched skills preview
- [x] Add top 3 missing required preview (named pills replace generic count)
- [x] Tier section headers styled
- [x] Confirm no additional DB queries per card (all data from single RPC call)

### HR Symmetry
- [x] Mirror filters on HR candidate page
- [x] Mirror enhanced card UI

## Slice 12B — LLM Explanation Layer

### Backend
- [x] Create /api/explain/match route (`src/app/api/explain/match/route.ts`)
- [x] Fetch deterministic + hybrid signals (`get_match_scores` RPC + `get_gap_analysis` RPC in parallel)
- [x] Construct grounded prompt (`src/lib/openai/prompts/explain-match.ts`)
- [x] Enforce structured JSON output (Zod schema + forced function calling)
- [x] Implement explanation cache table (`match_explanation_cache` — migration 00020)
- [x] Cache TTL 24h
- [x] Add rate limiting (reuses `src/lib/rate-limit.ts`)

### Frontend
- [x] Add "Explain" button (`src/components/match-explanation-panel.tsx`)
- [x] Loading state (spinner + "Explaining…" label)
- [x] Expandable explanation panel (reasons / gaps / improvements sections)
- [x] Error fallback UI ("Explanation unavailable" on null result)

### Safety
- [x] No hallucinated skill names (skill names from `get_gap_analysis` RPC, server-side only)
- [x] No raw prompt leakage (only structured signals sent to LLM; prompt not exposed to client)
- [x] Employee + HR symmetry

## Slice 12C — Advanced Gap Intelligence

### Backend
- [x] New route `/api/analyze/gap-intelligence` (`src/app/api/analyze/gap-intelligence/route.ts`)
- [x] Add structured skill_plan output (`src/lib/types/gap-intelligence.ts`)
- [x] Add resume_optimization suggestions (prompt + schema)
- [x] Add impact_projection estimation (prompt + schema)
- [x] Add extended cache table (`gap_intelligence_cache` — migration 00021)

### Frontend
- [x] "Deep Analysis" button in gap panel (appears after gap analysis loads, only when missing skills exist)
- [x] Priority roadmap UI (`SkillPlanRoadmap` + `SkillPlanCard` in gap-analysis-panel.tsx)
- [x] Time estimates display (per-skill badge on each SkillPlanCard)
- [x] Projected impact section (`ImpactProjectionCard`)
- [x] Resume optimization list (`ResumeOptimizationList`)

### Safety
- [x] Validate JSON schema (Zod `gapIntelligenceSchema` in `gap-intelligence-analyzer.ts`)
- [x] Prevent hallucinated skills (post-parse hallucination guard validates every skill_plan[].skill against input arrays)
- [x] Handle LLM failure gracefully (non-fatal: returns `intelligence: null`, retry once on parse/validation failure)