-- Slice 11: Upgrade match_candidates_for_job to hybrid scoring
-- Blend: 60% deterministic (normalized) + 40% semantic (pgvector cosine)
-- Filter: hybrid_score >= 0.30, ORDER BY hybrid_score DESC, LIMIT 50

CREATE OR REPLACE FUNCTION match_candidates_for_job(p_job_id UUID)
RETURNS TABLE (
    resume_id                       UUID,
    user_id                         UUID,
    full_name                       TEXT,
    matched_required                INT,
    matched_preferred               INT,
    matched_nice_to_have            INT,
    missing_required                INT,
    score                           REAL,   -- raw deterministic (kept for backward compat)
    deterministic_score_normalized  REAL,   -- clamped [0,1]
    semantic_similarity             REAL,   -- cosine sim [0,1]; 0.0 when embedding absent
    hybrid_score                    REAL    -- 0.6*det_norm + 0.4*semantic
)
LANGUAGE sql STABLE
AS $$
WITH

-- Job embedding (1 row; NULL if not yet generated)
job_vec AS (
    SELECT embedding FROM jobs WHERE id = p_job_id
),

-- Job skill set
job_skill_set AS (
    SELECT skill_id, importance FROM job_skills WHERE job_id = p_job_id
),

-- Max achievable deterministic score for this job (constant across all candidates)
job_max AS (
    SELECT COALESCE(
        SUM(CASE importance
            WHEN 'required'     THEN 3.0
            WHEN 'preferred'    THEN 1.0
            WHEN 'nice_to_have' THEN 0.5
            ELSE 0.0
        END), 0.0
    )::REAL AS max_possible_score
    FROM job_skill_set
),

-- Per-resume per-skill match flags (unchanged from original)
resume_skill_matrix AS (
    SELECT
        r.id AS resume_id,
        r.user_id,
        p.full_name,
        js.skill_id,
        js.importance,
        CASE WHEN rs.skill_id IS NOT NULL THEN 1 ELSE 0 END AS is_matched
    FROM resumes r
    JOIN  profiles p         ON p.id = r.user_id
    CROSS JOIN job_skill_set js
    LEFT JOIN resume_skills rs
        ON rs.resume_id = r.id
        AND rs.skill_id = js.skill_id
    WHERE r.status    = 'ready'
      AND r.is_active = true
),

-- Aggregate per resume: deterministic counts + raw score
det_scores AS (
    SELECT
        resume_id,
        user_id,
        full_name,
        COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 1)::INT AS matched_required,
        COUNT(*) FILTER (WHERE importance = 'preferred'    AND is_matched = 1)::INT AS matched_preferred,
        COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1)::INT AS matched_nice_to_have,
        COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 0)::INT AS missing_required,
        -- Raw score (original formula, unchanged)
        (
            COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 1) * 3
          + COUNT(*) FILTER (WHERE importance = 'preferred'    AND is_matched = 1) * 1
          + COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1) * 0.5
          - COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 0) * 4
        )::REAL AS score
    FROM resume_skill_matrix
    GROUP BY resume_id, user_id, full_name
),

-- Join resume embeddings after aggregation (avoids GROUP BY on vector type)
scored AS (
    SELECT
        ds.resume_id,
        ds.user_id,
        ds.full_name,
        ds.matched_required,
        ds.matched_preferred,
        ds.matched_nice_to_have,
        ds.missing_required,
        ds.score,
        -- Normalized deterministic: clamp to [0, max], divide by max
        COALESCE(
            LEAST(GREATEST(ds.score, 0.0), jm.max_possible_score)
            / NULLIF(jm.max_possible_score, 0.0),
            0.0
        )::REAL AS deterministic_score_normalized,
        -- Semantic: 1 - cosine_distance; 0.0 when either embedding is NULL
        COALESCE(
            (1.0 - (r.embedding <=> jv.embedding))::REAL,
            0.0
        ) AS semantic_similarity,
        -- Hybrid blend
        (
            0.6 * COALESCE(
                LEAST(GREATEST(ds.score, 0.0), jm.max_possible_score)
                / NULLIF(jm.max_possible_score, 0.0),
                0.0
            )
          + 0.4 * COALESCE(
                (1.0 - (r.embedding <=> jv.embedding))::REAL,
                0.0
            )
        )::REAL AS hybrid_score
    FROM det_scores ds
    JOIN  resumes r  ON r.id = ds.resume_id   -- fetch embedding after aggregation
    CROSS JOIN job_vec jv                      -- 1 row (or 0 → empty result)
    CROSS JOIN job_max jm                      -- constant max score for this job
)

SELECT
    resume_id,
    user_id,
    full_name,
    matched_required,
    matched_preferred,
    matched_nice_to_have,
    missing_required,
    score,
    deterministic_score_normalized,
    semantic_similarity,
    hybrid_score
FROM scored
WHERE hybrid_score >= 0.30
ORDER BY hybrid_score DESC
LIMIT 50;
$$;

GRANT EXECUTE ON FUNCTION match_candidates_for_job(UUID) TO authenticated;
