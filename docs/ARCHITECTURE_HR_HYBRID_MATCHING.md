# HR Hybrid Matching (Slice 11)

## Goal
Mirror employee-side hybrid scoring for candidate ranking.

## Inputs
- match_candidates_for_job RPC

## Additions
- semantic_similarity
- deterministic_score_normalized
- hybrid_score

## Weights
0.6 deterministic
0.4 semantic

## HR Thresholds
Strong:   >= 0.60
Potential: 0.40–0.60
Weak:      0.30–0.40

## UI
- Show Match %
- Hide weak by default
- Toggle to reveal weak
- Sort by hybrid_score DESC