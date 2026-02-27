import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CandidateList } from "@/components/candidate-list"
import type { CandidateMatch } from "@/components/candidate-list"
import Link from "next/link"

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
      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold border-l-2 border-blue-500 pl-3">Job Not Found</h1>
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 text-center">
          <p className="text-sm text-slate-500">
            This job description could not be found.
          </p>
          <Link
            href="/hr/jobs"
            className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)]"
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
    <div className="max-w-3xl space-y-4">
      <div>
        <Link
          href="/hr/jobs"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Jobs
        </Link>
        <h1 className="mt-2 text-2xl font-semibold border-l-2 border-blue-500 pl-3">
          Candidates for {job.title}
        </h1>
        {job.company && (
          <p className="mt-0.5 text-sm text-slate-500">{job.company}</p>
        )}
        <p className="mt-1 text-sm text-slate-500 pl-3">
          Candidates ranked by skill and semantic fit. Higher match % indicates
          better overall fit.
        </p>
      </div>

      {rpcError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">
            Failed to load candidates. Please try again later.
          </p>
        </div>
      )}

      {!rpcError && (
        <CandidateList candidates={candidates} jobId={jobId} />
      )}
    </div>
  )
}
