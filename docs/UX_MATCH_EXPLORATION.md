# UX_MATCH_EXPLORATION.md
Slice 12A — Match Exploration UX Layer

---

## Purpose

Enhance the match browsing experience for both Employees and HR by:

- Making ranking transparent
- Adding filtering capabilities
- Improving card-level intelligence
- Preserving performance (no extra DB calls)

This layer builds on the hybrid scoring engine (Slice 9–11).

---

# 1. Data Model Assumptions

Each match card receives:

- hybrid_score (0–1)
- deterministic_score_normalized (0–1)
- semantic_similarity (0–1)
- matched_required
- missing_required
- matched_preferred
- matched_nice_to_have
- job metadata (title, company, location, seniority)

No additional DB calls per card are allowed.

All filtering operates client-side on the already fetched result set.

---

# 2. Tier Logic

Tier is derived from hybrid_score.

### Employee thresholds

- Strong:     >= 0.60
- Potential:  0.45 – 0.59
- Weak:       0.30 – 0.44
- Hidden:     < 0.30

Weak matches hidden by default.

---

### HR thresholds

- Strong:     >= 0.60
- Potential:  0.40 – 0.59
- Weak:       0.30 – 0.39
- Hidden:     < 0.30

HR sees slightly broader discovery range.

---

# 3. Coverage Definition

Coverage = matched_required / total_required

This measures strict compliance with required skills only.

It does NOT include preferred or nice-to-have skills.

Purpose:
- Signal minimum qualification
- Provide hard-skill compliance clarity

Displayed as:
- "2 / 2 required"
- "67% coverage"

---

# 4. Semantic Similarity

Semantic similarity is derived from:

1 - cosine_distance(job_embedding, resume_embedding)

Displayed as:
- "54% semantic"

Purpose:
- Signal contextual alignment
- Capture non-keyword similarity

---

# 5. Card Design Structure

## Top Section

- Match % badge (hybrid_score * 100)
- Tier label (Strong / Potential / Weak)
- Job Title
- Company
- Location + seniority chip

## Middle Section

- Required coverage
- Preferred match count (if any)
- Semantic %
- Coverage %

## Bottom Section

- Top 3 matched skills
- Top 3 missing required skills (if any)

No additional DB queries allowed.

---

# 6. Filters Layer (Client-Side)

## Filters

- Search (title/company)
- Location dropdown
- Minimum Match %
- Skill filter (must include skill)
- Sort:
  - Best Match (hybrid)
  - Semantic
  - Deterministic

Filtering operates on in-memory result set.

No RPC changes required.

---

# 7. Performance Rules

- No N+1 calls
- No per-card fetching
- All filtering local
- Hybrid score remains primary ranking

---

# 8. Future Enhancements

- Persist filter state in URL
- Server-side filtering for large datasets
- Analytics on filter usage