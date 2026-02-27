"use client"

import { DemoToastButton } from "@/components/demo-toast-button"
import { GapAnalysisPanel } from "@/components/gap-analysis-panel"
import { MatchExplanationPanel } from "@/components/match-explanation-panel"

interface JobMatchCardProps {
  title: string
  company: string | null
  location?: string | null
  seniority?: string | null
  matchPercent: number
  matched_required: number
  matched_preferred: number
  matched_nice_to_have: number
  missing_required: number
  tier: "strong" | "potential" | "weak"
  semanticPercent?: number
  skillCoverage?: number
  matchedSkillNames?: string[]
  missingRequiredSkillNames?: string[]
  jobId?: string
  resumeId?: string
}

const tierStyles = {
  strong:    "bg-green-50 text-green-700 border-green-200",
  potential: "bg-amber-50 text-amber-700 border-amber-200",
  weak:      "bg-slate-100 text-slate-500 border-slate-200",
} as const

const tierLabels = {
  strong:    "Strong",
  potential: "Potential",
  weak:      "Weak",
} as const

export function JobMatchCard({
  title,
  company,
  location,
  seniority,
  matchPercent,
  matched_required,
  matched_preferred,
  matched_nice_to_have,
  missing_required,
  tier,
  semanticPercent,
  skillCoverage,
  matchedSkillNames,
  missingRequiredSkillNames,
  jobId,
  resumeId,
}: JobMatchCardProps) {
  const totalRequired = matched_required + missing_required

  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(37,99,235,0.15)] hover:-translate-y-0.5 transition-all duration-300 p-5 flex items-start gap-5">
      {/* Match % badge */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 flex flex-col items-center justify-center shadow-inner">
        <span className="text-lg font-bold text-blue-700">
          {matchPercent}%
        </span>
        <span className="text-[10px] text-blue-500 uppercase tracking-wider font-semibold">
          match
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 truncate">
            {title}
          </h3>
          <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierStyles[tier]}`}>
            {tierLabels[tier]}
          </span>
        </div>

        {/* Company + location + seniority */}
        {(company || location || seniority) && (
          <p className="text-sm font-medium text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {company && <span>{company}</span>}
            {location && <span className="text-slate-400">{location}</span>}
            {seniority && (
              <span className="text-[11px] capitalize bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2 py-0.5">
                {seniority}
              </span>
            )}
          </p>
        )}

        {/* Score badges */}
        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1.5 text-xs font-medium">
          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
            {matched_required} / {totalRequired} required
          </span>
          {matched_preferred > 0 && (
            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50">
              {matched_preferred} preferred
            </span>
          )}
          {matched_nice_to_have > 0 && (
            <span className="text-slate-500 bg-slate-100/50 px-2 py-0.5 rounded-md border border-slate-200/50">
              {matched_nice_to_have} nice-to-have
            </span>
          )}
          {semanticPercent !== undefined && semanticPercent > 0 && (
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
              {semanticPercent}% semantic
            </span>
          )}
          {skillCoverage !== undefined && skillCoverage > 0 && (
            <span className="text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100/50">
              {skillCoverage}% coverage
            </span>
          )}
        </div>

        {/* Matched skill pills */}
        {matchedSkillNames && matchedSkillNames.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {matchedSkillNames.slice(0, 3).map((name) => (
              <span
                key={name}
                className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2 py-0.5"
              >
                {name}
              </span>
            ))}
            {matchedSkillNames.length > 3 && (
              <span className="text-[11px] text-slate-400">
                +{matchedSkillNames.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Missing required skill pills (replaces plain text when names are available) */}
        {missingRequiredSkillNames && missingRequiredSkillNames.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            {missingRequiredSkillNames.slice(0, 3).map((name) => (
              <span
                key={name}
                className="text-[11px] bg-red-50 text-red-600 border border-red-100 rounded-full px-2 py-0.5"
              >
                {name}
              </span>
            ))}
            {missingRequiredSkillNames.length > 3 && (
              <span className="text-[11px] text-slate-400">
                +{missingRequiredSkillNames.length - 3} missing
              </span>
            )}
          </div>
        ) : missing_required > 0 ? (
          <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {missing_required} required skill{missing_required > 1 ? "s" : ""} missing
          </p>
        ) : null}
      </div>

      {/* Actions */}
      {jobId && resumeId && (
        <div
          className="flex-shrink-0 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <DemoToastButton
            label="Apply"
            toastMessage="Application opened (demo)"
          />
          <GapAnalysisPanel
            jobId={jobId}
            resumeId={resumeId}
            mode="employee"
          />
          <MatchExplanationPanel
            jobId={jobId}
            resumeId={resumeId}
            mode="employee"
          />
        </div>
      )}
    </div>
  )
}
