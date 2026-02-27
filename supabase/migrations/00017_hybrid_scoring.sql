-- Slice 9: Upgrade match_jobs_for_resume to hybrid scoring
-- Blend: 60% deterministic (normalized) + 40% semantic (pgvector cosine)
-- Filter: hybrid_score >= 0.35, ORDER BY hybrid_score DESC, LIMIT 20

CREATE OR REPLACE FUNCTION match_jobs_for_resume(p_resume_id UUID)
RETURNS TABLE (
    job_id                          UUID,
    title                           TEXT,
    company                         TEXT,
    matched_required                INT,
    matched_preferred               INT,
    matched_nice_to_have            INT,
    missing_required                INT,
    score                           REAL,   -- raw deterministic (kept for UI backward compat)
    deterministic_score_normalized  REAL,   -- clamped [0,1]
    semantic_similarity             REAL,   -- cosine sim [0,1]; 0.0 when embedding absent
    hybrid_score                    REAL    -- 0.6*det_norm + 0.4*semantic
)
LANGUAGE sql STABLE
AS $$
WITH

-- Resume embedding (1 row; NULL embedding if not yet generated)
resume_vec AS (
    SELECT embedding
    FROM resumes
    WHERE id = p_resume_id
),

-- Employee's skill set from the given resume
resume_skill_set AS (
    SELECT skill_id
    FROM resume_skills
    WHERE resume_id = p_resume_id
),

-- Per-job, per-skill match flags (unchanged from original)
job_skill_analysis AS (
    SELECT
        j.id          AS job_id,
        j.title,
        j.company,
        js.importance,
        CASE WHEN rs.skill_id IS NOT NULL THEN 1 ELSE 0 END AS is_matched
    FROM jobs j
    JOIN  job_skills js        ON js.job_id    = j.id
    LEFT JOIN resume_skill_set rs ON rs.skill_id = js.skill_id
    WHERE j.status    = 'ready'
      AND j.is_active = true
),

-- Aggregate per job: deterministic counts + raw score + max possible score
det_scores AS (
    SELECT
        job_id,
        title,
        company,
        COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 1)::INT  AS matched_required,
        COUNT(*) FILTER (WHERE importance = 'preferred'    AND is_matched = 1)::INT  AS matched_preferred,
        COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1)::INT  AS matched_nice_to_have,
        COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 0)::INT  AS missing_required,
        -- Raw score (original formula, unchanged)
        (
            COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 1) * 3
          + COUNT(*) FILTER (WHERE importance = 'preferred'    AND is_matched = 1) * 1
          + COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1) * 0.5
          - COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 0) * 4
        )::REAL AS score,
        -- Max achievable score (normalization denominator)
        (
            COUNT(*) FILTER (WHERE importance = 'required')     * 3
          + COUNT(*) FILTER (WHERE importance = 'preferred')    * 1
          + COUNT(*) FILTER (WHERE importance = 'nice_to_have') * 0.5
        )::REAL AS max_possible_score
    FROM job_skill_analysis
    GROUP BY job_id, title, company
),

-- Join job embeddings after aggregation (avoids GROUP BY on vector type)
scored AS (
    SELECT
        ds.job_id,
        ds.title,
        ds.company,
        ds.matched_required,
        ds.matched_preferred,
        ds.matched_nice_to_have,
        ds.missing_required,
        ds.score,
        -- Normalized deterministic: clamp raw to [0, max], divide by max
        COALESCE(
            LEAST(GREATEST(ds.score, 0.0), ds.max_possible_score)
            / NULLIF(ds.max_possible_score, 0.0),
            0.0
        )::REAL AS deterministic_score_normalized,
        -- Semantic: 1 - cosine_distance; 0.0 when either embedding is NULL
        COALESCE(
            (1.0 - (j.embedding <=> rv.embedding))::REAL,
            0.0
        ) AS semantic_similarity,
        -- Hybrid blend
        (
            0.6 * COALESCE(
                LEAST(GREATEST(ds.score, 0.0), ds.max_possible_score)
                / NULLIF(ds.max_possible_score, 0.0),
                0.0
            )
          + 0.4 * COALESCE(
                (1.0 - (j.embedding <=> rv.embedding))::REAL,
                0.0
            )
        )::REAL AS hybrid_score
    FROM det_scores ds
    JOIN  jobs j     ON j.id = ds.job_id   -- fetch embedding after aggregation
    CROSS JOIN resume_vec rv               -- exactly 1 row (or 0 → empty result)
)

SELECT
    job_id,
    title,
    company,
    matched_required,
    matched_preferred,
    matched_nice_to_have,
    missing_required,
    score,
    deterministic_score_normalized,
    semantic_similarity,
    hybrid_score
FROM scored
WHERE hybrid_score >= 0.35
ORDER BY hybrid_score DESC
LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION match_jobs_for_resume(UUID) TO authenticated;
