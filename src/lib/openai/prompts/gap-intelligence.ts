import type OpenAI from "openai"

const SYSTEM_PROMPT = `You are a career intelligence advisor.
You receive structured deterministic gap analysis data.
You must:
- Not invent skills that are not present in the input data.
- Only reference skill names that appear in missing_required, missing_preferred, or impact_ranked_missing arrays.
- Use conservative, realistic time estimates.
- Base all reasoning strictly on provided data.
- Output STRICT JSON only.
- Never include explanation outside JSON.`

export const GAP_INTELLIGENCE_CONFIG = {
  model: "gpt-4o" as const,
  temperature: 0.2,
  system: SYSTEM_PROMPT,

  buildUserPrompt(deterministicJson: string): string {
    return `Here is the deterministic gap analysis:
${deterministicJson}

Generate advanced gap intelligence with three sections:

1. skill_plan: For each missing skill (missing_required first ordered by impact_score DESC, then missing_preferred), create a prioritized plan entry:
   - skill: exact skill_name value from the input arrays (do not invent)
   - priority: 1-based integer rank (1 = highest priority)
   - reason: why this skill matters for the role (cite importance and impact_score from input)
   - time_estimate: realistic learning time string (e.g. "2-4 weeks", "1-2 months")
   - suggested_actions: 2-4 concrete learning actions

2. resume_optimization: 2-4 specific suggestions for how the candidate could better present their existing matched skills to improve their match score. Ground each suggestion in the matched skills data.

3. impact_projection: estimate the hybrid score gain if the top 2-3 priority skills were acquired.
   - estimated_score_gain: a percentage range string (e.g. "+15-20%")
   - explanation: brief reasoning grounded in the skill weights and importance values from input

Output must match schema exactly.`
  },

  tool: {
    type: "function",
    function: {
      name: "gap_intelligence",
      description:
        "Generate advanced gap intelligence with a prioritized skill plan, resume optimization suggestions, and impact projection",
      parameters: {
        type: "object",
        properties: {
          skill_plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: {
                  type: "string",
                  description: "Exact skill_name from input missing_required or missing_preferred array",
                },
                priority: {
                  type: "integer",
                  minimum: 1,
                  description: "1-based priority rank (1 = highest priority)",
                },
                reason: {
                  type: "string",
                  description: "Why this skill matters for the role",
                },
                time_estimate: {
                  type: "string",
                  description: "Realistic learning time (e.g. '2-4 weeks', '1-2 months')",
                },
                suggested_actions: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 2,
                  maxItems: 5,
                  description: "2-4 concrete learning actions",
                },
              },
              required: ["skill", "priority", "reason", "time_estimate", "suggested_actions"],
            },
            minItems: 1,
            maxItems: 10,
            description: "Prioritized skill development plan",
          },
          resume_optimization: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 5,
            description: "Specific suggestions for better presenting existing skills on the resume",
          },
          impact_projection: {
            type: "object",
            properties: {
              estimated_score_gain: {
                type: "string",
                description: "Projected hybrid score gain if top skills acquired (e.g. '+15-20%')",
              },
              explanation: {
                type: "string",
                description: "Brief reasoning grounded in skill weights from input",
              },
            },
            required: ["estimated_score_gain", "explanation"],
          },
        },
        required: ["skill_plan", "resume_optimization", "impact_projection"],
      },
    },
  } satisfies OpenAI.ChatCompletionTool,
}
