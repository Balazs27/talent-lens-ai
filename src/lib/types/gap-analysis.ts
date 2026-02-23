import { z } from "zod"

// ─── Employee LLM Output Schema ───────────────────────────────
export const learningPlanItemSchema = z.object({
  skill: z.string().min(1),
  why_it_matters: z.string().min(1),
  recommended_actions: z.array(z.string()),
  estimated_time_weeks: z.number(),
})

export const employeeGapLLMSchema = z.object({
  priority_order: z.array(z.string()),
  learning_plan: z.array(learningPlanItemSchema),
  estimated_total_time_months: z.number(),
  confidence_level: z.enum(["low", "medium", "high"]),
})

// ─── HR LLM Output Schema ─────────────────────────────────────
export const hrGapLLMSchema = z.object({
  estimated_ramp_up_months: z.number(),
  training_recommendations: z.array(z.string()),
  risk_level: z.enum(["low", "medium", "high"]),
})

// ─── Deterministic result (from RPC) ──────────────────────────
export interface DeterministicGap {
  score: number
  matched_required: Array<Record<string, unknown>>
  matched_preferred: Array<Record<string, unknown>>
  missing_required: Array<Record<string, unknown>>
  missing_preferred: Array<Record<string, unknown>>
  impact_ranked_missing: Array<Record<string, unknown>>
}

// ─── API Response ─────────────────────────────────────────────
export interface GapAnalysisResponse {
  deterministic: DeterministicGap
  llm: EmployeeGapLLM | HrGapLLM | null
  cached: boolean
}

export type EmployeeGapLLM = z.infer<typeof employeeGapLLMSchema>
export type HrGapLLM = z.infer<typeof hrGapLLMSchema>
export type LearningPlanItem = z.infer<typeof learningPlanItemSchema>
