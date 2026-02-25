-- 00012_job_skills.sql
-- Stores required/preferred skills per job

CREATE TABLE IF NOT EXISTS job_skills (
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES skills(id),
    importance TEXT NOT NULL DEFAULT 'required'
        CHECK (importance IN ('required', 'preferred', 'nice_to_have')),
    min_years NUMERIC(3,1),
    PRIMARY KEY (job_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_job_skills_job
    ON job_skills(job_id);

CREATE INDEX IF NOT EXISTS idx_job_skills_skill
    ON job_skills(skill_id);

ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;