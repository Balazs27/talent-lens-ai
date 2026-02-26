-- Migration: Enforce "1 Active Resume per Employee" (SCD2)
-- Implements CLAUDE.md §1.6 — Core Data Invariant

-- 1. Add is_active column (DEFAULT true = backward-compatible for new inserts)
ALTER TABLE resumes ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Backfill: set ALL existing rows to false, then re-activate most recent per user
UPDATE resumes SET is_active = false;
UPDATE resumes r SET is_active = true
FROM (
    SELECT DISTINCT ON (user_id) id
    FROM resumes ORDER BY user_id, created_at DESC
) latest WHERE r.id = latest.id;

-- 3. Partial unique index: at most 1 active resume per user
CREATE UNIQUE INDEX idx_resumes_one_active_per_user
  ON resumes (user_id) WHERE is_active = true;

-- 4. Filtered index for fast active+ready lookups
CREATE INDEX idx_resumes_active
  ON resumes (user_id) WHERE is_active = true AND status = 'ready';

-- 5. Update match_candidates_for_job to filter by is_active
--    (verbatim from 00008, single addition: AND r.is_active = true on WHERE clause)
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
      AND r.is_active = true
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

GRANT EXECUTE ON FUNCTION match_candidates_for_job(UUID) TO authenticated;

-- 6. Add insert_active_resume RPC for atomic deactivate + insert
--    Runs as SECURITY INVOKER — RLS on resumes applies normally
CREATE OR REPLACE FUNCTION insert_active_resume(p_raw_text TEXT)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_resume_id UUID;
    v_user_id UUID := auth.uid();
BEGIN
    -- Deactivate all existing active resumes for this user
    UPDATE resumes SET is_active = false
    WHERE user_id = v_user_id AND is_active = true;

    -- Insert new active resume
    INSERT INTO resumes (user_id, raw_text, status, parsed, is_active)
    VALUES (v_user_id, p_raw_text, 'processing', null, true)
    RETURNING id INTO v_resume_id;

    RETURN v_resume_id;
END;
$$;

GRANT EXECUTE ON FUNCTION insert_active_resume(TEXT) TO authenticated;
