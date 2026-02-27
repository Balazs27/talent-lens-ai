import { z } from "zod"

export const matchExplanationSchema = z.object({
  reasons:      z.array(z.string()).length(3),
  gaps:         z.array(z.string()).length(3),
  improvements: z.array(z.string()).length(2),
})

export type MatchExplanation = z.infer<typeof matchExplanationSchema>

export interface MatchExplanationResponse {
  explanation: MatchExplanation | null
  cached: boolean
}
