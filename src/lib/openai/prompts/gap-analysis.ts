import type OpenAI from "openai"

const SYSTEM_PROMPT = `You are a professional career gap analysis assistant.
You receive deterministic JSON.
You must:
- Not invent skills.
- Use conservative time estimates.
- Base recommendations strictly on provided data.
- Output STRICT JSON only.
- Never include explanation outside JSON.`

// ─── Employee Mode ────────────────────────────────────────────
export const GAP_ANALYSIS_EMPLOYEE_CONFIG = {
  model: "gpt-4o" as const,
  temperature: 0.2,
  system: SYSTEM_PROMPT,

  buildUserPrompt(deterministicJson: string): string {
    return `Here is deterministic gap analysis JSON:
${deterministicJson}

Generate:
1. Priority order of missing skills
2. Learning plan per skill
3. Estimated total time to close gap
4. Confidence level

Output must match schema exactly.`
  },

  tool: {
    type: "function",
    function: {
      name: "gap_analysis_employee",
      description:
        "Generate a detailed learning plan for an employee based on gap analysis",
      parameters: {
        type: "object",
        properties: {
          priority_order: {
            type: "array",
            items: { type: "string" },
            description: "Missing skills ordered by priority (highest first)",
          },
          learning_plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: {
                  type: "string",
                  description: "The skill name",
                },
                why_it_matters: {
                  type: "string",
                  description: "Why this skill matters for the role",
                },
                recommended_actions: {
                  type: "array",
                  items: { type: "string" },
                  description: "Concrete actions to learn this skill",
                },
                estimated_time_weeks: {
                  type: "number",
                  description: "Estimated weeks to reach proficiency",
                },
              },
              required: [
                "skill",
                "why_it_matters",
                "recommended_actions",
                "estimated_time_weeks",
              ],
            },
            description: "Per-skill learning plan",
          },
          estimated_total_time_months: {
            type: "number",
            description: "Total estimated months to close all gaps",
          },
          confidence_level: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Confidence in the time estimate",
          },
        },
        required: [
          "priority_order",
          "learning_plan",
          "estimated_total_time_months",
          "confidence_level",
        ],
      },
    },
  } satisfies OpenAI.ChatCompletionTool,
}

// ─── HR Mode ──────────────────────────────────────────────────
export const GAP_ANALYSIS_HR_CONFIG = {
  model: "gpt-4o" as const,
  temperature: 0.2,
  system: SYSTEM_PROMPT,

  buildUserPrompt(deterministicJson: string): string {
    return `Here is deterministic gap analysis JSON:
${deterministicJson}

Provide:
1. Estimated ramp-up time in months
2. Training recommendations
3. Risk level

Output must match schema exactly.`
  },

  tool: {
    type: "function",
    function: {
      name: "gap_analysis_hr",
      description:
        "Generate a short executive gap analysis summary for HR",
      parameters: {
        type: "object",
        properties: {
          estimated_ramp_up_months: {
            type: "number",
            description: "Estimated months for candidate to ramp up",
          },
          training_recommendations: {
            type: "array",
            items: { type: "string" },
            description: "Concise training recommendations",
          },
          risk_level: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Risk level of hiring this candidate",
          },
        },
        required: [
          "estimated_ramp_up_months",
          "training_recommendations",
          "risk_level",
        ],
      },
    },
  } satisfies OpenAI.ChatCompletionTool,
}
