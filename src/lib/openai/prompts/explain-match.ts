import type OpenAI from "openai"

export interface MatchSignals {
  title: string
  hybridScore: number
  deterministicScore: number
  semanticSimilarity: number
  matchedRequired: string[]
  missingRequired: string[]
  missingPreferred: string[]
}

const SYSTEM_PROMPT = `You are a professional match explanation assistant.
You receive structured deterministic match data.
You must:
- Not invent skills or qualifications.
- Base all reasoning strictly on provided data.
- Be concise and specific — one sentence per point.
- Output STRICT JSON only.
- Never include explanation outside JSON.`

export const EXPLAIN_MATCH_CONFIG = {
  model: "gpt-4o-mini" as const,
  temperature: 0.2,
  system: SYSTEM_PROMPT,

  buildUserPrompt(signals: MatchSignals): string {
    const fmt = (names: string[]) =>
      names.length === 0 ? "None" : names.map((n) => `- ${n}`).join("\n")

    return `Job: ${signals.title}
Hybrid Score: ${(signals.hybridScore * 100).toFixed(0)}%
Semantic Similarity: ${(signals.semanticSimilarity * 100).toFixed(0)}%
Deterministic Coverage: ${(signals.deterministicScore * 100).toFixed(0)}%

Matched Required Skills:
${fmt(signals.matchedRequired)}

Missing Required Skills:
${fmt(signals.missingRequired)}

Missing Preferred Skills:
${fmt(signals.missingPreferred)}

Generate a match explanation with:
- 3 specific reasons this is a good (or partial) match
- 3 notable gaps or concerns
- 2 concrete resume improvements

Output must match schema exactly.`
  },

  tool: {
    type: "function",
    function: {
      name: "explain_match",
      description: "Generate a structured match explanation grounded in deterministic signals",
      parameters: {
        type: "object",
        properties: {
          reasons: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 3,
            description: "3 specific reasons this candidate matches the role",
          },
          gaps: {
            type: "array",
            items: { type: "string" },
            minItems: 3,
            maxItems: 3,
            description: "3 notable gaps or concerns with this match",
          },
          improvements: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 2,
            description: "2 concrete improvements to strengthen the match",
          },
        },
        required: ["reasons", "gaps", "improvements"],
      },
    },
  } satisfies OpenAI.ChatCompletionTool,
}
