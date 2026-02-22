-- BOOTCAMP REFERENCE — Do not import into TalentLens production code.
--
-- Basic cosine similarity search via pgvector.
-- KEY PATTERN: ORDER BY the distance operator (<=>), not the computed similarity column.
-- This ensures the HNSW/IVFFlat index is used. Ordering by an aliased column prevents index usage.
--
-- TalentLens adaptation notes:
--   - Table: rag_content → embeddings
--   - Columns: context/user_id/document_type → join to resumes/jobs tables
--   - Add similarity_floor parameter
--   - See talentlens-ai-architecture.md for final versions:
--     match_candidates_for_job() and match_jobs_for_resume()

create or replace function match_documents(
  query_embedding vector(1536),
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
  order by embedding <=> query_embedding
  limit match_count;
$$;
