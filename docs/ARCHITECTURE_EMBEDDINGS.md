# Embeddings Architecture (Slice 7)

## Purpose
Add semantic representations for resumes and jobs to enable semantic similarity matching in later slices.

## Storage
- resumes.embedding (vector(1536))
- jobs.embedding (vector(1536))

## Model
- OpenAI `text-embedding-3-small` (1536 dimensions)

## Ingestion
- On resume ingest: embed resume raw_text and store in resumes.embedding
- On job ingest: embed job raw_text and store in jobs.embedding

## Indexing
- Use ivfflat index on embedding columns (cosine distance)
- Backfill embeddings for existing rows with NULL embeddings

## Non-goals
- No changes to match scoring or UI in Slice 7