import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

interface ResumeSkillRow {
  skill_id: number
  proficiency: string | null
  years_experience: number | null
  confidence: number
  skills: {
    canonical_name: string
    category: string
  }
}

export default async function SkillsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch latest ready resume
  const { data: resume } = await supabase
    .from("resumes")
    .select("id, parsed, created_at")
    .eq("user_id", user.id)
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!resume) {
    return (
      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold border-l-2 border-blue-500 pl-3">My Skills</h1>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 text-center">
          <p className="text-sm text-gray-500">
            No resume found. Upload a resume first to see your skills.
          </p>
          <Link
            href="/employee/resume"
            className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Upload Resume
          </Link>
        </div>
      </div>
    )
  }

  // Fetch taxonomy-matched skills via resume_skills join
  const { data: resumeSkills } = await supabase
    .from("resume_skills")
    .select("skill_id, proficiency, years_experience, confidence, skills(canonical_name, category)")
    .eq("resume_id", resume.id)

  const matched = (resumeSkills ?? []) as unknown as ResumeSkillRow[]

  // Group matched skills by category
  const byCategory: Record<string, ResumeSkillRow[]> = {}
  for (const s of matched) {
    const cat = s.skills.category
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(s)
  }
  const sortedCategories = Object.keys(byCategory).sort()

  // Find unmatched skills from parsed JSON (not in taxonomy)
  const parsed = resume.parsed as {
    skills?: Array<{ name: string; proficiency: string | null; years_experience: number | null; confidence: number }>
  } | null

  const matchedNames = new Set(matched.map((s) => s.skills.canonical_name.toLowerCase()))
  const unmatchedSkills = (parsed?.skills ?? []).filter(
    (s) => !matchedNames.has(s.name.toLowerCase())
  )

  const resumeDate = new Date(resume.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold border-l-2 border-blue-500 pl-3">My Skills</h1>
        <p className="mt-1 text-sm text-gray-500 pl-3">
          Skills extracted from your resume. Using latest resume &mdash;{" "}
          <span className="text-gray-400">{resumeDate}</span>
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <div className="flex items-baseline gap-4">
          <div>
            <p className="text-2xl font-semibold">{matched.length}</p>
            <p className="text-xs text-gray-400">Matched to taxonomy</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-400">
              {unmatchedSkills.length}
            </p>
            <p className="text-xs text-gray-400">Not in taxonomy</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-400">
              {sortedCategories.length}
            </p>
            <p className="text-xs text-gray-400">Categories</p>
          </div>
        </div>
      </div>

      {/* Skills by category */}
      {matched.length === 0 && unmatchedSkills.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 text-center">
          <p className="text-sm text-gray-500">
            No skills found in your resume. Try uploading a more detailed
            resume.
          </p>
        </div>
      )}

      {sortedCategories.map((category) => (
        <div
          key={category}
          className="rounded-xl border border-gray-200 bg-white shadow-sm p-5"
        >
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            {category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {byCategory[category].map((s) => (
              <span
                key={s.skill_id}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-sm"
              >
                <span className="font-medium text-blue-800">
                  {s.skills.canonical_name}
                </span>
                {s.proficiency && (
                  <span className="text-blue-500 text-xs">
                    ({s.proficiency})
                  </span>
                )}
                {s.years_experience != null && (
                  <span className="text-blue-400 text-xs">
                    {s.years_experience}y
                  </span>
                )}
                <span
                  className={`text-xs ${
                    s.confidence >= 0.7
                      ? "text-green-600"
                      : "text-amber-600"
                  }`}
                >
                  {Math.round(s.confidence * 100)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* Unmatched skills */}
      {unmatchedSkills.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Not in taxonomy ({unmatchedSkills.length} skills)
          </h3>
          <div className="flex flex-wrap gap-2">
            {unmatchedSkills.map((s, i) => (
              <span
                key={i}
                className="inline-flex rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs text-gray-500"
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
