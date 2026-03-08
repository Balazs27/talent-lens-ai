import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

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

  // Fetch active ready resume (partial unique index guarantees at most 1 row)
  const { data: resume } = await supabase
    .from("resumes")
    .select("id, parsed, created_at")
    .eq("user_id", user.id)
    .eq("status", "ready")
    .eq("is_active", true)
    .single()

  if (!resume) {
    return (
      <div className="max-w-3xl space-y-6">
        <PageHeader title="My Skills" />
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">No skills extracted yet</p>
          <p className="mt-1 text-xs text-slate-400">Upload your resume to extract and view your skill profile</p>
          <Link
            href="/employee/resume"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)]"
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
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="My Skills"
        meta={matched.length > 0 ? matched.length : undefined}
        description={`Skills extracted from your resume · Last updated ${resumeDate}`}
      />

      {/* Summary */}
      <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5">
        <div className="flex items-baseline gap-6">
          <div>
            <p className="text-2xl font-bold text-slate-900">{matched.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Matched to taxonomy</p>
          </div>
          <div className="w-px h-8 bg-slate-200" aria-hidden="true" />
          <div>
            <p className="text-2xl font-bold text-slate-400">{unmatchedSkills.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Not in taxonomy</p>
          </div>
          <div className="w-px h-8 bg-slate-200" aria-hidden="true" />
          <div>
            <p className="text-2xl font-bold text-slate-400">{sortedCategories.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">Categories</p>
          </div>
        </div>
      </div>

      {/* Skills by category */}
      {matched.length === 0 && unmatchedSkills.length === 0 && (
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 text-center">
          <p className="text-sm text-slate-500">
            No skills found in your resume. Try uploading a more detailed resume.
          </p>
        </div>
      )}

      {sortedCategories.map((category) => (
        <div
          key={category}
          className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
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
                    s.confidence >= 0.7 ? "text-green-600" : "text-amber-600"
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
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Not in taxonomy · {unmatchedSkills.length} skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {unmatchedSkills.map((s, i) => (
              <span
                key={i}
                className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs text-slate-500"
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
