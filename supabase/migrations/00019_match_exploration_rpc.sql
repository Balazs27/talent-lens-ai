-- Slice 12A: Extend both hybrid RPCs with skill name arrays, total_skills, and (employee) location/seniority
-- No new tables or indexes. Additive columns only — backward-compatible.

-- ─── Employee: match_jobs_for_resume ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION match_jobs_for_resume(p_resume_id UUID)
RETURNS TABLE (
    job_id                          UUID,
    title                           TEXT,
    company                         TEXT,
    location                        TEXT,   -- NEW
    seniority                       TEXT,   -- NEW
    matched_required                INT,
    matched_preferred               INT,
    matched_nice_to_have            INT,
    missing_required                INT,
    total_skills                    INT,    -- NEW: COUNT(*) of all job skill rows
    matched_skill_names             TEXT[], -- NEW: canonical names of matched skills
    missing_required_skill_names    TEXT[], -- NEW: canonical names of missing required skills
    score                           REAL,   -- raw deterministic (kept for backward compat)
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

-- Per-job, per-skill match flags — now includes skill canonical_name + job location/seniority
job_skill_analysis AS (
    SELECT
        j.id          AS job_id,
        j.title,
        j.company,
        j.location,
        j.seniority,
        js.importance,
        s.canonical_name,
        CASE WHEN rs.skill_id IS NOT NULL THEN 1 ELSE 0 END AS is_matched
    FROM jobs j
    JOIN  job_skills js           ON js.job_id    = j.id
    JOIN  skills s                ON s.id         = js.skill_id
    LEFT JOIN resume_skill_set rs ON rs.skill_id  = js.skill_id
    WHERE j.status    = 'ready'
      AND j.is_active = true
),

-- Aggregate per job: deterministic counts + raw score + max possible score + skill name arrays
det_scores AS (
    SELECT
        job_id,
        title,
        company,
        location,
        seniority,
        COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 1)::INT  AS matched_required,
        COUNT(*) FILTER (WHERE importance = 'preferred'    AND is_matched = 1)::INT  AS matched_preferred,
        COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1)::INT  AS matched_nice_to_have,
        COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 0)::INT  AS missing_required,
        COUNT(*)::INT AS total_skills,
        array_agg(canonical_name) FILTER (WHERE is_matched = 1)                         AS matched_skill_names,
        array_agg(canonical_name) FILTER (WHERE importance = 'required' AND is_matched = 0) AS missing_required_skill_names,
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
    GROUP BY job_id, title, company, location, seniority
),

-- Join job embeddings after aggregation (avoids GROUP BY on vector type)
scored AS (
    SELECT
        ds.job_id,
        ds.title,
        ds.company,
        ds.location,
        ds.seniority,
        ds.matched_required,
        ds.matched_preferred,
        ds.matched_nice_to_have,
        ds.missing_required,
        ds.total_skills,
        COALESCE(ds.matched_skill_names,          ARRAY[]::TEXT[]) AS matched_skill_names,
        COALESCE(ds.missing_required_skill_names, ARRAY[]::TEXT[]) AS missing_required_skill_names,
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
    location,
    seniority,
    matched_required,
    matched_preferred,
    matched_nice_to_have,
    missing_required,
    total_skills,
    matched_skill_names,
    missing_required_skill_names,
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


-- ─── HR: match_candidates_for_job ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION match_candidates_for_job(p_job_id UUID)
RETURNS TABLE (
    resume_id                       UUID,
    user_id                         UUID,
    full_name                       TEXT,
    matched_required                INT,
    matched_preferred               INT,
    matched_nice_to_have            INT,
    missing_required                INT,
    total_skills                    INT,    -- NEW
    matched_skill_names             TEXT[], -- NEW
    missing_required_skill_names    TEXT[], -- NEW
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

-- Per-resume per-skill match flags — now includes skill canonical_name
resume_skill_matrix AS (
    SELECT
        r.id AS resume_id,
        r.user_id,
        p.full_name,
        js.skill_id,
        js.importance,
        s.canonical_name,
        CASE WHEN rs.skill_id IS NOT NULL THEN 1 ELSE 0 END AS is_matched
    FROM resumes r
    JOIN  profiles p         ON p.id = r.user_id
    CROSS JOIN job_skill_set js
    JOIN  skills s           ON s.id = js.skill_id
    LEFT JOIN resume_skills rs
        ON rs.resume_id = r.id
        AND rs.skill_id = js.skill_id
    WHERE r.status    = 'ready'
      AND r.is_active = true
),

-- Aggregate per resume: deterministic counts + raw score + skill name arrays
det_scores AS (
    SELECT
        resume_id,
        user_id,
        full_name,
        COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 1)::INT AS matched_required,
        COUNT(*) FILTER (WHERE importance = 'preferred'    AND is_matched = 1)::INT AS matched_preferred,
        COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1)::INT AS matched_nice_to_have,
        COUNT(*) FILTER (WHERE importance = 'required'     AND is_matched = 0)::INT AS missing_required,
        COUNT(*)::INT AS total_skills,
        array_agg(canonical_name) FILTER (WHERE is_matched = 1)                         AS matched_skill_names,
        array_agg(canonical_name) FILTER (WHERE importance = 'required' AND is_matched = 0) AS missing_required_skill_names,
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
        ds.total_skills,
        COALESCE(ds.matched_skill_names,          ARRAY[]::TEXT[]) AS matched_skill_names,
        COALESCE(ds.missing_required_skill_names, ARRAY[]::TEXT[]) AS missing_required_skill_names,
        ds.score,
        -- Normalized deterministic
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
    total_skills,
    matched_skill_names,
    missing_required_skill_names,
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
