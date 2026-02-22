# Bootcamp Reference Code

These files are copied from the AI Engineering Bootcamp (Week 1) repo
for reference purposes ONLY. They are NOT imported by any production code.

## How to use these files

1. Open them in a split editor when building the equivalent TalentLens feature
2. Understand the PATTERN, not the specific implementation
3. Write the TalentLens version from scratch in TypeScript, using these as a guide
4. Delete or ignore files you've already used — they're not maintained

## What's here

### sql/ — pgvector patterns
The RPC functions show the correct way to do cosine similarity search with
pgvector (ORDER BY the distance operator, not the computed similarity column).
The indices/ folder shows HNSW and IVFFlat index creation, including partial
indexes filtered by document type.

### python/ — LLM integration patterns
These are PYTHON files. TalentLens is TypeScript. Do not try to import these.
They're here because the patterns (text formatting for embeddings, function-calling
schemas, JSON-mode reranking) are non-trivial to get right from scratch.

## What's NOT here (and why)

- main.py — monolithic, 942 lines, mixes everything. Anti-pattern.
- templates/ — Jinja2 with XSS vulnerabilities. We use React.
- agents/ — LangChain-specific. Not applicable to TalentLens V1.
- data/*.json — Synthetic data with identical descriptions. Useless for testing.
