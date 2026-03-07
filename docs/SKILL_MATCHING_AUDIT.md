# Skill Matching Audit — TalentLens AI

## Purpose

This document explains the current issue in the TalentLens AI skill matching engine, reconstructs the likely root cause, and defines the architectural direction for the fix.

This is not a request to rewrite the entire matching engine.

The key conclusion is:

> The hybrid matching architecture is fundamentally correct.  
> The main issue is incomplete structured skill ingestion upstream.

---

## Executive Summary

TalentLens AI currently uses a hybrid matching engine composed of:

1. **Deterministic skill matching**
2. **Semantic similarity using embeddings**
3. **Hybrid scoring combining both**

The deterministic layer depends on structured skill data stored in:

- `skills`
- `resume_skills`
- `job_skills`

The current issue appears to be that extracted skills are only inserted into `resume_skills` / `job_skills` if they already exist in the `skills` dictionary.

Because the `skills` dictionary is currently very small and manually seeded, many real-world skills extracted from resumes and job descriptions are likely being dropped before insertion.

As a result:

- deterministic matching sees only a subset of actual skills
- UI skill match counts are misleading
- semantic matching still works reasonably well
- the hybrid score still functions, but with incomplete deterministic input

---

## Current Matching Architecture

### 1) Deterministic Skill Matching

The deterministic layer compares structured skills between:

- `resume_skills`
- `job_skills`

This produces values like:

- matched required skills
- matched preferred skills
- missing required skills

A weighted score is then computed, for example:

- required match = high positive weight
- preferred match = lower positive weight
- nice-to-have match = smaller positive weight
- missing required = large negative weight

This layer is explainable and useful, assuming the structured skill data is complete.

---

### 2) Semantic Similarity

The semantic layer compares vector embeddings from:

- `resumes.embedding`
- `jobs.embedding`

Often this is done using pgvector similarity logic such as:

- cosine similarity
- inner product
- distance converted into similarity

This layer can still perform reasonably well even if individual structured skills are missing, because the embedding captures overall textual meaning.

---

### 3) Hybrid Score

The final match score combines:

- deterministic score
- semantic similarity

Example weighting:

- 60% deterministic
- 40% semantic

This architecture is reasonable for V1 and does not appear to be the core issue.

---

## Reconstructed Root Cause

The likely current ingestion flow works like this:

1. Resume or job description text is uploaded
2. LLM extracts skills from the text
3. For each extracted skill:
   - the system checks whether it already exists in the `skills` table
4. If the skill exists:
   - it is inserted into `resume_skills` or `job_skills`
5. If the skill does not exist:
   - it is ignored or dropped

This means the pipeline becomes:

LLM extraction  
→ dictionary filter  
→ bridge table insertion

Instead of:

LLM extraction  
→ normalization  
→ canonical lookup / alias resolution  
→ create missing skill if needed  
→ bridge table insertion

---

## Observable Symptom

A job description may contain many required skills such as:

- Python
- SQL
- Snowflake
- dbt
- Git
- English
- Communication
- Analytical skills

But the UI may only show:

- Python
- SQL

This suggests only those two skills exist in the dictionary and therefore only those two made it into `job_skills`.

The result is a misleading skill count such as:

- `2 / 2 required matched`

when the actual job may require far more structured skills.

---

## Why the Matching Engine Itself Is Not the Main Problem

The current matching design is actually strong for an early-stage product because it already includes:

- structured skill matching
- semantic similarity
- weighted hybrid scoring
- explainable matched / missing skill lists

The failure point is not primarily the scoring formula.

The failure point is that the deterministic layer is only as good as the data fed into it.

Right now, that structured data appears incomplete.

---

## Why the `skills` Table Should Not Be Removed

It may be tempting to remove the `skills` table and store extracted skill strings directly.

That would be a mistake.

The `skills` table provides essential value:

### 1) Canonical normalization

Examples:

- `Postgres`
- `postgresql`
- `PostgreSQL DB`

All should ideally map to one canonical skill.

---

### 2) Alias handling

A dictionary supports alias mapping such as:

- `py` → `Python`
- `js` → `JavaScript`
- `gcp` → `Google Cloud Platform`

---

### 3) Analytics and product defensibility

A structured skill dictionary enables future analysis like:

- most demanded skills
- most missing skills
- skill gap trends across users
- company-wide talent intelligence

Without a dictionary, this becomes messy and much less reliable.

---

## Important Existing Schema Signal

The schema already includes a valuable hint:

- `skills.aliases`

That suggests the system was already designed with normalization in mind.

The missing piece is likely not schema capability, but implementation.

---

## Architectural Diagnosis

### The system is not fundamentally broken

The current architecture is directionally correct.

### The real issue is data incompleteness

The dictionary is too small, and ingestion likely drops unknown extracted skills.

### The single highest-value fix

Implement a **dynamic skill dictionary** with:

- normalization
- alias resolution
- auto skill creation
- shared ingestion logic for resumes and jobs

---

## Target Architecture

The desired flow should be:

### Skill Extraction Layer
LLM extracts skill candidates from raw text.

### Skill Normalization Layer
Each extracted skill is normalized using:
- string cleanup
- canonical matching
- alias resolution
- case-insensitive comparison

### Dynamic Skill Dictionary Layer
If the skill does not exist:
- create it automatically in `skills`

### Structured Skill Graph
Store relationships in:
- `resume_skills`
- `job_skills`

### Matching Layer
Run:
- deterministic structured matching
- semantic similarity
- optional future LLM reasoning

---

## What the Fix Should Achieve

After the fix, if a job description includes:

- SQL
- Python
- dbt
- Snowflake
- Git
- English
- Communication
- Analytical skills

those skills should actually be represented in `job_skills`.

Then deterministic matching can correctly report values like:

- matched required skills
- missing required skills
- matched preferred skills

rather than reflecting only the tiny manually seeded subset.

---

## Non-Goals

This effort should **not** focus on:

- rewriting the hybrid formula first
- removing the `skills` table
- replacing structured matching with semantic-only matching
- building a complex ontology or skill graph engine immediately
- adding advanced LLM reasoning before ingestion is fixed

---

## Risks to Watch For

When implementing the fix, watch for:

- duplicate canonical skills
- alias collisions
- case sensitivity issues
- punctuation / whitespace variants
- duplicate bridge rows
- stale match results after re-ingestion
- UI caching / stale reads
- over-creation of noisy skills like vague soft skills or sentence fragments

---

## Key Implementation Direction

The preferred implementation approach is:

1. Explore the current codebase
2. Reconstruct the actual ingestion path
3. Identify where skills are dropped
4. Add shared normalization + find-or-create logic
5. Refactor both resume and job ingestion to use it
6. Verify deterministic matching improves without changing the scoring engine

---

## Expected End State

After implementation, TalentLens should have:

- a growing dynamic skill dictionary
- better structured match coverage
- more accurate deterministic scoring
- better gap analysis
- more trustworthy HR and employee UI experience
- a stronger long-term data asset in the form of a skill graph