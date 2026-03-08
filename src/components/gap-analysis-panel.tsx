"use client"

import { useState } from "react"
import { Toast, Spinner } from "@/components/toast"
import type {
  GapAnalysisResponse,
  EmployeeGapLLM,
  HrGapLLM,
  DeterministicGap,
  LearningPlanItem,
} from "@/lib/types/gap-analysis"
import type { GapIntelligenceResponse, GapIntelligence, SkillPlanItem } from "@/lib/types/gap-intelligence"

// ─── Feature Flags ────────────────────────────────────────────
// Set to true to re-enable the Deep Analysis (Gap Intelligence) panel
const SHOW_DEEP_ANALYSIS = false

interface GapAnalysisPanelProps {
  jobId: string
  resumeId: string
  mode: "employee" | "hr"
}

export function GapAnalysisPanel({
  jobId,
  resumeId,
  mode,
}: GapAnalysisPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // cachedResult persists across open/close cycles so reopening is instant
  const [cachedResult, setCachedResult] = useState<GapAnalysisResponse | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  async function handleToggle() {
    // If panel is open, collapse it
    if (isOpen) {
      setIsOpen(false)
      return
    }

    // If we already have a cached result, just open without fetching
    if (cachedResult) {
      setIsOpen(true)
      return
    }

    // First fetch
    setError(null)
    setToast(null)
    setLoading(true)

    try {
      const res = await fetch("/api/analyze/gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, resumeId, mode }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data.error || `Request failed (${res.status})`
        setError(msg)
        setToast({ message: msg, type: "error" })
        return
      }

      setCachedResult(data)
      setIsOpen(true)
      setToast({ message: "Gap analysis complete!", type: "success" })
    } catch {
      setError("Network error. Please try again.")
      setToast({ message: "Network error. Please try again.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          disabled={loading}
          className="inline-flex items-center rounded-xl border border-slate-200/80 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Spinner />}
          {loading ? "Analyzing..." : isOpen ? "Hide Analysis" : "Analyze Gap"}
        </button>
        {loading && (
          <span className="text-xs text-slate-400">
            Computing gap analysis...
          </span>
        )}
        {error && (
          <span className="text-xs text-red-600">{error}</span>
        )}
      </div>

      {isOpen && cachedResult && (
        <div className="mt-3 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-4 space-y-4">
          <DeterministicSection
            data={cachedResult.deterministic}
            mode={mode}
          />

          {cachedResult.llm && mode === "employee" && (
            <EmployeeLLMSection data={cachedResult.llm as EmployeeGapLLM} />
          )}

          {cachedResult.llm && mode === "hr" && (
            <HrLLMSection data={cachedResult.llm as HrGapLLM} />
          )}

          {!cachedResult.llm && (
            <p className="text-xs text-slate-400">
              LLM recommendations unavailable.
            </p>
          )}

          {SHOW_DEEP_ANALYSIS && (
            <GapIntelligenceSection
              jobId={jobId}
              resumeId={resumeId}
              mode={mode}
              hasMissingSkills={
                cachedResult.deterministic.missing_required.length > 0 ||
                cachedResult.deterministic.missing_preferred.length > 0
              }
            />
          )}
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  )
}

// ─── Deterministic Results ────────────────────────────────────

function DeterministicSection({
  data,
  mode,
}: {
  data: DeterministicGap
  mode: "employee" | "hr"
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h4 className="text-sm font-semibold text-slate-800">
          Skill Gap Analysis
        </h4>
        <span
          className={`text-sm font-bold ${
            data.score >= 80
              ? "text-green-700"
              : data.score >= 50
                ? "text-amber-600"
                : "text-red-600"
          }`}
        >
          {data.score}% readiness
        </span>
      </div>

      {/* Matched skills summary */}
      {data.matched_required.length > 0 && (
        <div>
          <p className="text-xs font-medium text-green-700 mb-1">
            Matched Required ({data.matched_required.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {data.matched_required.map((s, i) => (
              <SkillBadge
                key={i}
                name={String(s.skill_name ?? "")}
                variant="green"
              />
            ))}
          </div>
        </div>
      )}

      {data.matched_preferred.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-600 mb-1">
            Matched Preferred ({data.matched_preferred.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {data.matched_preferred.map((s, i) => (
              <SkillBadge
                key={i}
                name={String(s.skill_name ?? "")}
                variant="amber"
              />
            ))}
          </div>
        </div>
      )}

      {/* Missing skills */}
      {data.missing_required.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-600 mb-1">
            Missing Required ({data.missing_required.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {data.missing_required.map((s, i) => (
              <SkillBadge
                key={i}
                name={String(s.skill_name ?? "")}
                variant="red"
                extra={
                  Number(s.years_missing) > 0
                    ? `${s.years_missing}y gap`
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {data.missing_preferred.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">
            Missing Preferred ({data.missing_preferred.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {data.missing_preferred.map((s, i) => (
              <SkillBadge
                key={i}
                name={String(s.skill_name ?? "")}
                variant="gray"
              />
            ))}
          </div>
        </div>
      )}

      {/* Impact-ranked missing (shown in HR mode or when there are items) */}
      {mode === "hr" && data.impact_ranked_missing.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-700 mb-1">
            Impact-Ranked Missing Skills
          </p>
          <ol className="text-xs text-slate-600 space-y-0.5 list-decimal list-inside">
            {data.impact_ranked_missing.map((s, i) => (
              <li key={i}>
                <span className="font-medium">{String(s.skill_name)}</span>
                <span className="text-slate-400 ml-1">
                  ({String(s.importance)}, impact: {String(s.impact_score)})
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

// ─── Employee LLM Section ─────────────────────────────────────

function EmployeeLLMSection({ data }: { data: EmployeeGapLLM }) {
  return (
    <div className="border-t border-slate-200 pt-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">
          Learning Recommendations
        </h4>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>
            ~{data.estimated_total_time_months} month
            {data.estimated_total_time_months !== 1 ? "s" : ""} total
          </span>
          <ConfidenceBadge level={data.confidence_level} />
        </div>
      </div>

      {/* Priority order */}
      {data.priority_order.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">
            Priority Order
          </p>
          <div className="flex flex-wrap gap-1">
            {data.priority_order.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs text-blue-800"
              >
                <span className="text-blue-400 font-mono text-[10px]">
                  {i + 1}
                </span>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Learning plan */}
      {data.learning_plan.length > 0 && (
        <div className="space-y-2">
          {data.learning_plan.map((item, i) => (
            <LearningPlanCard key={i} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function LearningPlanCard({
  item,
  index,
}: {
  item: LearningPlanItem
  index: number
}) {
  return (
    <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-slate-900">
          <span className="text-blue-400 mr-1.5">{index + 1}.</span>
          {item.skill}
        </h5>
        <span className="text-xs text-slate-400">
          ~{item.estimated_time_weeks}w
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{item.why_it_matters}</p>
      {item.recommended_actions.length > 0 && (
        <ul className="mt-1.5 text-xs text-slate-600 space-y-0.5">
          {item.recommended_actions.map((action, j) => (
            <li key={j} className="flex items-start gap-1.5">
              <span className="text-slate-300 mt-0.5">-</span>
              {action}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── HR LLM Section ───────────────────────────────────────────

function HrLLMSection({ data }: { data: HrGapLLM }) {
  return (
    <div className="border-t border-slate-200 pt-3 space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">
        Executive Summary
      </h4>

      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-slate-500">Ramp-up:</span>{" "}
          <span className="font-medium">
            {data.estimated_ramp_up_months} month
            {data.estimated_ramp_up_months !== 1 ? "s" : ""}
          </span>
        </div>
        <RiskBadge level={data.risk_level} />
      </div>

      {data.training_recommendations.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">
            Training Recommendations
          </p>
          <ul className="text-xs text-slate-600 space-y-0.5">
            {data.training_recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-slate-300 mt-0.5">-</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Shared UI primitives ─────────────────────────────────────

function SkillBadge({
  name,
  variant,
  extra,
}: {
  name: string
  variant: "green" | "amber" | "red" | "gray"
  extra?: string
}) {
  const styles = {
    green: "bg-green-50 border-green-200 text-green-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-800",
    gray: "bg-slate-50 border-slate-200 text-slate-600",
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${styles[variant]}`}
    >
      {name}
      {extra && <span className="opacity-60">({extra})</span>}
    </span>
  )
}

function ConfidenceBadge({ level }: { level: "low" | "medium" | "high" }) {
  const styles = {
    low: "bg-red-50 text-red-600",
    medium: "bg-amber-50 text-amber-600",
    high: "bg-green-50 text-green-600",
  }

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[level]}`}
    >
      {level} confidence
    </span>
  )
}

function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  const styles = {
    low: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-red-50 text-red-700 border-red-200",
  }

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${styles[level]}`}
    >
      {level} risk
    </span>
  )
}

// ─── Gap Intelligence Section ──────────────────────────────────

function GapIntelligenceSection({
  jobId,
  resumeId,
  mode,
  hasMissingSkills,
}: {
  jobId: string
  resumeId: string
  mode: "employee" | "hr"
  hasMissingSkills: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GapIntelligenceResponse | null>(null)

  if (!hasMissingSkills) return null

  async function handleDeepAnalysis() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/analyze/gap-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, resumeId, mode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`)
        return
      }
      setResult(data)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!result) {
    return (
      <div className="border-t border-slate-200 pt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeepAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200/80 bg-blue-50/50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100/60 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Spinner />
                Generating deep analysis...
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
                Deep Analysis
              </>
            )}
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
    )
  }

  if (!result.intelligence) {
    return (
      <div className="border-t border-slate-200 pt-3">
        <p className="text-xs text-slate-400">Advanced analysis unavailable. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="border-t border-slate-200 pt-3 space-y-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-slate-800">Advanced Gap Intelligence</h4>
  
      </div>
      <SkillPlanRoadmap items={result.intelligence.skill_plan} />
      <ResumeOptimizationList items={result.intelligence.resume_optimization} />
      <ImpactProjectionCard data={result.intelligence.impact_projection} />
    </div>
  )
}

function SkillPlanRoadmap({ items }: { items: SkillPlanItem[] }) {
  const sorted = [...items].sort((a, b) => a.priority - b.priority)
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Skill Development Roadmap
      </p>
      {sorted.map((item) => (
        <SkillPlanCard key={item.skill} item={item} />
      ))}
    </div>
  )
}

function SkillPlanCard({ item }: { item: SkillPlanItem }) {
  return (
    <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
            {item.priority}
          </span>
          <h5 className="text-sm font-semibold text-slate-900 truncate">{item.skill}</h5>
        </div>
        <span className="flex-shrink-0 text-[11px] text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
          ~{item.time_estimate}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-slate-500">{item.reason}</p>
      {item.suggested_actions.length > 0 && (
        <ul className="mt-1.5 text-xs text-slate-600 space-y-0.5">
          {item.suggested_actions.map((action, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-blue-300 mt-0.5 flex-shrink-0">→</span>
              {action}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ResumeOptimizationList({ items }: { items: string[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Resume Optimization
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
            <span className="text-blue-400 flex-shrink-0 font-bold mt-0.5">→</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ImpactProjectionCard({
  data,
}: {
  data: GapIntelligence["impact_projection"]
}) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 p-3 space-y-1">
      <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">
        Projected Impact
      </p>
      <p className="text-xl font-bold text-blue-700">{data.estimated_score_gain}</p>
      <p className="text-xs text-blue-600/80">{data.explanation}</p>
    </div>
  )
}
