-- Slice 12C: Advanced Gap Intelligence
-- Creates gap_intelligence_cache table with RLS.
-- No new RPC needed — reuses existing get_gap_analysis.

-- ─── Cache table ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gap_intelligence_cache (
    job_id       UUID        NOT NULL,
    resume_id    UUID        NOT NULL,
    mode         TEXT        NOT NULL CHECK (mode IN ('employee', 'hr')),
    intelligence JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (job_id, resume_id, mode)
);

CREATE INDEX idx_gap_intelligence_cache_created_at
ON gap_intelligence_cache (created_at);

-- RLS (mirrors match_explanation_cache policies)
ALTER TABLE gap_intelligence_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY gap_intelligence_cache_employee_select
ON gap_intelligence_cache
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM resumes
        WHERE resumes.id = gap_intelligence_cache.resume_id
          AND resumes.user_id = auth.uid()
    )
);

CREATE POLICY gap_intelligence_cache_hr_select
ON gap_intelligence_cache
FOR SELECT
USING (public.is_hr());
