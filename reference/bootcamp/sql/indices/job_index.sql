-- BOOTCAMP REFERENCE — Do not import into TalentLens production code.
--
-- PARTIAL HNSW index — only indexes rows where document_type = 'job'.
-- KEY PATTERN: Partial indexes dramatically improve vector search performance
-- when you always filter by type. Without this, a search for job matches
-- scans ALL embeddings (jobs + profiles + everything else).
--
-- TalentLens adaptation notes:
--   - Table: rag_content → embeddings
--   - Filter: document_type = 'job' → source_type = 'job'
--   - TalentLens schema: CREATE INDEX idx_embed_job_hnsw
--       ON embeddings USING hnsw (embedding vector_cosine_ops)
--       WHERE source_type = 'job';

CREATE INDEX job_hnsw_index ON rag_content USING hnsw (embedding vector_cosine_ops)
WHERE document_type = 'job';
