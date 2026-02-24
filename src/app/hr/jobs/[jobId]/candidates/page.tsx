import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CandidateMatchCard } from "@/components/candidate-match-card"
import { GapAnalysisPanel } from "@/components/gap-analysis-panel"
import { DemoToastButton } from "@/components/demo-toast-button"
import Link from "next/link"

interface CandidateMatch {
  resume_id: string
  user_id: string
  full_name: string
  matched_required: number
  matched_preferred: number
  matched_nice_to_have: number
  missing_required: number
  score: number
}

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
        <h1 className="text-2xl font-semibold">Job Not Found</h1>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            This job description could not be found.
          </p>
          <Link
            href="/hr/jobs"
            className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  // Call deterministic matching RPC
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
        <h1 className="mt-2 text-2xl font-semibold">
          Candidates for {job.title}
        </h1>
        {job.company && (
          <p className="mt-0.5 text-sm text-gray-500">{job.company}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Candidates ranked by skill overlap. Higher scores indicate better fit.
        </p>
      </div>

      {rpcError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">
            Failed to load candidates. Please try again later.
          </p>
        </div>
      )}

      {!rpcError && candidates.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            No candidates currently match this role.
          </p>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="space-y-3">
          {candidates.map((c) => (
            <div key={c.resume_id}>
              <CandidateMatchCard
                full_name={c.full_name}
                score={c.score}
                matched_required={c.matched_required}
                matched_preferred={c.matched_preferred}
                matched_nice_to_have={c.matched_nice_to_have}
                missing_required={c.missing_required}
              />
              <div className="mt-2 flex items-center gap-2">
                <DemoToastButton
                  label="Invite"
                  toastMessage="Invite sent (demo)"
                />
                <GapAnalysisPanel
                  jobId={jobId}
                  resumeId={c.resume_id}
                  mode="hr"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
