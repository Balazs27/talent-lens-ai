import { getOpenAIClient } from "@/lib/openai/client"
import { EXPLAIN_MATCH_CONFIG, type MatchSignals } from "@/lib/openai/prompts/explain-match"
import { matchExplanationSchema, type MatchExplanation } from "@/lib/types/match-explanation"
import { SchemaValidationError } from "@/lib/ingestion/resume-parser"

/**
 * Call OpenAI to generate a structured match explanation.
 * Uses function calling + Zod validation to enforce strict JSON output.
 * Retries once on parse/validation failure (per architecture doc).
 */
export async function explainMatch(signals: MatchSignals): Promise<MatchExplanation> {
  const openai = getOpenAIClient()
  const config = EXPLAIN_MATCH_CONFIG
  const userPrompt = config.buildUserPrompt(signals)

  return callWithRetry(openai, userPrompt, config)
}

async function callWithRetry(
  openai: ReturnType<typeof getOpenAIClient>,
  userPrompt: string,
  config: typeof EXPLAIN_MATCH_CONFIG,
  attempt = 1
): Promise<MatchExplanation> {
  const response = await openai.chat.completions.create({
    model: config.model,
    temperature: config.temperature,
    messages: [
      { role: "system", content: config.system },
      { role: "user", content: userPrompt },
    ],
    tools: [config.tool],
    tool_choice: { type: "function", function: { name: "explain_match" } },
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
      console.warn("[match-explainer] JSON parse failed, retrying...")
      return callWithRetry(openai, userPrompt, config, attempt + 1)
    }
    throw new SchemaValidationError("OpenAI returned invalid JSON after retry")
  }

  const parsed = matchExplanationSchema.safeParse(rawOutput)
  if (!parsed.success) {
    if (attempt < 2) {
      console.warn("[match-explainer] Schema validation failed, retrying...")
      return callWithRetry(openai, userPrompt, config, attempt + 1)
    }
    throw new SchemaValidationError("LLM output failed schema validation after retry")
  }

  return parsed.data
}
