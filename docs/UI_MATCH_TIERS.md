# Match Tiering System (Slice 10.1)

## Purpose
Reduce UI clutter and increase perceived match quality.

## Tier Rules

Strong:   hybrid_score >= 0.60  
Potential: 0.45–0.60  
Weak:      0.35–0.45  

Below 0.35 → not shown.

## Behavior

- Weak matches hidden by default.
- Toggle enables weak visibility.
- Tier computed in UI from hybrid_score.
- No DB modifications required.

## Non-goals

- No dynamic threshold tuning yet.
- No admin-configurable thresholds.