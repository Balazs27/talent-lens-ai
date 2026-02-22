-- BOOTCAMP REFERENCE — Diagnostic query for debugging vector search performance.
--
-- Use this to verify that the HNSW/IVFFlat index is being used for cosine distance queries.
-- Look for "Index Scan using hnsw_index" in the output.
-- If you see "Seq Scan", the index is not being used — check your operator and WHERE clause.
--
-- TalentLens: update table/column names when using.

EXPLAIN (ANALYZE, BUFFERS)
SELECT id
FROM rag_content
ORDER BY embedding <=> (SELECT embedding FROM rag_content LIMIT 1) -- or <-> / <#> depending on your metric
LIMIT 10;
