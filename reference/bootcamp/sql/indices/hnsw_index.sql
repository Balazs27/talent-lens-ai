-- BOOTCAMP REFERENCE — Do not import into TalentLens production code.
--
-- HNSW index for approximate nearest neighbor search with cosine similarity.
-- HNSW is generally preferred over IVFFlat for most workloads:
--   - Better recall at the same speed
--   - No need to specify number of lists
--   - Works well even with small datasets
--
-- TalentLens adaptation notes:
--   - Table: rag_content → embeddings
--   - Prefer the partial indexes (see job_index.sql, profile_index.sql) over this full-table index

CREATE INDEX hnsw_index ON rag_content USING hnsw (embedding vector_cosine_ops);
