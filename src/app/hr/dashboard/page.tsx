import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HRDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const name = user.user_metadata?.full_name || "there"

  // Fetch real counts
  const [jobsResult, candidatesResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("created_by", user.id)
      .eq("status", "ready"),
    supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("status", "ready"),
  ])

  const activeJobs = jobsResult.count ?? 0
  const candidateCount = candidatesResult.count ?? 0

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
          <p className="mt-2 text-2xl font-semibold text-gray-400">&mdash;</p>
          <p className="mt-1 text-xs text-gray-400">
            View per-job scores on the candidates page
          </p>
        </div>
      </div>
    </div>
  )
}
