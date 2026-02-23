import { z } from "zod"

export const extractedJobSkillSchema = z.object({
  name: z.string().min(1),
  importance: z
    .enum(["required", "preferred", "nice_to_have"])
    .default("required"),
  min_years: z.number().nullable().optional().default(null),
})

export const jobExtractionSchema = z.object({
  title: z.string().nullable().optional().default(null),
  company: z.string().nullable().optional().default(null),
  location: z.string().nullable().optional().default(null),
  seniority: z
    .enum(["junior", "mid", "senior", "staff", "lead"])
    .nullable()
    .optional()
    .default(null),
  skills: z.array(extractedJobSkillSchema),
})

export type ExtractedJobSkill = z.infer<typeof extractedJobSkillSchema>
export type JobExtraction = z.infer<typeof jobExtractionSchema>
