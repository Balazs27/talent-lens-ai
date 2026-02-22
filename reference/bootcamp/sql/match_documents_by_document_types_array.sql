-- BOOTCAMP REFERENCE — Do not import into TalentLens production code.
--
-- Cosine similarity search filtered by an array of document types.
-- Most flexible of the three match functions — accepts TEXT[] for multi-type queries.
-- Uses ANY() for array membership check.
--
-- TalentLens adaptation notes:
--   - TalentLens uses separate RPC functions per source type instead of array filtering
--   - This pattern is still useful if you add more embeddable entity types later

create or replace function match_documents_by_document_types_array(
  query_embedding vector(1536),
  query_document_types TEXT[],
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
  WHERE document_type = ANY(query_document_types)
  order by embedding <=> query_embedding
  limit match_count;
$$;
