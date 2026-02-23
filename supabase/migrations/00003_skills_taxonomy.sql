-- 00003_skills_taxonomy.sql
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    canonical_name TEXT NOT NULL UNIQUE,       -- "React"
    category TEXT NOT NULL,                     -- "Frontend Framework"
    aliases TEXT[] NOT NULL DEFAULT '{}',       -- {"React.js", "ReactJS", "React 18"}
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_skills_aliases ON skills USING GIN (aliases);
CREATE INDEX idx_skills_name_trgm ON skills USING GIN (canonical_name gin_trgm_ops);