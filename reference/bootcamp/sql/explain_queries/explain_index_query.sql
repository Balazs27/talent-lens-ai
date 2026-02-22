-- BOOTCAMP REFERENCE — Diagnostic query for debugging Euclidean distance (L2) search.
--
-- Uses <-> operator (L2 distance) instead of <=> (cosine distance).
-- Compare EXPLAIN output with explain_cosine_index_query.sql to understand
-- which operator your index supports.
--
-- TalentLens uses cosine distance (<=>), so this is informational only.

EXPLAIN (ANALYZE, BUFFERS)
SELECT id
FROM rag_content
ORDER BY embedding <-> (SELECT embedding FROM rag_content LIMIT 1) -- or <-> / <#> depending on your metric
LIMIT 10;
