-- BOOTCAMP REFERENCE — Demonstrates an INDEX MISS scenario.
--
-- KEY LESSON: Adding a WHERE clause on the distance operator (>= 0.5)
-- can prevent the index from being used, causing a sequential scan.
-- The fix: use the ORDER BY + LIMIT pattern (as in match_documents.sql)
-- and filter AFTER retrieval, not in the WHERE clause.
--
-- This is why the TalentLens RPC functions compute similarity in the SELECT
-- but ORDER BY the raw distance operator.

EXPLAIN (ANALYZE, BUFFERS)
SELECT id
FROM rag_content
WHERE embedding <=> (SELECT embedding FROM rag_content LIMIT 1) >= 0.5 -- or <-> / <#> depending on your metric
LIMIT 10;
