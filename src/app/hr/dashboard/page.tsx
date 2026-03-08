import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

interface CandidateScore {
  hybrid_score: number
}

interface RecentJob {
  id: string
  title: string
  status: string
  created_at: string
}

/* ── Relative time helper ── */
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

/* ── Job status config ── */
function jobStatusConfig(status: string): { dot: string; label: string } {
  switch (status) {
    case "ready":
      return { dot: "bg-emerald-400", label: "Ready for matching" }
    case "pending":
    case "processing":
      return { dot: "bg-amber-400", label: "Processing skills…" }
    case "error":
      return { dot: "bg-red-400", label: "Processing failed" }
    default:
      return { dot: "bg-slate-300", label: status }
  }
}

/* ── Decorative sparkline (static SVG) ── */
function Sparkline({ variant = "muted" }: { variant?: "brand" | "muted" }) {
  const stroke =
    variant === "brand" ? "rgba(37,99,235,0.5)" : "rgba(100,116,139,0.25)"
  const fill =
    variant === "brand" ? "rgba(37,99,235,0.08)" : "rgba(100,116,139,0.04)"
  const d =
    variant === "brand"
      ? "M2 22 L10 17 L18 20 L26 11 L34 14 L42 7 L50 9 L58 4 L62 2"
      : "M2 18 L10 20 L18 16 L26 19 L34 13 L42 15 L50 10 L58 12 L62 8"

  return (
    <svg viewBox="0 0 64 28" fill="none" className="w-16 h-7" aria-hidden="true">
      <path d={d} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${d} L62 28 L2 28Z`} fill={fill} />
    </svg>
  )
}

export default async function HRDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const name = user.user_metadata?.full_name || "there"

  // Fetch real counts + recent jobs in parallel
  const [jobsResult, candidatesResult, recentJobsResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact" })
      .eq("created_by", user.id)
      .eq("status", "ready"),
    supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("status", "ready")
      .eq("is_active", true),
    supabase
      .from("jobs")
      .select("id, title, status, created_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const activeJobs = jobsResult.count ?? 0
  const candidateCount = candidatesResult.count ?? 0
  const recentJobs: RecentJob[] = recentJobsResult.data ?? []
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
          if (typeof c.hybrid_score === "number") {
            allScores.push(c.hybrid_score)
          }
        }
      }
    }
    if (allScores.length > 0) {
      avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length
    }
  }

  return (
    <div className="max-w-5xl space-y-8">

      {/* ── Hero ── */}
      <section className="relative animate-[fadeUp_0.5s_ease-out_both]">
        <div
          className="absolute -inset-3 rounded-3xl bg-blue-500/[0.06] blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative rounded-[2rem] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 md:p-10 text-white overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.25)] border border-white/[0.07]">

          {/* Dot grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />

          {/* Blue orb accent */}
          <div
            className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full bg-blue-500/20 blur-[90px] -translate-y-1/3 translate-x-1/4 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-400/10 blur-[80px] translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-300 bg-blue-500/20 border border-blue-400/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" aria-hidden="true" />
              HR Command Center
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {name}
            </h1>
            <p className="mt-2 text-sm text-blue-100/70 max-w-md">
              Post job descriptions, review candidate matches, and track your hiring pipeline.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/hr/jobs/new"
                className="btn-shimmer inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:bg-blue-50 hover:shadow-md active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Job
              </Link>
              <Link
                href="/hr/jobs"
                className="inline-flex items-center rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white border border-white/20 transition-all hover:bg-white/20"
              >
                View All Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPIs ── */}
      <section
        className="animate-[fadeUp_0.5s_ease-out_both]"
        style={{ animationDelay: "100ms" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Featured: Avg Match Score */}
          <div className="lg:col-span-3">
            <div className="relative h-full rounded-xl p-px bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600/40 shadow-[0_0_24px_rgba(37,99,235,0.12)]">
              <div className="h-full rounded-[15px] bg-white/90 backdrop-blur-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-600">
                      Avg. Match Score
                    </h3>
                    <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                      {avgScore !== null ? (
                        <>
                          {Math.round(avgScore * 100)}
                          <span className="text-xl font-semibold text-slate-400 ml-0.5">%</span>
                        </>
                      ) : (
                        <span className="text-slate-300">&mdash;</span>
                      )}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {avgScore !== null
                        ? "Average hybrid score across all candidates"
                        : "Appears once candidates are matched to a job"}
                    </p>
                  </div>
                  <Sparkline variant="brand" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="lg:col-span-2 grid gap-4">
            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(37,99,235,0.15)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Active Jobs</h3>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{activeJobs}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {activeJobs === 0
                      ? "Post your first job description"
                      : "With extracted skill requirements"}
                  </p>
                </div>
                <Sparkline />
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(37,99,235,0.15)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Candidates</h3>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{candidateCount}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {candidateCount === 0
                      ? "Appear after JD processing"
                      : "Resumes in the pool"}
                  </p>
                </div>
                <Sparkline />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Getting Started (new HR user) or Recent Jobs (returning) ── */}
      <section
        className="animate-[fadeUp_0.5s_ease-out_both]"
        style={{ animationDelay: "200ms" }}
      >
        {recentJobs.length === 0 ? (
          /* ── Getting Started checklist (new HR user) ── */
          <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Getting Started
              </h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Step 1 of 3
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Step 1 — Active */}
              <Link
                href="/hr/jobs/new"
                className="group px-5 py-4 flex items-center gap-4 bg-blue-50/30 hover:bg-blue-50/60 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 ring-2 ring-blue-300/40">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-700 group-hover:text-blue-800 transition-colors">
                    Create your first job description
                  </p>
                  <p className="text-xs text-blue-500/80">Start here — paste a JD to extract skill requirements</p>
                </div>
                <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded-full flex-shrink-0">
                  Start
                </span>
              </Link>

              {/* Step 2 — Locked */}
              <div className="px-5 py-4 flex items-center gap-4 opacity-40 select-none">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-600">Review matched candidates</p>
                  <p className="text-xs text-slate-400">Unlocks after job description is processed</p>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>

              {/* Step 3 — Locked */}
              <div className="px-5 py-4 flex items-center gap-4 opacity-40 select-none">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-600">Analyze fit and skill gaps</p>
                  <p className="text-xs text-slate-400">Unlocks after reviewing candidates</p>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          /* ── Recent Jobs (returning HR user) ── */
          <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Recent Jobs
              </h2>
              <Link
                href="/hr/jobs"
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wide"
              >
                View all →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentJobs.map((job) => {
                const { dot, label: statusLabel } = jobStatusConfig(job.status)
                return (
                  <Link
                    key={job.id}
                    href={`/hr/jobs/${job.id}/candidates`}
                    className="group px-5 py-3.5 flex items-center gap-3 transition-colors hover:bg-slate-50/60"
                  >
                    <div className={`w-2 h-2 rounded-full ${dot} shrink-0`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate transition-colors">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-400">{statusLabel}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {relativeTime(job.created_at)}
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </section>

    </div>
  )
}
