# ARCHITECTURE_ADVANCED_GAP_INTELLIGENCE.md
Slice 12C — Advanced Gap Intelligence

---

# 1. Purpose

Upgrade the gap analysis panel from descriptive output
to prescriptive career intelligence.

---

# 2. Flow

User opens Gap Analysis
        ↓
Deterministic gap RPC returns:
  - matched skills
  - missing skills
  - years missing
        ↓
Hybrid + semantic signals added
        ↓
LLM Advanced Gap Generator
        ↓
Structured intelligence JSON
        ↓
UI renders:
  - Priority roadmap
  - Resume optimization suggestions
  - Estimated impact

---

# 3. Inputs to LLM

Structured only:

- Job title
- Hybrid score
- Semantic similarity
- Deterministic normalized score
- Matched required skills
- Missing required skills
- Missing preferred skills
- Years missing (if available)

Never send full resume text.

---

# 4. Output Schema

{
  "skill_plan": [
    {
      "skill": "GCP",
      "priority": 1,
      "reason": "Preferred cloud requirement for role",
      "time_estimate": "~8–12 weeks",
      "suggested_actions": [
        "Complete beginner GCP course",
        "Build a small cloud data pipeline project",
        "Add quantified cloud deployment experience"
      ]
    }
  ],
  "resume_optimization": [
    "Add measurable impact to SQL projects",
    "Align resume wording with job terminology"
  ],
  "impact_projection": {
    "estimated_score_gain": "5–10%",
    "explanation": "Adding GCP experience increases semantic and preferred coverage."
  }
}

---

# 5. Caching

Use:
gap_analysis_cache_extended

TTL:
24 hours

---

# 6. Failure Handling

If LLM fails:
- Return deterministic gap only
- Show fallback UI

If output invalid:
- Retry once
- Else fallback

---

# 7. Guardrails

- No hallucinated skills
- No guaranteed job outcome language
- No unrealistic time promises