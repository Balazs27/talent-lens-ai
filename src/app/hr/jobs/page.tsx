import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Job {
  id: string
  title: string
  company: string | null
  location: string | null
  seniority: string | null
  status: string
  created_at: string
}

export default async function JobsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch HR user's jobs
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, company, location, seniority, status, created_at")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  const jobList = (jobs ?? []) as Job[]

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Job Descriptions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your posted job descriptions and their candidate matches.
          </p>
        </div>
        <Link
          href="/hr/jobs/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Create New
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">Failed to load jobs.</p>
        </div>
      )}

      {!error && jobList.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 text-center">
          <p className="text-sm text-gray-500">
            No job descriptions yet. Create one to start matching candidates.
          </p>
        </div>
      )}

      {jobList.length > 0 && (
        <div className="space-y-3">
          {jobList.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex items-center justify-between"
            >
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {job.title}
                </h3>
                <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-gray-500">
                  {job.company && <span>{job.company}</span>}
                  {job.location && <span>{job.location}</span>}
                  {job.seniority && (
                    <span className="capitalize">{job.seniority}</span>
                  )}
                </div>
                <span
                  className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full ${
                    job.status === "ready"
                      ? "bg-green-50 text-green-700"
                      : job.status === "error"
                        ? "bg-red-50 text-red-700"
                        : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {job.status}
                </span>
              </div>

              {job.status === "ready" && (
                <Link
                  href={`/hr/jobs/${job.id}/candidates`}
                  className="flex-shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View Candidates
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
