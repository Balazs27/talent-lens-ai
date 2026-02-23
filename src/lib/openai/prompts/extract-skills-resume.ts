import type OpenAI from "openai"

export const RESUME_EXTRACTION_CONFIG = {
  model: "gpt-4o" as const,
  temperature: 0,

  system: `You are a technical recruiter's assistant that extracts structured skill data from resumes.

TASK: Extract every technical and professional skill from the resume text.

RULES:
- Use standard industry names (e.g., "React" not "React.js", "PostgreSQL" not "Postgres")
- Infer proficiency from context: years of experience, role seniority, project complexity
- If years are explicitly stated, use them. If not, estimate from work history dates.
- Only extract skills you are confident about. Set confidence < 0.7 for inferred skills.
- Do NOT hallucinate skills not mentioned or clearly implied.
- Extract the person's full name and email if present in the resume text.

Return results via the extract_resume_skills function call.`,

  tool: {
    type: "function",
    function: {
      name: "extract_resume_skills",
      description: "Extract structured skills and metadata from a resume",
      parameters: {
        type: "object",
        properties: {
          full_name: {
            type: ["string", "null"],
            description: "Full name of the candidate, or null if not found",
          },
          email: {
            type: ["string", "null"],
            description: "Email address, or null if not found",
          },
          skills: {
            type: "array",
            description: "All extracted skills",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Canonical skill name (e.g., React, Python, AWS)",
                },
                proficiency: {
                  type: ["string", "null"],
                  enum: ["beginner", "intermediate", "advanced", "expert", null],
                  description: "Inferred proficiency level",
                },
                years_experience: {
                  type: ["number", "null"],
                  description: "Estimated years of experience with this skill",
                },
                confidence: {
                  type: "number",
                  description:
                    "0.0 to 1.0 — how confident you are this skill is present. Use < 0.7 for inferred skills.",
                },
              },
              required: ["name", "confidence"],
            },
          },
        },
        required: ["full_name", "email", "skills"],
      },
    },
  } satisfies OpenAI.ChatCompletionTool,
}
