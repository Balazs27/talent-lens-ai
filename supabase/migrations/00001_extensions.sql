-- 00001_extensions.sql
-- Enable required Postgres extensions

CREATE EXTENSION IF NOT EXISTS vector;       -- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- Trigram matching for fuzzy skill search
