# Matching Engine Architecture (V1)

## Entities
- resumes (id, user_id, raw_text, parsed, status, is_active, created_at, updated_at) 
    (is_active=new)
- resume_skills (resume_id, skill_id/name, confidence/proficiency, created_at)
- jobs (id, created_by, is_active, created_at, …)
- job_skills (job_id, skill_id/name, weight/required, …)
- matches (job_id, user_id, resume_id, score, created_at, …) [if you persist matches]

## Invariants
- Exactly one active resume per user (partial unique index).
- Any skill/gap query must be scoped to active resume_id.
- HR candidate ranking should not duplicate the same user because of old resumes.

## V1 Matching Flow (Current)
1) Employee uploads resume -> extract skills -> store resume_skills
2) HR creates job -> extract job skills
3) Matching uses active resume skills vs job skills (deterministic overlap + any semantic step)

## Known Failure Modes
- Skill bleeding: querying resume_skills by user_id instead of active resume_id
- Duplicate HR matches: multiple resume rows for same user not filtered to active
- Orphan skills: resume_skills inserted without correct resume_id

## Verification SQL
- Show active resume count per user
- Check partial unique index exists
- Check employee match queries use active resume