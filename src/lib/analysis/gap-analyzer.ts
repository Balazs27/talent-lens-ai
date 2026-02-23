import { getOpenAIClient } from "@/lib/openai/client"
import {
  GAP_ANALYSIS_EMPLOYEE_CONFIG,
  GAP_ANALYSIS_HR_CONFIG,
} from "@/lib/openai/prompts/gap-analysis"
import {
  employeeGapLLMSchema,
  hrGapLLMSchema,
  type EmployeeGapLLM,
  type HrGapLLM,
} from "@/lib/types/gap-analysis"
import { SchemaValidationError } from "@/lib/ingestion/resume-parser"

/**
 * Call OpenAI to generate gap analysis recommendations.
 * Uses function calling + Zod validation to enforce strict JSON output.
 */
export async function analyzeGapWithLLM(
  deterministicJson: Record<string, unknown>,
  mode: "employee" | "hr"
): Promise<EmployeeGapLLM | HrGapLLM> {
  const openai = getOpenAIClient()
  const jsonStr = JSON.stringify(deterministicJson)

  if (mode === "employee") {
    return callEmployeeGapAnalysis(openai, jsonStr)
  }
  return callHrGapAnalysis(openai, jsonStr)
}

async function callEmployeeGapAnalysis(
  openai: ReturnType<typeof getOpenAIClient>,
  jsonStr: string
): Promise<EmployeeGapLLM> {
  const config = GAP_ANALYSIS_EMPLOYEE_CONFIG

  const response = await openai.chat.completions.create({
    model: config.model,
    temperature: config.temperature,
    messages: [
      { role: "system", content: config.system },
      { role: "user", content: config.buildUserPrompt(jsonStr) },
    ],
    tools: [config.tool],
    tool_choice: {
      type: "function",
      function: { name: "gap_analysis_employee" },
    },
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (!toolCall || toolCall.type !== "function") {
    throw new Error("OpenAI did not return expected function call")
  }

  let rawOutput: unknown
  try {
    rawOutput = JSON.parse(toolCall.function.arguments)
  } catch {
    throw new SchemaValidationError("OpenAI returned invalid JSON")
  }

  const parsed = employeeGapLLMSchema.safeParse(rawOutput)
  if (!parsed.success) {
    throw new SchemaValidationError("LLM output failed schema validation")
  }

  return parsed.data
}

async function callHrGapAnalysis(
  openai: ReturnType<typeof getOpenAIClient>,
  jsonStr: string
): Promise<HrGapLLM> {
  const config = GAP_ANALYSIS_HR_CONFIG

  const response = await openai.chat.completions.create({
    model: config.model,
    temperature: config.temperature,
    messages: [
      { role: "system", content: config.system },
      { role: "user", content: config.buildUserPrompt(jsonStr) },
    ],
    tools: [config.tool],
    tool_choice: {
      type: "function",
      function: { name: "gap_analysis_hr" },
    },
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (!toolCall || toolCall.type !== "function") {
    throw new Error("OpenAI did not return expected function call")
  }

  let rawOutput: unknown
  try {
    rawOutput = JSON.parse(toolCall.function.arguments)
  } catch {
    throw new SchemaValidationError("OpenAI returned invalid JSON")
  }

  const parsed = hrGapLLMSchema.safeParse(rawOutput)
  if (!parsed.success) {
    throw new SchemaValidationError("LLM output failed schema validation")
  }

  return parsed.data
}
