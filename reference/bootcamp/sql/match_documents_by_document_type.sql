-- BOOTCAMP REFERENCE — Do not import into TalentLens production code.
--
-- Cosine similarity search filtered by a single document type.
-- Evolution of match_documents.sql — adds a WHERE clause for type filtering.
-- The partial HNSW indexes (see indices/) make this filter efficient.
--
-- TalentLens adaptation notes:
--   - Filter column: document_type → source_type (ENUM, not TEXT)
--   - Add JOIN to resumes or jobs table for metadata
--   - Add similarity_floor parameter

create or replace function match_documents_by_document_type(
  query_embedding vector(1536),
  query_document_type TEXT,
  match_count int default 10
)
returns table (
  id text,
  context text,
  user_id int,
  document_type text,
  similarity float
)
language sql stable
as $$
  select
    id,
    context,
    user_id,
    document_type,
    1 - (embedding <=> query_embedding) as similarity
  from rag_content
  WHERE document_type = query_document_type
  order by embedding <=> query_embedding
  limit match_count;
$$;
