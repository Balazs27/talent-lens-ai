--Cache Table:

CREATE TABLE IF NOT EXISTS gap_analysis_cache (
    job_id uuid NOT NULL,
    resume_id uuid NOT NULL,
    mode text NOT NULL CHECK (mode IN ('employee', 'hr')),
    deterministic jsonb NOT NULL,
    llm_result jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (job_id, resume_id, mode)
);

CREATE INDEX idx_gap_cache_created_at
ON gap_analysis_cache (created_at);