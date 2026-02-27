# ARCHITECTURE_LLM_EXPLANATION.md
Slice 12B — LLM Explanation Layer

---

# 1. Purpose

Provide grounded, structured AI explanations for match results.

This layer must:

- Be deterministic-grounded
- Avoid hallucinations
- Use structured output
- Be cached
- Be safe and predictable

---

# 2. High-Level Flow

User clicks "Explain Match"
↓
Frontend calls POST /api/explain/match
↓
Backend:

Fetch hybrid + deterministic signals

Fetch matched/missing skills

Construct structured prompt

Call OpenAI

Validate JSON response

Cache explanation
↓
Return structured explanation JSON
↓
Frontend renders expandable explanation panel


---

# 3. API Contract

## Route

POST /api/explain/match

## Input

{
  job_id: UUID,
  resume_id: UUID,
  mode: "employee" | "hr"
}

---

## Output (STRICT JSON ONLY)

{
  "reasons": [string, string, string],
  "gaps": [string, string, string],
  "improvements": [string, string]
}

No additional keys allowed.

---

# 4. Prompt Construction Rules

LLM must receive structured deterministic facts only.

Never send:
- Full resume text
- Full job description
- Unbounded raw text

Allowed inputs:

- Job title
- Hybrid score
- Deterministic normalized score
- Semantic similarity
- Matched required skills (names)
- Missing required skills (names)
- Missing preferred skills (names)

Example input to LLM:

---

Job: Data Engineer  
Hybrid Score: 0.82  
Semantic Similarity: 0.54  
Deterministic Coverage: 1.00  

Matched Required Skills:
- Python
- SQL

Missing Required Skills:
- None

Missing Preferred Skills:
- Airflow
- dbt

---

Instruction:

Return STRICT JSON with:
- 3 reasons
- 3 gaps
- 2 resume improvements
No extra commentary.

---

# 5. Caching Strategy

Table:
match_explanation_cache

Columns:
- job_id UUID
- resume_id UUID
- mode TEXT
- explanation_json JSONB
- created_at TIMESTAMP

Unique constraint:
(job_id, resume_id, mode)

Cache TTL:
24 hours

---

# 6. Failure Handling

## LLM failure

If LLM call fails:
- Return 200
- explanation: null
- fallback UI message:
  "Explanation unavailable. Please try again later."

## Invalid JSON from LLM

If parsing fails:
- Retry once
- If still invalid:
  - Log error
  - Return fallback

## Missing embeddings

If hybrid_score unavailable:
- Return deterministic-only explanation
- Do NOT hallucinate semantic reasoning

---

# 7. Rate Limiting

Reuse existing rate-limit utility.

Prevent:
- Abuse via repeated explanation calls
- Cost spikes

---

# 8. Security Rules

- Never expose prompt text
- Never expose raw embeddings
- Never expose service role key
- Never store OpenAI raw responses
- Store only validated JSON

---

# 9. UX Integration

Frontend behavior:

- "Explain Match" button
- Loading spinner
- Expandable panel
- Render:
  - Why this is a strong match
  - Biggest gaps
  - Resume improvements

Panel should collapse cleanly.

---

# 10. Future Enhancements

- Tone personalization (coach vs recruiter)
- Confidence score
- Regenerate explanation button
- Advanced actionable learning paths