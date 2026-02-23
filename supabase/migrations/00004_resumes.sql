-- 00004_resumes.sql
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,                     -- Original input (HTML/text)
    parsed JSONB,                               -- Structured extraction result
    status TEXT NOT NULL DEFAULT 'pending'       -- pending | processing | ready | error
        CHECK (status IN ('pending', 'processing', 'ready', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_resumes_status ON resumes(status);