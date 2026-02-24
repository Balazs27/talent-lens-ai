"use client"

import { useState } from "react"
import type {
  GapAnalysisResponse,
  EmployeeGapLLM,
  HrGapLLM,
  DeterministicGap,
  LearningPlanItem,
} from "@/lib/types/gap-analysis"

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
  const [result, setResult] = useState<GapAnalysisResponse | null>(null)

  async function handleAnalyze() {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/analyze/gap", {
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
      <div className="flex items-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analyzing..." : "Analyze Gap"}
        </button>
        {loading && (
          <span className="text-xs text-gray-400">
            Computing gap analysis...
          </span>
        )}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 shadow-sm p-4 space-y-4">
      {result.cached && (
        <span className="inline-block text-[10px] text-gray-400 uppercase">
          Cached result
        </span>
      )}

      <DeterministicSection
        data={result.deterministic}
        mode={mode}
      />

      {result.llm && mode === "employee" && (
        <EmployeeLLMSection data={result.llm as EmployeeGapLLM} />
      )}

      {result.llm && mode === "hr" && (
        <HrLLMSection data={result.llm as HrGapLLM} />
      )}

      {!result.llm && (
        <p className="text-xs text-gray-400">
          LLM recommendations unavailable.
        </p>
      )}
    </div>
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
        <h4 className="text-sm font-semibold text-gray-800">
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
          <p className="text-xs font-medium text-gray-500 mb-1">
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
          <p className="text-xs font-medium text-gray-700 mb-1">
            Impact-Ranked Missing Skills
          </p>
          <ol className="text-xs text-gray-600 space-y-0.5 list-decimal list-inside">
            {data.impact_ranked_missing.map((s, i) => (
              <li key={i}>
                <span className="font-medium">{String(s.skill_name)}</span>
                <span className="text-gray-400 ml-1">
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
    <div className="border-t border-gray-200 pt-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">
          Learning Recommendations
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
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
          <p className="text-xs font-medium text-gray-600 mb-1">
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
    <div className="rounded-lg bg-white border border-gray-200 shadow-sm p-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-gray-900">
          <span className="text-blue-400 mr-1.5">{index + 1}.</span>
          {item.skill}
        </h5>
        <span className="text-xs text-gray-400">
          ~{item.estimated_time_weeks}w
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{item.why_it_matters}</p>
      {item.recommended_actions.length > 0 && (
        <ul className="mt-1.5 text-xs text-gray-600 space-y-0.5">
          {item.recommended_actions.map((action, j) => (
            <li key={j} className="flex items-start gap-1.5">
              <span className="text-gray-300 mt-0.5">-</span>
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
    <div className="border-t border-gray-200 pt-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-800">
        Executive Summary
      </h4>

      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-gray-500">Ramp-up:</span>{" "}
          <span className="font-medium">
            {data.estimated_ramp_up_months} month
            {data.estimated_ramp_up_months !== 1 ? "s" : ""}
          </span>
        </div>
        <RiskBadge level={data.risk_level} />
      </div>

      {data.training_recommendations.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">
            Training Recommendations
          </p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {data.training_recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-gray-300 mt-0.5">-</span>
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
    gray: "bg-gray-50 border-gray-200 text-gray-600",
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
