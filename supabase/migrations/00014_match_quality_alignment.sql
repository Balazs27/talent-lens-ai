-- Migration: Match Quality & Gap Alignment (Slice 3.1)
--
-- Fix A: match_jobs_for_resume — add HAVING score > 0 to suppress negative-score results
-- Fix B: get_gap_analysis — align "matched" definition with match RPC (skill presence check)

-- A. Recreate match_jobs_for_resume with HAVING score > 0
--    (verbatim from 00008, with HAVING clause added after GROUP BY)
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
HAVING (
        COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 1) * 3
      + COUNT(*) FILTER (WHERE importance = 'preferred' AND is_matched = 1) * 1
      + COUNT(*) FILTER (WHERE importance = 'nice_to_have' AND is_matched = 1) * 0.5
      - COUNT(*) FILTER (WHERE importance = 'required' AND is_matched = 0) * 4
) > 0
ORDER BY score DESC;
$$;

GRANT EXECUTE ON FUNCTION match_jobs_for_resume(UUID) TO authenticated;


-- B. Recreate get_gap_analysis with corrected years_missing logic
--    Old: GREATEST(COALESCE(js.min_years,0) - COALESCE(rs.years_experience,0), 0)
--         → when rs.skill_id IS NULL and min_years IS NULL, evaluates to 0 → falsely "matched"
--    New: if rs.skill_id IS NULL → candidate doesn't have the skill → years_missing = MAX(min_years, 1)
--         so it is always classified as "missing", consistent with match_jobs_for_resume
CREATE OR REPLACE FUNCTION public.get_gap_analysis(
    p_job_id uuid,
    p_resume_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
BEGIN

    WITH job_data AS (
        SELECT
            js.skill_id,
            s.canonical_name AS skill_name,
            js.importance,
            COALESCE(js.min_years, 0) AS min_years,
            COALESCE(rs.years_experience, 0) AS candidate_years,
            -- Fixed: if the candidate doesn't have the skill at all (rs.skill_id IS NULL),
            -- treat it as missing (years_missing >= 1) regardless of min_years being NULL.
            -- This aligns with match_jobs_for_resume which uses skill presence (NOT NULL).
            CASE
                WHEN rs.skill_id IS NULL THEN GREATEST(COALESCE(js.min_years, 0), 1)
                ELSE GREATEST(COALESCE(js.min_years, 0) - COALESCE(rs.years_experience, 0), 0)
            END AS years_missing,
            CASE js.importance
                WHEN 'required' THEN 3
                WHEN 'preferred' THEN 2
                WHEN 'nice_to_have' THEN 1
                ELSE 1
            END AS importance_weight
        FROM job_skills js
        JOIN skills s ON s.id = js.skill_id
        LEFT JOIN resume_skills rs
            ON rs.skill_id = js.skill_id
           AND rs.resume_id = p_resume_id
        WHERE js.job_id = p_job_id
    ),

    computed AS (
        SELECT *,
               (importance_weight * years_missing) AS impact_score
        FROM job_data
    ),

    matched_required AS (
        SELECT jsonb_agg(to_jsonb(c)) AS data
        FROM computed c
        WHERE importance = 'required'
          AND years_missing = 0
    ),

    matched_preferred AS (
        SELECT jsonb_agg(to_jsonb(c)) AS data
        FROM computed c
        WHERE importance = 'preferred'
          AND years_missing = 0
    ),

    missing_required AS (
        SELECT jsonb_agg(to_jsonb(c)) AS data
        FROM computed c
        WHERE importance = 'required'
          AND years_missing > 0
    ),

    missing_preferred AS (
        SELECT jsonb_agg(to_jsonb(c)) AS data
        FROM computed c
        WHERE importance = 'preferred'
          AND years_missing > 0
    ),

    impact_ranked_missing AS (
        SELECT jsonb_agg(to_jsonb(c) ORDER BY impact_score DESC) AS data
        FROM computed c
        WHERE years_missing > 0
    ),

    score_calc AS (
        SELECT
            COUNT(*) FILTER (WHERE importance = 'required' AND years_missing = 0) AS matched_required_count,
            COUNT(*) FILTER (WHERE importance = 'required') AS total_required_count
        FROM computed
    )

    SELECT jsonb_build_object(
        'score',
            CASE
                WHEN total_required_count = 0 THEN 100
                ELSE ROUND((matched_required_count::numeric / total_required_count) * 100, 2)
            END,
        'matched_required', COALESCE(mr.data, '[]'::jsonb),
        'matched_preferred', COALESCE(mp.data, '[]'::jsonb),
        'missing_required', COALESCE(missr.data, '[]'::jsonb),
        'missing_preferred', COALESCE(missp.data, '[]'::jsonb),
        'impact_ranked_missing', COALESCE(irm.data, '[]'::jsonb)
    )
    INTO v_result
    FROM score_calc sc
    LEFT JOIN matched_required mr ON TRUE
    LEFT JOIN matched_preferred mp ON TRUE
    LEFT JOIN missing_required missr ON TRUE
    LEFT JOIN missing_preferred missp ON TRUE
    LEFT JOIN impact_ranked_missing irm ON TRUE;

    RETURN v_result;

END;
$$;

GRANT EXECUTE ON FUNCTION public.get_gap_analysis(uuid, uuid) TO authenticated;
