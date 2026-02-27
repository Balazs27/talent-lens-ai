-- Slice 7: Add embedding columns to resumes and jobs
-- Model: text-embedding-3-small (1536 dimensions)

-- 1. Add embedding column to resumes (nullable — backfilled separately)
ALTER TABLE resumes
  ADD COLUMN embedding vector(1536);

-- 2. Add embedding column to jobs (nullable)
ALTER TABLE jobs
  ADD COLUMN embedding vector(1536);

-- 3. ivfflat index on resumes.embedding (cosine distance)
--    lists=100 is a safe default for small/medium tables
CREATE INDEX idx_resumes_embedding
  ON resumes USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. ivfflat index on jobs.embedding (cosine distance)
CREATE INDEX idx_jobs_embedding
  ON jobs USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 5. Update planner statistics so ivfflat is used efficiently from the start
ANALYZE resumes;
ANALYZE jobs;
