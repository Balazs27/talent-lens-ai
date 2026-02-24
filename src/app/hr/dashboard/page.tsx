import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

interface CandidateScore {
  score: number
}

export default async function HRDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const name = user.user_metadata?.full_name || "there"

  // Fetch real counts + job IDs for avg score
  const [jobsResult, candidatesResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact" })
      .eq("created_by", user.id)
      .eq("status", "ready"),
    supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("status", "ready"),
  ])

  const activeJobs = jobsResult.count ?? 0
  const candidateCount = candidatesResult.count ?? 0
  const jobIds = (jobsResult.data ?? []).map((j) => j.id)

  // Compute avg match score across all candidates for HR's jobs
  let avgScore: number | null = null
  if (jobIds.length > 0) {
    const matchResults = await Promise.all(
      jobIds.map((id) =>
        supabase.rpc("match_candidates_for_job", { p_job_id: id })
      )
    )
    const allScores: number[] = []
    for (const { data } of matchResults) {
      if (data) {
        for (const c of data as CandidateScore[]) {
          allScores.push(c.score)
        }
      }
    }
    if (allScores.length > 0) {
      avgScore =
        allScores.reduce((a, b) => a + b, 0) / allScores.length
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your HR dashboard. Post a job description to start finding candidates.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
          <p className="mt-2 text-2xl font-semibold">{activeJobs}</p>
          <p className="mt-1 text-xs text-gray-400">
            {activeJobs === 0
              ? "Post your first job description"
              : "Job descriptions with extracted skills"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Candidates</h3>
          <p className="mt-2 text-2xl font-semibold">{candidateCount}</p>
          <p className="mt-1 text-xs text-gray-400">
            {candidateCount === 0
              ? "Candidates appear after job description processing"
              : "Resumes with extracted skills in the pool"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Avg. Match Score</h3>
          <p className="mt-2 text-2xl font-semibold">
            {avgScore !== null ? avgScore.toFixed(1) : <span className="text-gray-400">&mdash;</span>}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {avgScore !== null
              ? "Average across all candidates and jobs"
              : "Scores appear after candidates match"}
          </p>
        </div>
      </div>
    </div>
  )
}
