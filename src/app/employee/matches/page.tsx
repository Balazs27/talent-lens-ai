import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MatchList } from "@/components/match-list"
import type { JobMatch } from "@/components/match-list"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

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
      <div className="max-w-3xl space-y-6">
        <PageHeader title="Job Matches" />
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">No matches yet</p>
          <p className="mt-1 text-xs text-slate-400">Upload your resume to start seeing jobs that match your skills</p>
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
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Job Matches"
        meta={jobMatches.length > 0 ? jobMatches.length : undefined}
        description="Jobs ranked by skill and semantic fit with your resume. Click a job card to view the full description."
      />

      {rpcError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-700">Failed to load matches. Please try again later.</p>
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
