# Semantic Matching Architecture (Slice 8)

## Goal
Return semantically similar jobs for a resume using pgvector embeddings.

## Inputs
- Resume embedding: resumes.embedding
- Job embedding: jobs.embedding

## Similarity
Cosine similarity:
- distance = (job.embedding <=> resume.embedding)
- similarity = 1 - distance

## RPC
- match_jobs_semantic(p_resume_id UUID, p_limit INT default 20)
  - excludes NULL embeddings
  - filters jobs to is_active=true (or equivalent)
  - returns top p_limit by smallest distance (highest similarity)

## Non-goals
- No hybrid reranking (Slice 9)
- No UI changes required