"use client"

import { useState, useMemo } from "react"
import { CandidateMatchCard } from "@/components/candidate-match-card"
import { MatchFilterBar } from "@/components/match-filter-bar"
import {
  DEFAULT_FILTERS,
  filterCandidateMatches,
  computeSkillCoverage,
  type MatchFilterState,
} from "@/lib/match-filters"

export interface CandidateMatch {
  resume_id: string
  user_id: string
  full_name: string
  matched_required: number
  matched_preferred: number
  matched_nice_to_have: number
  missing_required: number
  total_skills: number
  matched_skill_names: string[]
  missing_required_skill_names: string[]
  hybrid_score: number
  deterministic_score_normalized: number
  semantic_similarity: number
}

type Tier = "strong" | "potential" | "weak"

function getTier(score: number): Tier {
  if (score >= 0.60) return "strong"
  if (score >= 0.40) return "potential"
  return "weak"
}

interface CandidateListProps {
  candidates: CandidateMatch[]
  jobId: string
}

export function CandidateList({ candidates, jobId }: CandidateListProps) {
  const [filters, setFilters] = useState<MatchFilterState>(DEFAULT_FILTERS)
  const [showWeak, setShowWeak] = useState(false)

  const filtered = useMemo(
    () => filterCandidateMatches(candidates, filters),
    [candidates, filters]
  )

  const strongAndPotential = filtered.filter(
    (c) => getTier(c.hybrid_score) !== "weak"
  )
  const weak = filtered.filter((c) => getTier(c.hybrid_score) === "weak")

  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 text-center">
        <p className="text-sm text-slate-500">
          No strong candidates found for this role.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <MatchFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        searchPlaceholder="Search candidates..."
        filteredCount={filtered.length}
        totalCount={candidates.length}
      />

      {strongAndPotential.length === 0 && weak.length === 0 && (
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 text-center">
          <p className="text-sm text-slate-500">No candidates match those filters.</p>
        </div>
      )}

      {/* Strong + Potential candidates */}
      {strongAndPotential.map((c) => (
        <CandidateMatchCard
          key={c.resume_id}
          full_name={c.full_name}
          matchPercent={Math.round(c.hybrid_score * 100)}
          matched_required={c.matched_required}
          matched_preferred={c.matched_preferred}
          matched_nice_to_have={c.matched_nice_to_have}
          missing_required={c.missing_required}
          tier={getTier(c.hybrid_score)}
          semanticPercent={Math.round(c.semantic_similarity * 100)}
          skillCoverage={computeSkillCoverage(
            c.matched_required,
            c.matched_preferred,
            c.matched_nice_to_have,
            c.total_skills
          )}
          matchedSkillNames={c.matched_skill_names}
          missingRequiredSkillNames={c.missing_required_skill_names}
          jobId={jobId}
          resumeId={c.resume_id}
        />
      ))}

      {/* Weak candidates toggle */}
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
              ? "Hide weak candidates"
              : `Show ${weak.length} weak candidate${weak.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* Weak candidates section */}
      {showWeak && weak.length > 0 && (
        <div className="space-y-3 pt-1 opacity-75">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
            Weak Candidates
          </p>
          {weak.map((c) => (
            <CandidateMatchCard
              key={c.resume_id}
              full_name={c.full_name}
              matchPercent={Math.round(c.hybrid_score * 100)}
              matched_required={c.matched_required}
              matched_preferred={c.matched_preferred}
              matched_nice_to_have={c.matched_nice_to_have}
              missing_required={c.missing_required}
              tier="weak"
              semanticPercent={Math.round(c.semantic_similarity * 100)}
              skillCoverage={computeSkillCoverage(
                c.matched_required,
                c.matched_preferred,
                c.matched_nice_to_have,
                c.total_skills
              )}
              matchedSkillNames={c.matched_skill_names}
              missingRequiredSkillNames={c.missing_required_skill_names}
              jobId={jobId}
              resumeId={c.resume_id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
