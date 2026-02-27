import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MatchList } from "@/components/match-list"
import type { JobMatch } from "@/components/match-list"
import Link from "next/link"

export default async function MatchesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch user's active ready resume (partial unique index guarantees at most 1 row)
  const { data: resume } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "ready")
    .eq("is_active", true)
    .single()

  if (!resume) {
    return (
      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold border-l-2 border-blue-500 pl-3">Job Matches</h1>
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 text-center">
          <p className="text-sm text-slate-500">
            No resume found. Upload a resume first to see matching jobs.
          </p>
          <Link
            href="/employee/resume"
            className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)]"
          >
            Upload Resume
          </Link>
        </div>
      </div>
    )
  }

  // Call hybrid matching RPC (returns hybrid_score, deterministic_score_normalized, semantic_similarity)
  const { data: matches, error: rpcError } = await supabase.rpc(
    "match_jobs_for_resume",
    { p_resume_id: resume.id }
  )

  const jobMatches = (matches ?? []) as JobMatch[]

  // Fetch raw_text for matched jobs (for modal)
  const jobTexts: Record<string, string> = {}
  if (jobMatches.length > 0) {
    const { data: jobData } = await supabase
      .from("jobs")
      .select("id, raw_text")
      .in(
        "id",
        jobMatches.map((m) => m.job_id)
      )

    if (jobData) {
      for (const j of jobData) {
        jobTexts[j.id] = j.raw_text
      }
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold border-l-2 border-blue-500 pl-3">Job Matches</h1>
        <p className="mt-1 text-sm text-slate-500 pl-3">
          Jobs ranked by skill and semantic fit with your resume. Click a job
          card to view the full description.
        </p>
      </div>

      {rpcError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">
            Failed to load matches. Please try again later.
          </p>
        </div>
      )}

      {!rpcError && (
        <MatchList
          matches={jobMatches}
          resumeId={resume.id}
          jobTexts={jobTexts}
        />
      )}
    </div>
  )
}
