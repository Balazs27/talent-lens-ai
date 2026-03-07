# Skill Ingestion Refactor Plan — TalentLens AI

## Purpose

This document defines the intended implementation direction for fixing structured skill ingestion in TalentLens AI.

The goal is to make sure skills extracted from resumes and job descriptions are consistently normalized, resolved to canonical skills, created if missing, and linked into structured bridge tables so the deterministic matching layer has complete input data.

---

## Primary Goal

Refactor skill ingestion so that both resume and job pipelines use a shared process:

1. extract skills from text
2. normalize extracted skill strings
3. resolve to existing canonical skill or alias
4. auto-create skill if missing
5. insert into `resume_skills` or `job_skills`
6. preserve relevant metadata
7. allow deterministic matching to operate on complete structured data

---

## Non-Goals

This refactor is **not** intended to:

- redesign the hybrid scoring formula
- replace deterministic matching with semantic-only matching
- remove the `skills` table
- build a full ontology / taxonomy engine
- add advanced LLM reasoning ranking in this phase
- implement every possible governance workflow for skill approval

---

## Core Architectural Principles

### 1) Keep the `skills` table

The `skills` table remains the canonical source of truth for structured skills.

---

### 2) Use one shared normalization path

Resume ingestion and job ingestion must not duplicate separate skill resolution logic.

Both should call the same shared normalization / upsert service.

---

### 3) Prefer canonical skills over raw strings

Bridge tables should link to canonical skill IDs, not only raw extracted text.

---

### 4) Support dynamic growth

If a new valid skill is found, the system should be able to create it automatically rather than dropping it.

---

### 5) Do not rewrite scoring until ingestion is fixed

The deterministic engine should first be tested with complete data before any scoring adjustments are made.

---

## Proposed End-State Pipeline

### Resume pipeline

Resume text  
→ LLM extracts skills  
→ normalize each extracted skill  
→ resolve alias / canonical name  
→ create skill if missing  
→ insert structured links into `resume_skills`

### Job pipeline

Job description text  
→ LLM extracts skills  
→ normalize each extracted skill  
→ resolve alias / canonical name  
→ create skill if missing  
→ insert structured links into `job_skills`

---

## Expected Behavior of the Normalization Layer

For each extracted skill candidate:

1. trim whitespace
2. normalize casing for matching
3. remove trivial punctuation noise if appropriate
4. attempt canonical match by name
5. attempt alias match
6. attempt normalized-key match if such logic exists
7. if still missing:
   - create new skill
   - assign fallback metadata
8. return canonical `skill_id`

This logic should be reusable across both ingestion flows.

---

## Suggested Service Responsibilities

A shared service/module should likely handle:

- cleaning raw extracted skill strings
- matching against canonical names
- matching against aliases
- deduplicating extracted skills within a single ingestion event
- creating missing skills
- returning canonical skill records / IDs
- optionally logging decisions for debugging

---

## Suggested Data Behaviors

### Resume ingestion should preserve, where available:

- skill importance
- proficiency
- years of experience
- extraction confidence
- source snippet or evidence text

### Job ingestion should preserve, where available:

- required / preferred / nice-to-have classification
- extraction confidence
- weight / priority
- source snippet if useful

---

## Schema Review Guidance

The existing schema likely already includes the essential tables:

- `skills`
- `resume_skills`
- `job_skills`

The implementation should first confirm whether current columns are already sufficient.

---

## Potential Optional Schema Enhancements

Only add these if they meaningfully help implementation.

### In `skills`
Possible additions:
- `normalized_key`
- `created_by_system`
- `review_status`
- `created_from`
- `is_active`

### In bridge tables
Possible additions:
- `raw_extracted_name`
- `normalization_method`
- `extraction_confidence`
- `source_text_fragment`

These are optional and should only be introduced if the current schema lacks enough traceability.

---

## File / Code Areas To Audit

The implementation work should inspect and likely touch code involved in:

- resume upload and parsing
- job description upload and parsing
- LLM extraction logic
- skill parsing / JSON response handling
- skills lookup helpers
- bridge table insertion helpers
- Supabase DB access layer
- SQL functions / RPCs for matching
- UI components displaying matched / missing skills

---

## Recommended Step-by-Step Implementation Sequence

### Step 1 — Explore and reconstruct the current flow

Identify exactly:

- where resumes are processed
- where jobs are processed
- where LLM skill extraction happens
- where skills are filtered
- where unknown skills are dropped
- whether aliases are used
- where deterministic scoring reads its data from

