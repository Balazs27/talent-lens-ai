import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function EmployeeDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const name = user.user_metadata?.full_name || "there"

  // Fetch resume count + latest resume in parallel
  const [resumeCountResult, latestResumeResult] = await Promise.all([
    supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "ready"),
    supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ])

  const resumeCount = resumeCountResult.count ?? 0
  const latestResume = latestResumeResult.data

  // Fetch match count + skill count for latest resume
  let matchCount = 0
  let skillCount = 0

  if (latestResume) {
    const [matchResult, skillResult] = await Promise.all([
      supabase.rpc("match_jobs_for_resume", {
        p_resume_id: latestResume.id,
      }),
      supabase
        .from("resume_skills")
        .select("skill_id", { count: "exact", head: true })
        .eq("resume_id", latestResume.id),
    ])
    matchCount = matchResult.data?.length ?? 0
    skillCount = skillResult.count ?? 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold border-l-2 border-blue-500 pl-3">Welcome, {name}</h1>
        <p className="mt-1 text-sm text-gray-500 pl-3">
          Your employee dashboard. Upload a resume to get started.
        </p>
        {latestResume && (
          <p className="mt-0.5 text-xs text-gray-400">
            Using latest resume
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-500">Resumes</h3>
          <p className="mt-2 text-2xl font-semibold">{resumeCount}</p>
          <p className="mt-1 text-xs text-gray-400">
            {resumeCount === 0
              ? "Upload your first resume to begin matching"
              : "Processed resumes with extracted skills"}
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 shadow-sm p-5">
          <h3 className="text-sm font-medium text-blue-600">Job Matches</h3>
          <p className="mt-2 text-2xl font-bold text-blue-700">
            {latestResume ? matchCount : <span className="text-gray-400">&mdash;</span>}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {latestResume
              ? "Jobs matching your skill profile"
              : "Matches appear after resume processing"}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-500">Skills Extracted</h3>
          <p className="mt-2 text-2xl font-semibold">
            {latestResume ? skillCount : <span className="text-gray-400">&mdash;</span>}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {latestResume
              ? "Skills matched to taxonomy from your resume"
              : "Skills are extracted from your resume"}
          </p>
        </div>
      </div>
    </div>
  )
}
