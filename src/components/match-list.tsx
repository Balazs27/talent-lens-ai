"use client"

import { useState } from "react"
import { JobMatchCard } from "@/components/job-match-card"
import { JobDescriptionModal } from "@/components/job-description-modal"
import Link from "next/link"

export interface JobMatch {
  job_id: string
  title: string
  company: string | null
  matched_required: number
  matched_preferred: number
  matched_nice_to_have: number
  missing_required: number
  hybrid_score: number
  deterministic_score_normalized: number
  semantic_similarity: number
}

type Tier = "strong" | "potential" | "weak"

function getTier(score: number): Tier {
  if (score >= 0.60) return "strong"
  if (score >= 0.45) return "potential"
  return "weak"
}

interface MatchListProps {
  matches: JobMatch[]
  resumeId: string
  jobTexts: Record<string, string>
}

export function MatchList({ matches, resumeId, jobTexts }: MatchListProps) {
  const [showWeak, setShowWeak] = useState(false)

  const strongAndPotential = matches.filter(
    (m) => getTier(m.hybrid_score) !== "weak"
  )
  const weak = matches.filter((m) => getTier(m.hybrid_score) === "weak")

  if (strongAndPotential.length === 0) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 text-center">
        <p className="text-sm text-slate-500">
          No strong matches found yet. Try improving your resume with more
          detail to improve your matches.
        </p>
        <Link
          href="/employee/resume"
          className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)]"
        >
          Update Resume
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Strong + Potential matches */}
      {strongAndPotential.map((match) => (
        <JobDescriptionModal
          key={match.job_id}
          title={match.title}
          company={match.company}
          rawText={jobTexts[match.job_id] ?? null}
        >
          <JobMatchCard
            title={match.title}
            company={match.company}
            matchPercent={Math.round(match.hybrid_score * 100)}
            matched_required={match.matched_required}
            matched_preferred={match.matched_preferred}
            matched_nice_to_have={match.matched_nice_to_have}
            missing_required={match.missing_required}
            tier={getTier(match.hybrid_score)}
            jobId={match.job_id}
            resumeId={resumeId}
          />
        </JobDescriptionModal>
      ))}

      {/* Weak matches toggle */}
      {weak.length > 0 && (
        <div className="pt-1">
          <button
            onClick={() => setShowWeak((v) => !v)}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${showWeak ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            {showWeak
              ? "Hide weak matches"
              : `Show ${weak.length} weak match${weak.length > 1 ? "es" : ""}`}
          </button>
        </div>
      )}

      {/* Weak matches section */}
      {showWeak && weak.length > 0 && (
        <div className="space-y-3 pt-1 opacity-75">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
            Weak Matches
          </p>
          {weak.map((match) => (
            <JobDescriptionModal
              key={match.job_id}
              title={match.title}
              company={match.company}
              rawText={jobTexts[match.job_id] ?? null}
            >
              <JobMatchCard
                title={match.title}
                company={match.company}
                matchPercent={Math.round(match.hybrid_score * 100)}
                matched_required={match.matched_required}
                matched_preferred={match.matched_preferred}
                matched_nice_to_have={match.matched_nice_to_have}
                missing_required={match.missing_required}
                tier="weak"
                jobId={match.job_id}
                resumeId={resumeId}
              />
            </JobDescriptionModal>
          ))}
        </div>
      )}
    </div>
  )
}
