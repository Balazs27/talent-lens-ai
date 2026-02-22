-- BOOTCAMP REFERENCE — Do not import into TalentLens production code.
--
-- PARTIAL HNSW index — only indexes rows where document_type = 'profile'.
-- Same pattern as job_index.sql but for the other document type.
--
-- TalentLens adaptation notes:
--   - Table: rag_content → embeddings
--   - Filter: document_type = 'profile' → source_type = 'resume'
--   - TalentLens schema: CREATE INDEX idx_embed_resume_hnsw
--       ON embeddings USING hnsw (embedding vector_cosine_ops)
--       WHERE source_type = 'resume';

CREATE INDEX profile_hnsw_index ON rag_content USING hnsw (embedding vector_cosine_ops)
WHERE document_type = 'profile';