Deliverable:
- a concrete audit tied to actual files/functions

---

### Step 2 — Confirm the minimum viable schema strategy

Decide whether:
- current tables are enough
- optional migration(s) are worth adding now
- additional fields are needed for traceability

Deliverable:
- schema decision with rationale

---

### Step 3 — Design the shared normalization / find-or-create layer

Create a common internal service/function responsible for:

- exact / case-insensitive canonical lookup
- alias lookup
- normalized comparison
- safe auto-creation
- canonical skill ID return

Deliverable:
- implementation blueprint before coding

---

### Step 4 — Refactor resume ingestion to use shared logic

Update resume processing so every extracted skill passes through the shared skill resolution path before insertion into `resume_skills`.

Deliverable:
- complete structured skill insertion for resumes

---

### Step 5 — Refactor job ingestion to use shared logic

Update job processing so every extracted skill passes through the shared skill resolution path before insertion into `job_skills`.

Deliverable:
- complete structured skill insertion for jobs

---

### Step 6 — Deduplication and conflict handling

Ensure the system avoids:

- duplicate skills created with minor formatting differences
- duplicate bridge rows
- conflicting canonical mappings

Deliverable:
- stable ingestion behavior

---

### Step 7 — Verification at DB level

Run queries to confirm:

- new skills are being created when missing
- aliases resolve correctly
- bridge tables contain fuller skill coverage
- match counts improve for real resume/job pairs

Deliverable:
- DB-level evidence of correctness

---

### Step 8 — Verification at UI level

Check that the frontend accurately reflects the updated structured data.

Confirm:
- required skill counts are realistic
- matched / missing lists are not truncated incorrectly
- stale cache is not masking the fix

Deliverable:
- trustworthy UI behavior

---

### Step 9 — Only after verification, reassess scoring

If deterministic scoring still feels off after data completeness is fixed, evaluate whether scoring weights or thresholds need tuning.

This should happen only after ingestion correctness is proven.

---

## Verification Strategy

### DB-level checks

Validate:
- count of skills before and after ingestion
- count of linked `resume_skills`
- count of linked `job_skills`
- presence of newly discovered skills
- correct alias mapping behavior

Example scenarios to test:
- known canonical skill
- alias variant
- unseen new skill
- mixed hard and soft skills

---

### Service-level checks

Validate:
- same input skill always maps consistently
- normalization is case-insensitive where intended
- duplicate creation does not happen across runs
- same resume/job reprocessing does not create duplicate bridge rows

---

### UI-level checks

Validate:
- job required skill count reflects actual extracted requirements
- employee match view reflects real matched/missing skills
- no stale cached match result is being shown
- no regression in match display components

---

## Example Test Scenarios

### Scenario 1 — Previously missing technical skills

Job contains:
- Python
- SQL
- dbt
- Snowflake
- Git

Resume contains:
- Python
- SQL
- dbt
- Git

Expected result:
- structured job skills include all 5
- structured resume skills include all 4
- deterministic matching shows realistic matched/missing breakdown

---

### Scenario 2 — Alias mapping

Resume contains:
- Postgres

Job contains:
- PostgreSQL

Expected result:
- both resolve to same canonical skill
- deterministic matching counts it as matched

---

### Scenario 3 — New unseen skill

Resume or job contains:
- Airbyte

Expected result:
- skill is created automatically if valid
- linked in bridge table
- available for future matching

---

## Risks and Edge Cases

Implementation should explicitly consider:

- vague phrases accidentally treated as skills
- duplicated skills from repeated extraction output
- soft-skill noise
- alias collisions
- malformed LLM output
- stale bridge rows when reprocessing the same entity
- old match results persisting after skill updates

---

## Recommended Documentation Outputs

This refactor should be supported by at least:

- `docs/skill-matching-audit.md`
- `docs/skill-ingestion-refactor-plan.md`

Optional future docs if the project grows:
- `docs/skill-normalization-rules.md`
- `docs/match-verification-checklist.md`

These optional docs are not required for the first refactor pass.

---

## Definition of Done

This refactor is complete when:

1. Both resume and job ingestion use a shared normalization path
2. Unknown valid skills are no longer silently dropped
3. New skills can be created automatically
4. Aliases are actually used in resolution
5. `resume_skills` and `job_skills` reflect much fuller coverage
6. Deterministic matching becomes materially more accurate
7. UI match explanations reflect the improved structured data
8. No major regression is introduced in semantic or hybrid scoring flows