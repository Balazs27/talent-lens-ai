-- 00005_jobs.sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    seniority TEXT
        CHECK (seniority IN ('junior', 'mid', 'senior', 'staff', 'lead') OR seniority IS NULL),
    raw_text TEXT NOT NULL,
    parsed JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'ready', 'error')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_jobs_active ON jobs(is_active) WHERE is_active = true;