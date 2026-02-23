import { getOpenAIClient } from "@/lib/openai/client"
import { JD_EXTRACTION_CONFIG } from "@/lib/openai/prompts/extract-skills-jd"
import { jobExtractionSchema, type JobExtraction } from "@/lib/types/job"
import { SchemaValidationError } from "@/lib/ingestion/resume-parser"

/**
 * Call OpenAI to extract structured requirements from job description text.
 * Validates output with Zod before returning.
 */
export async function extractSkillsFromJD(
  jdText: string
): Promise<JobExtraction> {
  const openai = getOpenAIClient()

  const response = await openai.chat.completions.create({
    model: JD_EXTRACTION_CONFIG.model,
    temperature: JD_EXTRACTION_CONFIG.temperature,
    messages: [
      { role: "system", content: JD_EXTRACTION_CONFIG.system },
      { role: "user", content: jdText },
    ],
    tools: [JD_EXTRACTION_CONFIG.tool],
    tool_choice: {
      type: "function",
      function: { name: "extract_jd_requirements" },
    },
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (!toolCall || toolCall.type !== "function") {
    throw new Error("OpenAI did not return expected function call")
  }
  if (toolCall.function.name !== "extract_jd_requirements") {
    throw new Error(
      "OpenAI returned unexpected function: " + toolCall.function.name
    )
  }

  let rawOutput: unknown
  try {
    rawOutput = JSON.parse(toolCall.function.arguments)
  } catch {
    throw new SchemaValidationError("OpenAI returned invalid JSON")
  }

  const parsed = jobExtractionSchema.safeParse(rawOutput)
  if (!parsed.success) {
    throw new SchemaValidationError("LLM output failed schema validation")
  }

  return parsed.data
}
