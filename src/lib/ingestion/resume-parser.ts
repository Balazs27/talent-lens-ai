import { getOpenAIClient } from "@/lib/openai/client"
import { RESUME_EXTRACTION_CONFIG } from "@/lib/openai/prompts/extract-skills-resume"
import {
  resumeExtractionSchema,
  type ResumeExtraction,
} from "@/lib/types/resume"

/**
 * Call OpenAI to extract structured skill data from resume text.
 * Validates output with Zod before returning.
 */
export async function extractSkillsFromResume(
  resumeText: string
): Promise<ResumeExtraction> {
  const openai = getOpenAIClient()

  const response = await openai.chat.completions.create({
    model: RESUME_EXTRACTION_CONFIG.model,
    temperature: RESUME_EXTRACTION_CONFIG.temperature,
    messages: [
      { role: "system", content: RESUME_EXTRACTION_CONFIG.system },
      { role: "user", content: resumeText },
    ],
    tools: [RESUME_EXTRACTION_CONFIG.tool],
    tool_choice: {
      type: "function",
      function: { name: "extract_resume_skills" },
    },
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (!toolCall || toolCall.type !== "function") {
    throw new Error("OpenAI did not return expected function call")
  }
  if (toolCall.function.name !== "extract_resume_skills") {
    throw new Error("OpenAI returned unexpected function: " + toolCall.function.name)
  }

  let rawOutput: unknown
  try {
    rawOutput = JSON.parse(toolCall.function.arguments)
  } catch {
    throw new SchemaValidationError("OpenAI returned invalid JSON")
  }

  const parsed = resumeExtractionSchema.safeParse(rawOutput)
  if (!parsed.success) {
    throw new SchemaValidationError("LLM output failed schema validation")
  }

  return parsed.data
}

export class SchemaValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SchemaValidationError"
  }
}
