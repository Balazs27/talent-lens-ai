-- BOOTCAMP REFERENCE — Do not import into TalentLens production code.
--
-- IVFFlat index for approximate nearest neighbor search.
-- KEY PATTERN: SET LOCAL maintenance_work_mem before creating the index.
-- Without this, large index builds will fail or be extremely slow.
--
-- TalentLens adaptation notes:
--   - Table: rag_content → embeddings
--   - lists = 100 is a reasonable starting point. Rule of thumb: sqrt(num_rows) for lists.
--   - For < 10K rows, HNSW is usually better. Consider IVFFlat only at 100K+ rows.

BEGIN;
-- WE need more memory to actually create this index!
SET LOCAL maintenance_work_mem = '128MB';
CREATE INDEX ivff_index
  ON rag_content USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
COMMIT;
