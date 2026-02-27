# Hybrid Scoring Architecture (Slice 9)

## Inputs
- Deterministic overlap from job_skills vs resume_skills
- Semantic similarity from pgvector embeddings (cosine)

## Outputs
- deterministic_score_raw (existing)
- deterministic_score_normalized (0–1)
- semantic_similarity (0–1)
- hybrid_score (weighted blend)

## Default weights
- deterministic: 0.6
- semantic: 0.4

## Filtering
- Return only meaningful matches:
  - `hybrid_score >= 0.35` (initial default, tune later)
  - Or return top 20 with an optional floor

## Non-goals
- No UI changes required in Slice 9
- No LLM reranking in Slice 9