-- Slice 8: Semantic similarity match RPC for employee job matching
-- Uses pgvector cosine distance (<=> operator, vector_cosine_ops index)

CREATE OR REPLACE FUNCTION match_jobs_semantic(
    p_resume_id UUID,
    p_limit     INT DEFAULT 20
)
RETURNS TABLE (
    job_id      UUID,
    title       TEXT,
    company     TEXT,
    location    TEXT,
    seniority   TEXT,
    similarity  REAL,
    created_at  TIMESTAMPTZ
)
LANGUAGE sql STABLE
AS $$
    WITH resume AS (
        SELECT embedding
        FROM resumes
        WHERE id = p_resume_id
          AND embedding IS NOT NULL
    )
    SELECT
        j.id                                          AS job_id,
        j.title,
        j.company,
        j.location,
        j.seniority,
        (1 - (j.embedding <=> r.embedding))::REAL     AS similarity,
        j.created_at
    FROM jobs j, resume r
    WHERE j.embedding IS NOT NULL
      AND j.is_active = true
      AND j.status    = 'ready'
    ORDER BY j.embedding <=> r.embedding   -- ASC distance = DESC similarity
    LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION match_jobs_semantic(UUID, INT) TO authenticated;
