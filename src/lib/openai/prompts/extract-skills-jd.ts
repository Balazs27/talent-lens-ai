import type OpenAI from "openai"

export const JD_EXTRACTION_CONFIG = {
  model: "gpt-4o" as const,
  temperature: 0,

  system: `You are an HR tech assistant that extracts structured requirements from job descriptions.

TASK: Extract the job title, company, location, seniority level, and every skill requirement from the job description.

RULES:
- Classify each skill as "required", "preferred", or "nice_to_have"
- Use standard industry names (e.g., "Kubernetes" not "K8s", "React" not "React.js")
- If a minimum years of experience is stated for a skill, include it as min_years
- Distinguish between the role's required skills and team/company technologies that are only mentioned as context
- Extract both technical skills and soft skills
- For seniority, map to one of: junior, mid, senior, staff, lead — or null if unclear
- Set title, company, and location to null if not found in the text

Return results via the extract_jd_requirements function call.`,

  tool: {
    type: "function",
    function: {
      name: "extract_jd_requirements",
      description:
        "Extract structured requirements from a job description",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: ["string", "null"],
            description: "Job title, or null if not found",
          },
          company: {
            type: ["string", "null"],
            description: "Company name, or null if not found",
          },
          location: {
            type: ["string", "null"],
            description: "Job location, or null if not found",
          },
          seniority: {
            type: ["string", "null"],
            enum: ["junior", "mid", "senior", "staff", "lead", null],
            description:
              "Seniority level inferred from the JD, or null if unclear",
          },
          skills: {
            type: "array",
            description: "All extracted skill requirements",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description:
                    "Canonical skill name (e.g., React, Python, AWS)",
                },
                importance: {
                  type: "string",
                  enum: ["required", "preferred", "nice_to_have"],
                  description: "How critical this skill is for the role",
                },
                min_years: {
                  type: ["number", "null"],
                  description:
                    "Minimum years of experience required for this skill, or null if not stated",
                },
              },
              required: ["name", "importance"],
            },
          },
        },
        required: ["title", "company", "location", "seniority", "skills"],
      },
    },
  } satisfies OpenAI.ChatCompletionTool,
}
