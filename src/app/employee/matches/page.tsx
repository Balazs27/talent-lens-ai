import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { JobMatchCard } from "@/components/job-match-card"
import { GapAnalysisPanel } from "@/components/gap-analysis-panel"
import { DemoToastButton } from "@/components/demo-toast-button"
import { JobDescriptionModal } from "@/components/job-description-modal"
import Link from "next/link"

interface JobMatch {
  job_id: string
  title: string
  company: string | null
  matched_required: number
  matched_preferred: number
  matched_nice_to_have: number
  missing_required: number
  score: number
}

export default async function MatchesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch user's latest ready resume
  const { data: resume } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!resume) {
    return (
      <div className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold">Job Matches</h1>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            No resume found. Upload a resume first to see matching jobs.
          </p>
          <Link
            href="/employee/resume"
            className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Upload Resume
          </Link>
        </div>
      </div>
    )
  }

  // Call deterministic matching RPC
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
        <h1 className="text-2xl font-semibold">Job Matches</h1>
        <p className="mt-1 text-sm text-gray-500">
          Jobs ranked by skill overlap with your resume. Higher scores indicate
          better fit. Click a job card to view the full description.
        </p>
      </div>

      {rpcError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">
            Failed to load matches. Please try again later.
          </p>
        </div>
      )}

      {!rpcError && jobMatches.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            No matching jobs found. Check back after more job descriptions have
            been posted.
          </p>
        </div>
      )}

      {jobMatches.length > 0 && (
        <div className="space-y-3">
          {jobMatches.map((match) => (
            <div key={match.job_id}>
              <JobDescriptionModal
                title={match.title}
                company={match.company}
                rawText={jobTexts[match.job_id] ?? null}
              >
                <JobMatchCard
                  title={match.title}
                  company={match.company}
                  score={match.score}
                  matched_required={match.matched_required}
                  matched_preferred={match.matched_preferred}
                  matched_nice_to_have={match.matched_nice_to_have}
                  missing_required={match.missing_required}
                />
              </JobDescriptionModal>
              <div className="mt-2 flex items-center gap-2">
                <DemoToastButton
                  label="Apply"
                  toastMessage="Application opened (demo)"
                />
                <GapAnalysisPanel
                  jobId={match.job_id}
                  resumeId={resume.id}
                  mode="employee"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
