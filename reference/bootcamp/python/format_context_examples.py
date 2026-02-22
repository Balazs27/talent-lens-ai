"""
BOOTCAMP REFERENCE — Do not import into TalentLens production code.

KEY PATTERN: Converting structured JSON into human-readable text for embedding.

Why this matters:
  - Embedding raw JSON produces terrible similarity results
  - The LLM embedding model understands prose, not key-value syntax
  - Field ordering affects embedding quality (put the most important fields first)
  - Joining arrays into comma-separated strings works well

TalentLens adaptation notes:
  - Rewrite in TypeScript (src/lib/ingestion/ or src/lib/openai/embeddings.ts)
  - Adapt field names to TalentLens parsed JSONB structure
  - Add extracted skill proficiency levels to the embedded text
  - Consider embedding the extracted/normalized output, not just the raw fields
  - The bootcamp embeds formatted raw data; TalentLens should embed the
    structured extraction result for better matching precision
"""


def format_job_context(job: dict) -> str:
    """
    Format a job posting into a text string for embedding.

    Args:
        job: Dictionary containing job information

    Returns:
        Formatted string representation of the job
    """
    skills_str = ", ".join(job.get("skills", []))
    return f"""Job Title: {job.get('title', 'N/A')}
Company: {job.get('company', 'N/A')}
Location: {job.get('location', 'N/A')}
Employment Type: {job.get('employment_type', 'N/A')}
Experience Level: {job.get('experience_level', 'N/A')}
Salary Range: {job.get('salary_range', 'N/A')}
Skills: {skills_str}
Description: {job.get('description', 'N/A')}"""


def format_profile_context(profile: dict) -> str:
    """
    Format a user profile into a text string for embedding.

    Args:
        profile: Dictionary containing profile information

    Returns:
        Formatted string representation of the profile
    """
    skills_str = ", ".join(profile.get("skills", []))
    education_str = "; ".join([
        f"{edu.get('degree', '')} from {edu.get('school', '')}"
        for edu in profile.get("education", [])
    ])

    return f"""Name: {profile.get('name', 'N/A')}
Title: {profile.get('title', 'N/A')}
Company: {profile.get('company', 'N/A')}
Location: {profile.get('location', 'N/A')}
Experience: {profile.get('experience_years', 0)} years
Career Level: {profile.get('career_level', 'N/A')}
Industry: {profile.get('industry', 'N/A')}
Skills: {skills_str}
Education: {education_str}
Summary: {profile.get('summary', 'N/A')}
LinkedIn: {profile.get('linkedin_url', 'N/A')}"""
