import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

interface Job {
  id: string
  title: string
  company: string | null
  location: string | null
  seniority: string | null
  status: string
  created_at: string
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}

function statusConfig(status: string): { dot: string; label: string; bg: string; text: string } {
  switch (status) {
    case "ready":
      return { dot: "bg-emerald-400", label: "Ready", bg: "bg-emerald-50", text: "text-emerald-700" }
    case "error":
      return { dot: "bg-red-400", label: "Failed", bg: "bg-red-50", text: "text-red-700" }
    case "processing":
    case "pending":
      return { dot: "bg-amber-400", label: "Processing…", bg: "bg-amber-50", text: "text-amber-700" }
    default:
      return { dot: "bg-slate-300", label: status, bg: "bg-slate-100", text: "text-slate-600" }
  }
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
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Jobs & Candidates"
        meta={jobList.length > 0 ? jobList.length : undefined}
        description="Your posted job descriptions and their candidate matches."
        action={
          <Link
            href="/hr/jobs/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Job
          </Link>
        }
      />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-700">Failed to load jobs.</p>
        </div>
      )}

      {!error && jobList.length === 0 && (
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">No job descriptions yet</p>
          <p className="mt-1 text-xs text-slate-400">Create a job description to start matching candidates</p>
          <Link
            href="/hr/jobs/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Job
          </Link>
        </div>
      )}

      {jobList.length > 0 && (
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="divide-y divide-slate-100">
            {jobList.map((job) => {
              const { dot, label: statusLabel, bg: statusBg, text: statusText } = statusConfig(job.status)
              return (
                <div
                  key={job.id}
                  className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-1.5 w-2 h-2 rounded-full ${dot} flex-shrink-0`} aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {job.title}
                      </h3>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                        {job.company && <span>{job.company}</span>}
                        {job.location && <span>{job.location}</span>}
                        {job.seniority && <span className="capitalize">{job.seniority}</span>}
                        <span>{relativeTime(job.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBg} ${statusText}`}>
                      {statusLabel}
                    </span>

                    {job.status === "ready" && (
                      <Link
                        href={`/hr/jobs/${job.id}/candidates`}
                        className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
                      >
                        View Candidates
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
