# Match Card UX (Slice 10.2)

## Primary Metric

Match % = round(hybrid_score * 100)

Displayed prominently as badge.

## Secondary Explainability

- Required matched: X / Y
- Missing required: Z
- (Optional) Semantic indicator tooltip

## Layout Hierarchy

1. Match % badge (top right)
2. Job title
3. Company + location
4. Required match summary
5. CTA buttons

## Sorting

Sorted by hybrid_score DESC.

## Empty States

If no Strong/Potential matches:
- Show:
  "No strong matches found yet. Try improving your resume."

If toggle enabled and only Weak matches exist:
- Show weak section with subtle styling.