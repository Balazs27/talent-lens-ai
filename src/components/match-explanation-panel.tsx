"use client"

import { useState } from "react"
import { Spinner } from "@/components/toast"
import type { MatchExplanationResponse, MatchExplanation } from "@/lib/types/match-explanation"

interface MatchExplanationPanelProps {
  jobId: string
  resumeId: string
  mode: "employee" | "hr"
}

export function MatchExplanationPanel({
  jobId,
  resumeId,
  mode,
}: MatchExplanationPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MatchExplanationResponse | null>(null)

  async function handleExplain() {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/explain/match", {
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

  // Initial / loading / error state: show button
  if (!result) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleExplain}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow disabled:opacity-50"
        >
          {loading ? (
            <>
              <Spinner />
              <span>Explaining…</span>
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5 text-slate-400"
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
              Explain
            </>
          )}
        </button>
        {error && (
          <p className="text-[11px] text-red-500 text-right max-w-[140px]">{error}</p>
        )}
      </div>
    )
  }

  // LLM returned null
  if (!result.explanation) {
    return (
      <p className="text-[11px] text-slate-400 italic max-w-[200px] text-right">
        Explanation unavailable. Please try again later.
      </p>
    )
  }

  return <ExplanationPanel explanation={result.explanation} cached={result.cached} />
}

function ExplanationPanel({
  explanation,
  cached,
}: {
  explanation: MatchExplanation
  cached: boolean
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/60 backdrop-blur-sm overflow-hidden min-w-[220px] max-w-xs">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
          <svg
            className="w-3 h-3 text-blue-500 flex-shrink-0"
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
          Explanation

        </span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-3 pb-3 border-t border-slate-100 space-y-2.5 animate-[slideDown_0.2s_ease-out_both]">
          <Section label="Why it matches" icon="✓" iconColor="text-emerald-500" items={explanation.reasons} />
          <Section label="Gaps" icon="!" iconColor="text-amber-500" items={explanation.gaps} />
          <Section label="Improve" icon="→" iconColor="text-blue-500" items={explanation.improvements} />
        </div>
      )}
    </div>
  )
}

function Section({
  label,
  icon,
  iconColor,
  items,
}: {
  label: string
  icon: string
  iconColor: string
  items: string[]
}) {
  return (
    <div className="pt-2">
      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
            <span className={`flex-shrink-0 font-bold ${iconColor} leading-[1.4]`}>{icon}</span>
            <span className="leading-[1.4]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
