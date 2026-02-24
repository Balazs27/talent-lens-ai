import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

interface CandidateScore {
  score: number
}

/* ── Decorative sparkline (static SVG placeholder) ── */
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
    <svg
      viewBox="0 0 64 28"
      fill="none"
      className="w-16 h-7"
      aria-hidden="true"
    >
      <path
        d={d}
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={`${d} L62 28 L2 28Z`} fill={fill} />
    </svg>
  )
}

/* ── Pipeline placeholder items ── */
const pipelineItems = [
  {
    color: "bg-blue-500",
    label: "New job ready for matching",
    detail: "Skills extracted successfully",
    time: "Just now",
  },
  {
    color: "bg-emerald-500",
    label: "3 candidates matched",
    detail: "Senior Engineer role",
    time: "2h ago",
  },
  {
    color: "bg-amber-500",
    label: "Gap analysis available",
    detail: "Product Designer role",
    time: "Yesterday",
  },
]

export default async function HRDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const name = user.user_metadata?.full_name || "there"

  // Fetch real counts + job IDs for avg score
  const [jobsResult, candidatesResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact" })
      .eq("created_by", user.id)
      .eq("status", "ready"),
    supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("status", "ready"),
  ])

  const activeJobs = jobsResult.count ?? 0
  const candidateCount = candidatesResult.count ?? 0
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
          allScores.push(c.score)
        }
      }
    }
    if (allScores.length > 0) {
      avgScore =
        allScores.reduce((a, b) => a + b, 0) / allScores.length
    }
  }

  const hasData = activeJobs > 0 || candidateCount > 0

  return (
    <div className="max-w-5xl space-y-8">
      {/* ── Hero ── */}
      <section className="relative animate-[fadeUp_0.5s_ease-out_both]">
        {/* Glow behind hero */}
        <div
          className="absolute -inset-3 rounded-3xl bg-blue-500/[0.06] blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 p-8 text-white overflow-hidden shadow-[0_4px_24px_rgba(37,99,235,0.3)]">
          {/* Internal light orb */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/[0.06] blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
              HR Command Center
            </p>
            <h1 className="mt-1.5 text-2xl font-bold">
              Welcome back, {name}
            </h1>
            <p className="mt-2 text-sm text-blue-100/80 max-w-md">
              Manage job descriptions, review candidates, and track your hiring
              pipeline.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/hr/jobs/new"
                className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition-all hover:bg-blue-50 hover:shadow-md"
              >
                + Create Job
              </Link>
              <Link
                href="/hr/jobs"
                className="inline-flex items-center rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white border border-white/20 transition-all hover:bg-white/20"
              >
                View Candidates
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
          {/* Featured: Avg Match Score — gradient stroke border */}
          <div className="lg:col-span-3">
            <div className="relative h-full rounded-xl p-px bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600/40 shadow-[0_0_24px_rgba(37,99,235,0.12)]">
              <div className="h-full rounded-[11px] bg-white/90 backdrop-blur-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-600">
                      Avg. Match Score
                    </h3>
                    <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                      {avgScore !== null ? (
                        avgScore.toFixed(1)
                      ) : (
                        <span className="text-slate-300">&mdash;</span>
                      )}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {avgScore !== null
                        ? "Average across all candidates and jobs"
                        : "Scores appear after candidates match"}
                    </p>
                  </div>
                  <Sparkline variant="brand" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary KPIs — stacked */}
          <div className="lg:col-span-2 grid gap-4">
            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-10px_rgba(37,99,235,0.1)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">
                    Active Jobs
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {activeJobs}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {activeJobs === 0
                      ? "Post your first job description"
                      : "With extracted skills"}
                  </p>
                </div>
                <Sparkline />
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-10px_rgba(37,99,235,0.1)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">
                    Candidates
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {candidateCount}
                  </p>
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

      {/* ── Pipeline Snapshot ── */}
      <section
        className="animate-[fadeUp_0.5s_ease-out_both]"
        style={{ animationDelay: "200ms" }}
      >
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Pipeline Snapshot
            </h2>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Recent
            </span>
          </div>

          {!hasData ? (
            /* Empty state */
            <div className="px-5 py-12 text-center">
              <div className="mx-auto w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">
                Your pipeline is empty
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Post a job description to see activity here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pipelineItems.map((item) => (
                <div
                  key={item.label}
                  className="px-5 py-3.5 flex items-center gap-3 transition-colors hover:bg-slate-50/60"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${item.color} shrink-0`}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
