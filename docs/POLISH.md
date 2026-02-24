# TalentLens AI — Polish (V1) Scope

This document defines the **Polish phase** scope for V1 demo readiness.
Goal is **high perceived quality** (clean UX + consistent UI) without changing core logic or database design.

---

## Goals

### 1) Fix small UX blockers (must work for demo)
- HR: “View Candidates” button must route to the correct candidates page (no 404).
- HR Candidates page: add **Invite** button on each candidate card (UI-only, demo toast).
- HR Dashboard: avoid empty/placeholder look; show meaningful counts and fix wording.
- Employee Matches page: add **Apply** button (UI-only, demo toast).
- Employee Matches page: clicking job title/card opens **Job Description modal** overlay.
- Employee Resume page: after extraction, show **View Matches** CTA button.
- Employee My Skills page: wire up to display extracted skills.

### 2) Demo-friendly resume selection logic (no schema changes)
Because users can create multiple resumes, for V1 polish:
- Always use the **latest resume** (`resumes.created_at DESC`) across Employee UI.
- Display a small label: **“Using latest resume”**.
- Do NOT implement “active resume” schema in V1 (that is V2).

### 3) Improve perceived quality (light polish)
- Improve empty states
- Add subtle loading states/animations where easy
- Keep UI consistent with existing patterns (no redesign yet in this pass)

---

## Non-goals (do NOT implement)

- No new DB schema changes (no new tables, no active resume column)
- No RLS changes
- No notification bell / invite persistence (Invite is UI-only for demo)
- No full design system / color palette overhaul in this task
- No refactoring core matching logic or gap analysis logic
- No landing page in this task (landing page comes later as a separate polish step)

---

## Acceptance Criteria (Definition of Done)

### HR Mode
- ✅ Clicking “View Candidates” from `/hr/jobs` navigates correctly to candidates view for that job.
- ✅ Candidates list renders (no 404), and each candidate card has an **Invite** button (UI-only).
- ✅ Invite button shows toast: “Invite sent (demo)”.
- ✅ HR dashboard shows:
  - Active jobs count
  - Candidates count (or reasonable placeholder derived from available data)
  - Avg score (or `—` with tooltip)
- ✅ Replace “JD processing” with “Job description processing”.

### Employee Mode
- ✅ Job Matches cards show an **Apply** button (UI-only toast).
- ✅ Clicking job title/card opens a modal overlay with job description content (`raw_text` or best available field).
- ✅ Resume extraction success state shows **View Matches** CTA that navigates to Matches.
- ✅ My Skills page renders skills from **latest resume**.
- ✅ Shows label: “Using latest resume”.

### General
- ✅ No broken routes
- ✅ No regression of slices 0–5 features
- ✅ No schema changes required to support polish
- ✅ Minimal invasive code changes

---

## Screens/Routes to touch (expected)

### HR
- `/hr/jobs` (jobs list)
- `/hr/jobs/[jobId]/candidates` (candidates list)
- `/hr/dashboard` (dashboard tiles)

### Employee
- `/employee/matches` (job matches list)
- `/employee/resume` (resume upload/extraction)
- `/employee/skills` (my skills page)

---

## Implementation Notes (Guardrails)

- Use existing components and styling conventions.
- Prefer small PR-style changes.
- Add UI-only toasts for demo actions (Invite / Apply).
- Modal should:
  - blur background
  - close on ESC
  - close via X button
- Always query latest resume for Employee views:
  - `ORDER BY created_at DESC LIMIT 1`