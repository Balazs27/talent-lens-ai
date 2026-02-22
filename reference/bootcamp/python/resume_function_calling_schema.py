"""
BOOTCAMP REFERENCE — Do not import into TalentLens production code.

KEY PATTERN: OpenAI function-calling schema for structured resume extraction.

This is a complete, tested tool definition that extracts 6 categories from resumes:
  - name + contact_information
  - professional_summary
  - work_experience (array of objects)
  - education (array of objects)
  - skills (flat string array)
  - certifications (array of objects)
  - projects (array of objects)

The bootcamp uses this with:
  model="gpt-4o",
  temperature=0,
  response_format={"type": "json_object"},
  tools=[RESUME_PARSE_TOOL]

And reads the result from:
  completion.choices[0].message.tool_calls[0].function.arguments

TalentLens adaptation notes:
  - Rewrite in TypeScript (src/lib/openai/prompts/extract-skills-resume.ts)
  - TalentLens splits parsing and skill extraction into separate steps
  - Add 'confidence' (0-1) and 'evidence' (source quote) fields per skill
  - Add 'proficiency' enum: beginner | intermediate | advanced | expert
  - Add 'category' enum per skill (Programming Language, Frontend Framework, etc.)
  - The bootcamp treats skills as a flat string array; TalentLens needs structured skill objects
  - See talentlens-ai-architecture.md section 5a for the final TalentLens schema
"""

RESUME_PARSE_TOOL = {
    "type": "function",
    "function": {
        "name": "parse_resume",
        "description": "Parse resume text into a structured schema with work experience, education, skills, certifications, and projects.",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "Full name of the person"
                },
                "contact_information": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"}
                    },
                    "required": ["location"]
                },
                "professional_summary": {
                    "type": "string"
                },
                "work_experience": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "company": {"type": "string"},
                            "title": {"type": "string"},
                            "startDate": {"type": "string"},
                            "endDate": {"type": "string"},
                            "responsibilities": {"type": "string"}
                        },
                        "required": ["company", "title"]
                    }
                },
                "education": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "school": {"type": "string"},
                            "degree": {"type": "string"},
                            "startDate": {"type": "string"},
                            "endDate": {"type": "string"}
                        },
                        "required": ["school", "degree"]
                    }
                },
                "skills": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "certifications": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "issuer": {"type": "string"},
                            "date": {"type": "string"}
                        },
                        "required": ["name", "issuer"]
                    }
                },
                "projects": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "dates": {"type": "string"},
                            "description": {"type": "string"},
                            "associated_with": {"type": "string"}
                        },
                        "required": ["name"]
                    }
                }
            },
            "required": ["name", "contact_information", "professional_summary"]
        }
    }
}


# The system prompt used with this tool definition:
RESUME_PARSE_SYSTEM_PROMPT = """You are a resume parser. Extract and format the key information from HTML content (from LinkedIn profiles or resumes) into only a JSON format.
        Remove any HTML tags, navigation elements, or extraneous information.
Focus on extracting:
{
"name": "Random Name",
"contact_information": {
"location": "Bay Area"
},
"professional_summary": "Data Engineer @ Meta",
"work_experience": [
{
"company": "Meta",
"title": "Engineer",
"startDate": "May 2025",
"endDate": "Present",
"responsibilities": "I wrote pipelines"
}
],
"education": [
{
"school": "Stanford",
"degree": "Bachelor's Degree, Computer Science",
"startDate": "Not specified",
"endDate": "Not specified"
}
],
"skills": [
"Big Data",
"Machine Learning"
],
"certifications": [
{
"name": "Databricks Certified Professional",
"issuer": "Databricks",
"date": "Nov 2015"
}
],
"projects": [
{
"name": "Some Github Repo",
"dates": "Nov 2023 - Present",
"description": "A list of repos or something",
"associated_with": "DataExpert.io"
}
]
}
Format the output as clean JSON"""
