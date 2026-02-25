-- 00011_resume_skills.sql
-- Stores extracted or manually added skills per resume

CREATE TABLE IF NOT EXISTS resume_skills (
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    skill_id INT NOT NULL REFERENCES skills(id),
    proficiency TEXT CHECK (proficiency IN ('beginner','intermediate','advanced','expert')),
    years_experience NUMERIC(3,1),
    source TEXT NOT NULL DEFAULT 'extracted'
        CHECK (source IN ('extracted', 'manual')),
    confidence REAL NOT NULL DEFAULT 1.0,
    PRIMARY KEY (resume_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_resume_skills_resume
    ON resume_skills(resume_id);

CREATE INDEX IF NOT EXISTS idx_resume_skills_skill
    ON resume_skills(skill_id);

ALTER TABLE resume_skills ENABLE ROW LEVEL SECURITY;