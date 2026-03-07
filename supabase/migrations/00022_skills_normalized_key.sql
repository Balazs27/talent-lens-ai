-- 00022_skills_normalized_key.sql
-- Add a generated normalized_key column for efficient case-insensitive lookups.
-- This enables future index-based matching instead of full table scans.
-- The column is GENERATED ALWAYS AS STORED — Postgres maintains it automatically.

ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS normalized_key TEXT
    GENERATED ALWAYS AS (lower(trim(canonical_name))) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS idx_skills_normalized_key
  ON skills(normalized_key);
