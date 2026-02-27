import { z } from "zod"

export const skillPlanItemSchema = z.object({
  skill:             z.string().min(1),
  priority:          z.number().int().min(1),
  reason:            z.string().min(1),
  time_estimate:     z.string().min(1),
  suggested_actions: z.array(z.string()).min(1).max(5),
})

export const gapIntelligenceSchema = z.object({
  skill_plan:          z.array(skillPlanItemSchema).min(1).max(10),
  resume_optimization: z.array(z.string()).min(1).max(5),
  impact_projection:   z.object({
    estimated_score_gain: z.string().min(1),
    explanation:          z.string().min(1),
  }),
})

export type SkillPlanItem = z.infer<typeof skillPlanItemSchema>
export type GapIntelligence = z.infer<typeof gapIntelligenceSchema>

export interface GapIntelligenceResponse {
  intelligence: GapIntelligence | null
  cached: boolean
}
