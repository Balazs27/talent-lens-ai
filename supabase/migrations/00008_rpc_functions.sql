--SLICE 3 User skills matching to jobs
CREATE OR REPLACE FUNCTION match_jobs_for_resume(p_resume_id UUID)
RETURNS TABLE (
    job_id UUID,
    title TEXT,
    company TEXT,
    matched_required INT,
    matched_preferred INT,
    matched_nice_to_have INT,
    missing_required INT,
    score REAL
)
LANGUAGE sql STABLE
AS $$
WITH resume_skill_set AS (
    SELECT skill_id
    FROM resume_skills
    WHERE resume_id = p_resume_id
),

job_skill_analysis AS (
    SELECT
        j.id AS job_id,
        j.title,
        j.company,
        js.skill_id,
        js.importance,
        CASE
            WHEN rs.skill_id IS NOT NULL THEN 1
            ELSE 0
        END AS is_matched
    FROM jobs j
    JOIN job_skills js ON js.job_id = j.id
    LEFT JOIN resume_skill_set rs ON rs.skill_id = js.skill_id
    WHERE j.status = 'ready'
      AND j.is_active = true
)

SELECT
    job_id,
    title,
    company,
    COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 1) AS matched_required,
    COUNT(*) FILTER (WHERE importance = 'preferred' AND is_matched = 1) AS matched_preferred,
    COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1) AS matched_nice_to_have,
    COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 0) AS missing_required,

    (
        COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 1) * 3
      + COUNT(*) FILTER (WHERE importance = 'preferred' AND is_matched = 1) * 1
      + COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1) * 0.5
      - COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 0) * 4
    )::REAL AS score

FROM job_skill_analysis
GROUP BY job_id, title, company
ORDER BY score DESC;
$$;

--User access:
GRANT EXECUTE ON FUNCTION match_jobs_for_resume(UUID) TO authenticated;


--SLICE 4 Job Requirements matching to employees
CREATE OR REPLACE FUNCTION match_candidates_for_job(p_job_id UUID)
RETURNS TABLE (
    resume_id UUID,
    user_id UUID,
    full_name TEXT,
    matched_required INT,
    matched_preferred INT,
    matched_nice_to_have INT,
    missing_required INT,
    score REAL
)
LANGUAGE sql STABLE
AS $$
WITH job_skill_set AS (
    SELECT skill_id, importance
    FROM job_skills
    WHERE job_id = p_job_id
),

resume_skill_matrix AS (
    SELECT
        r.id AS resume_id,
        r.user_id,
        p.full_name,
        js.skill_id,
        js.importance,
        CASE
            WHEN rs.skill_id IS NOT NULL THEN 1
            ELSE 0
        END AS is_matched
    FROM resumes r
    JOIN profiles p ON p.id = r.user_id
    CROSS JOIN job_skill_set js
    LEFT JOIN resume_skills rs
        ON rs.resume_id = r.id
        AND rs.skill_id = js.skill_id
    WHERE r.status = 'ready'
)

SELECT
    resume_id,
    user_id,
    full_name,
    COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 1) AS matched_required,
    COUNT(*) FILTER (WHERE importance = 'preferred' AND is_matched = 1) AS matched_preferred,
    COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1) AS matched_nice_to_have,
    COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 0) AS missing_required,
    (
        COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 1) * 3
      + COUNT(*) FILTER (WHERE importance = 'preferred' AND is_matched = 1) * 1
      + COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1) * 0.5
      - COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 0) * 4
    )::REAL AS score
FROM resume_skill_matrix
GROUP BY resume_id, user_id, full_name
HAVING (
        COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 1) * 3
      + COUNT(*) FILTER (WHERE importance = 'preferred' AND is_matched = 1) * 1
      + COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1) * 0.5
      - COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 0) * 4
) > 0
ORDER BY score DESC;
$$;

--User Acces:
GRANT EXECUTE ON FUNCTION match_candidates_for_job(UUID) TO authenticated;