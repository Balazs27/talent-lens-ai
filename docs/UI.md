# TalentLens AI — UI Guidelines (V1)

Goal: ship a clean, consistent UI quickly. Avoid custom design rabbit holes.

## Design principles
- Use shadcn/ui components for structure (Card, Button, Input, Table, Badge).
- Keep spacing generous, layouts simple, minimal colors.
- One primary accent color only (use default theme unless changed later).
- Prefer clarity over creativity.

## Layout
- Two shells:
  - Employee layout: sidebar + top bar
  - HR layout: sidebar + top bar
- Landing page can be a simple marketing page with CTA buttons.

## Components (suggested)
- `MatchScoreCard` — shows weighted score, overlap, similarity
- `SkillTagList` — shows skill badges (required/preferred/nice)
- `CandidateRankingTable` — sortable table (name, score, overlap, missing)
- `GapAnalysisPanel` — grouped missing skills

## Typography
- Use default Tailwind typography scale.
- Titles: `text-2xl font-semibold`
- Section headings: `text-lg font-medium`
- Body: `text-sm`

## Interaction patterns
- Ingestion (resume/JD) should:
  - show a textarea
  - show a submit button
  - show loading state
  - show results in a Card below

## Safety
- Never render model output as raw HTML.
- Display extracted fields as plain text and lists.

## “Good enough” for V1
- Use shadcn defaults.
- Don’t spend time on custom branding until Slice 3+ is working.