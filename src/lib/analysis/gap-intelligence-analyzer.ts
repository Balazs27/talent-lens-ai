import { getOpenAIClient } from "@/lib/openai/client"
import { GAP_INTELLIGENCE_CONFIG } from "@/lib/openai/prompts/gap-intelligence"
import { gapIntelligenceSchema, type GapIntelligence } from "@/lib/types/gap-intelligence"
import { SchemaValidationError } from "@/lib/ingestion/resume-parser"

/**
 * Call OpenAI to generate advanced gap intelligence.
 * Uses function calling + Zod validation + hallucination guard.
 * Retries once on parse/validation failure (matches match-explainer pattern).
 */
export async function analyzeGapIntelligence(
  deterministicJson: Record<string, unknown>
): Promise<GapIntelligence> {
  const openai = getOpenAIClient()
  const jsonStr = JSON.stringify(deterministicJson)
  const userPrompt = GAP_INTELLIGENCE_CONFIG.buildUserPrompt(jsonStr)

  return callWithRetry(openai, userPrompt, deterministicJson)
}

async function callWithRetry(
  openai: ReturnType<typeof getOpenAIClient>,
  userPrompt: string,
  deterministicJson: Record<string, unknown>,
  attempt = 1
): Promise<GapIntelligence> {
  const config = GAP_INTELLIGENCE_CONFIG

  const response = await openai.chat.completions.create({
    model: config.model,
    temperature: config.temperature,
    messages: [
      { role: "system", content: config.system },
      { role: "user", content: userPrompt },
    ],
    tools: [config.tool],
    tool_choice: { type: "function", function: { name: "gap_intelligence" } },
  })

  const toolCall = response.choices[0]?.message?.tool_calls?.[0]
  if (!toolCall || toolCall.type !== "function") {
    throw new Error("OpenAI did not return expected function call")
  }

  let rawOutput: unknown
  try {
    rawOutput = JSON.parse(toolCall.function.arguments)
  } catch {
    if (attempt < 2) {
      console.warn("[gap-intelligence-analyzer] JSON parse failed, retrying...")
      return callWithRetry(openai, userPrompt, deterministicJson, attempt + 1)
    }
    throw new SchemaValidationError("OpenAI returned invalid JSON after retry")
  }

  const parsed = gapIntelligenceSchema.safeParse(rawOutput)
  if (!parsed.success) {
    if (attempt < 2) {
      console.warn("[gap-intelligence-analyzer] Schema validation failed, retrying...")
      return callWithRetry(openai, userPrompt, deterministicJson, attempt + 1)
    }
    throw new SchemaValidationError("LLM output failed schema validation after retry")
  }

  // Hallucination guard: every skill in skill_plan must exist in the deterministic input
  const validSkillNames = extractValidSkillNames(deterministicJson)
  const hallucinated = parsed.data.skill_plan.filter(
    (item) => !validSkillNames.has(item.skill)
  )
  if (hallucinated.length > 0) {
    console.warn(
      "[gap-intelligence-analyzer] Hallucinated skill names detected:",
      hallucinated.map((h) => h.skill)
    )
    if (attempt < 2) {
      console.warn("[gap-intelligence-analyzer] Retrying due to hallucinated skills...")
      return callWithRetry(openai, userPrompt, deterministicJson, attempt + 1)
    }
    throw new SchemaValidationError("LLM hallucinated skill names after retry")
  }

  return parsed.data
}

function extractValidSkillNames(deterministicJson: Record<string, unknown>): Set<string> {
  const names = new Set<string>()
  for (const key of ["missing_required", "missing_preferred", "impact_ranked_missing"]) {
    const arr = deterministicJson[key]
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (item && typeof item === "object" && "skill_name" in item) {
          const name = String((item as Record<string, unknown>).skill_name ?? "")
          if (name) names.add(name)
        }
      }
    }
  }
  return names
}
