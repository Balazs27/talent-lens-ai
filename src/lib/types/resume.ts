import { z } from "zod"

export const extractedSkillSchema = z.object({
  name: z.string().min(1),
  proficiency: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .nullable()
    .optional()
    .default(null),
  years_experience: z.number().nullable().optional().default(null),
  confidence: z.number().min(0).max(1).optional().default(1.0),
})

export const resumeExtractionSchema = z.object({
  full_name: z.string().nullable().optional().default(null),
  email: z.string().nullable().optional().default(null),
  skills: z.array(extractedSkillSchema),
})

export type ExtractedSkill = z.infer<typeof extractedSkillSchema>
export type ResumeExtraction = z.infer<typeof resumeExtractionSchema>
