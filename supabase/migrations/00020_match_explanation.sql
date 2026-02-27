-- Slice 12B: Match Explanation Layer
-- Creates match_explanation_cache table and get_match_scores helper RPC.

-- ─── Cache table ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS match_explanation_cache (
    job_id      UUID        NOT NULL,
    resume_id   UUID        NOT NULL,
    mode        TEXT        NOT NULL CHECK (mode IN ('employee', 'hr')),
    explanation JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (job_id, resume_id, mode)
);

CREATE INDEX idx_explanation_cache_created_at
ON match_explanation_cache (created_at);

-- RLS (mirrors gap_analysis_cache policies)
ALTER TABLE match_explanation_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY explanation_cache_employee_select
ON match_explanation_cache
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM resumes
        WHERE resumes.id = match_explanation_cache.resume_id
          AND resumes.user_id = auth.uid()
    )
);

CREATE POLICY explanation_cache_hr_select
ON match_explanation_cache
FOR SELECT
USING (public.is_hr());


-- ─── Score helper RPC ─────────────────────────────────────────────────────────
-- Returns hybrid + deterministic + semantic scores + job title for a single pair.
-- Uses same weighting formula as the match RPCs (req*3, pref*1, nth*0.5, missing_req*-4).

CREATE OR REPLACE FUNCTION get_match_scores(p_job_id UUID, p_resume_id UUID)
RETURNS TABLE (
    title                           TEXT,
    hybrid_score                    REAL,
    deterministic_score_normalized  REAL,
    semantic_similarity             REAL
)
LANGUAGE sql STABLE
AS $$
WITH

skill_matches AS (
    SELECT
        js.importance,
        CASE WHEN rs.skill_id IS NOT NULL THEN 1 ELSE 0 END AS is_matched
    FROM job_skills js
    LEFT JOIN resume_skills rs
        ON rs.skill_id  = js.skill_id
        AND rs.resume_id = p_resume_id
    WHERE js.job_id = p_job_id
),

det AS (
    SELECT
        (
            COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 1) * 3
          + COUNT(*) FILTER (WHERE importance = 'preferred'    AND is_matched = 1) * 1
          + COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1) * 0.5
          - COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 0) * 4
        )::REAL AS score,
        (
            COUNT(*) FILTER (WHERE importance = 'required')     * 3
          + COUNT(*) FILTER (WHERE importance = 'preferred')    * 1
          + COUNT(*) FILTER (WHERE importance = 'nice_to_have') * 0.5
        )::REAL AS max_score
    FROM skill_matches
)

SELECT
    j.title,
    -- Hybrid: 0.6 * det_norm + 0.4 * semantic
    (
        0.6 * COALESCE(
            LEAST(GREATEST(d.score, 0.0), d.max_score) / NULLIF(d.max_score, 0.0),
            0.0
        )
      + 0.4 * COALESCE(
            (1.0 - (r.embedding <=> j.embedding))::REAL,
            0.0
        )
    )::REAL AS hybrid_score,
    -- Deterministic: clamped [0,1]
    COALESCE(
        LEAST(GREATEST(d.score, 0.0), d.max_score) / NULLIF(d.max_score, 0.0),
        0.0
    )::REAL AS deterministic_score_normalized,
    -- Semantic: cosine similarity [0,1]; 0.0 when either embedding is NULL
    COALESCE(
        (1.0 - (r.embedding <=> j.embedding))::REAL,
        0.0
    ) AS semantic_similarity
FROM det d
JOIN jobs    j ON j.id = p_job_id
JOIN resumes r ON r.id = p_resume_id;
$$;

GRANT EXECUTE ON FUNCTION get_match_scores(UUID, UUID) TO authenticated;
