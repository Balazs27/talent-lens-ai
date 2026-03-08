import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

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

/* ── Next-step action items ── */
const nextSteps = [
  {
    href: "/employee/resume",
    label: "Upload your resume",
    detail: "Get matched with open positions",
    icon: (
      <svg
        className="w-5 h-5 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
    iconBg: "bg-blue-50",
  },
  {
    href: "/employee/matches",
    label: "Browse job matches",
    detail: "See roles that fit your skills",
    icon: (
      <svg
        className="w-5 h-5 text-emerald-500"
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
    ),
    iconBg: "bg-emerald-50",
  },
  {
    href: "/employee/skills",
    label: "Review your skills",
    detail: "Track your extracted skill profile",
    icon: (
      <svg
        className="w-5 h-5 text-amber-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    iconBg: "bg-amber-50",
  },
]

export default async function EmployeeDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const name = user.user_metadata?.full_name || "there"

  // Fetch resume count + active resume in parallel
  // resumeCountResult: total ready resumes for display metric
  // latestResumeResult: the single active resume (partial unique index = at most 1 row)
  const [resumeCountResult, latestResumeResult] = await Promise.all([
    supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "ready"),
    supabase
      .from("resumes")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "ready")
      .eq("is_active", true)
      .single(),
  ])

  const resumeCount = resumeCountResult.count ?? 0
  const latestResume = latestResumeResult.data

  // Fetch match count + skill count for latest resume
  let matchCount = 0
  let skillCount = 0

  if (latestResume) {
    const [matchResult, skillResult] = await Promise.all([
      supabase.rpc("match_jobs_for_resume", {
        p_resume_id: latestResume.id,
      }),
      supabase
        .from("resume_skills")
        .select("skill_id", { count: "exact", head: true })
        .eq("resume_id", latestResume.id),
    ])
    matchCount = matchResult.data?.length ?? 0
    skillCount = skillResult.count ?? 0
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* ── Hero ── */}
      <section className="relative animate-[fadeUp_0.5s_ease-out_both]">
        {/* Glow behind hero */}
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
              Career Hub
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {name}
            </h1>
            <p className="mt-2 text-sm text-blue-100/80 max-w-md">
              Upload your resume, discover matching roles, and grow your skills.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/employee/resume"
                className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition-all hover:bg-blue-50 hover:shadow-md"
              >
                Upload Resume
              </Link>
              <Link
                href="/employee/matches"
                className="inline-flex items-center rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white border border-white/20 transition-all hover:bg-white/20"
              >
                View Matches
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
          {/* Featured: Job Matches — gradient stroke border */}
          <div className="lg:col-span-3">
            <div className="relative h-full rounded-xl p-px bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600/40 shadow-[0_0_24px_rgba(37,99,235,0.12)]">
              <div className="h-full rounded-[15px] bg-white/90 backdrop-blur-xl p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-600">
                      Job Matches
                    </h3>
                    <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                      {latestResume ? (
                        matchCount
                      ) : (
                        <span className="text-slate-300">&mdash;</span>
                      )}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {latestResume
                        ? "Roles matching your skill profile"
                        : "Matches appear after resume processing"}
                    </p>
                  </div>
                  <Sparkline variant="brand" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary KPIs — stacked */}
          <div className="lg:col-span-2 grid gap-4">
            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(37,99,235,0.15)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">
                    Resumes
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {resumeCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {resumeCount === 0
                      ? "Upload your first resume"
                      : "With extracted skills"}
                  </p>
                </div>
                <Sparkline />
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_12px_40px_-12px_rgba(37,99,235,0.15)] hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">
                    Skills Extracted
                  </h3>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {latestResume ? (
                      skillCount
                    ) : (
                      <span className="text-slate-300">&mdash;</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {latestResume
                      ? "Matched to taxonomy"
                      : "Extracted from your resume"}
                  </p>
                </div>
                <Sparkline />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Next Steps ── */}
      <section
        className="animate-[fadeUp_0.5s_ease-out_both]"
        style={{ animationDelay: "200ms" }}
      >
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Next Steps
            </h2>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              For you
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {nextSteps.map((step) => (
              <Link
                key={step.href}
                href={step.href}
                className="group px-5 py-4 flex items-center gap-4 transition-colors hover:bg-slate-50/60"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${step.iconBg} flex items-center justify-center shrink-0`}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-400">{step.detail}</p>
                </div>
                <svg
                  className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
