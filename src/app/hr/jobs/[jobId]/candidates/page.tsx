import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CandidateList } from "@/components/candidate-list"
import type { CandidateMatch } from "@/components/candidate-list"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

export default async function CandidatesPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Verify HR role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "hr") redirect("/employee/dashboard")

  // Fetch job info
  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, company")
    .eq("id", jobId)
    .single()

  if (!job) {
    return (
      <div className="max-w-3xl space-y-6">
        <PageHeader
          title="Job Not Found"
          backHref="/hr/jobs"
          backLabel="Jobs & Candidates"
        />
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">This job description could not be found</p>
          <Link
            href="/hr/jobs"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)]"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  // Call hybrid matching RPC (returns hybrid_score, deterministic_score_normalized, semantic_similarity)
  const { data: matches, error: rpcError } = await supabase.rpc(
    "match_candidates_for_job",
    { p_job_id: jobId }
  )

  const candidates = (matches ?? []) as CandidateMatch[]

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title={`Candidates · ${job.title}`}
        description={
          job.company
            ? `${job.company} · Ranked by skill and semantic fit`
            : "Candidates ranked by skill and semantic fit"
        }
        meta={candidates.length > 0 ? candidates.length : undefined}
        backHref="/hr/jobs"
        backLabel="Jobs & Candidates"
      />

      {rpcError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-700">Failed to load candidates. Please try again later.</p>
        </div>
      )}

      {!rpcError && (
        <CandidateList candidates={candidates} jobId={jobId} />
      )}
    </div>
  )
}
