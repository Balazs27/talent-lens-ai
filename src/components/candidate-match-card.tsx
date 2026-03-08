"use client"

import { DemoToastButton } from "@/components/demo-toast-button"
import { GapAnalysisPanel } from "@/components/gap-analysis-panel"
import { MatchExplanationPanel } from "@/components/match-explanation-panel"

interface CandidateMatchCardProps {
  full_name: string
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

const tierConfig = {
  strong:    { label: "Strong",    badge: "text-emerald-700 bg-emerald-50 border-emerald-200", ring: "text-emerald-400" },
  potential: { label: "Potential", badge: "text-amber-700 bg-amber-50 border-amber-200",       ring: "text-amber-400" },
  weak:      { label: "Weak",      badge: "text-slate-500 bg-slate-100 border-slate-200",      ring: "text-slate-300" },
} as const

const RING_RADIUS = 26
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function CandidateMatchCard({
  full_name,
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
}: CandidateMatchCardProps) {
  const totalRequired = matched_required + missing_required
  const { label: tierLabel, badge: badgeClass, ring: ringClass } = tierConfig[tier]
  const ringOffset = RING_CIRCUMFERENCE * (1 - matchPercent / 100)

  const hasSkillData =
    (matchedSkillNames?.length ?? 0) > 0 ||
    (missingRequiredSkillNames?.length ?? 0) > 0 ||
    missing_required > 0

  const secondaryParts: string[] = []
  if (matched_preferred > 0) secondaryParts.push(`${matched_preferred} preferred`)
  if (matched_nice_to_have > 0) secondaryParts.push(`${matched_nice_to_have} nice-to-have`)
  if (semanticPercent && semanticPercent > 0) secondaryParts.push(`${semanticPercent}% semantic`)
  if (skillCoverage && skillCoverage > 0) secondaryParts.push(`${skillCoverage}% coverage`)

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_-8px_rgba(37,99,235,0.12)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">

      {/* ── Zone A + B: Score anchor + name/meta ── */}
      <div className="p-5 flex items-start gap-4">

        {/* Score circle */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="relative w-[58px] h-[58px]">
            <svg
              viewBox="0 0 58 58"
              className="w-full h-full -rotate-90"
              aria-hidden="true"
            >
              {/* Track */}
              <circle cx="29" cy="29" r={RING_RADIUS} fill="none" strokeWidth="3.5" className="text-slate-100" stroke="currentColor" />
              {/* Progress */}
              <circle
                cx="29" cy="29" r={RING_RADIUS}
                fill="none"
                strokeWidth="3.5"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                className={ringClass}
                stroke="currentColor"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[19px] font-black text-slate-800 leading-none tracking-tight">
                {matchPercent}
              </span>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Name + primary signal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-bold tracking-tight text-slate-900 leading-snug">
              {full_name}
            </h3>
            <span className={`flex-shrink-0 mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}>
              {tierLabel}
            </span>
          </div>

          {/* Required match — primary signal */}
          <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className={`text-[13px] font-bold ${matched_required === totalRequired && totalRequired > 0 ? "text-emerald-600" : "text-slate-700"}`}>
              {matched_required}
              <span className="font-normal text-slate-400 text-xs">/{totalRequired}</span>
            </span>
            <span className="text-[12px] text-slate-500">required skills</span>
            {missing_required > 0 && (
              <span className="text-[11px] text-rose-500 font-medium">
                · {missing_required} missing
              </span>
            )}
          </div>

          {/* Secondary metrics — muted */}
          {secondaryParts.length > 0 && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              {secondaryParts.join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* ── Zone C: Skill evidence ── */}
      {hasSkillData && (
        <div className="px-5 pb-4 pt-3 border-t border-slate-100 space-y-1.5">

          {matchedSkillNames && matchedSkillNames.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-[46px] flex-shrink-0">
                Matched
              </span>
              {matchedSkillNames.slice(0, 4).map((name) => (
                <span
                  key={name}
                  className="text-[11px] bg-emerald-50 text-emerald-700 rounded px-2 py-0.5 font-medium"
                >
                  {name}
                </span>
              ))}
              {matchedSkillNames.length > 4 && (
                <span className="text-[11px] text-slate-400">
                  +{matchedSkillNames.length - 4}
                </span>
              )}
            </div>
          )}

          {missingRequiredSkillNames && missingRequiredSkillNames.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-[46px] flex-shrink-0">
                Missing
              </span>
              {missingRequiredSkillNames.slice(0, 3).map((name) => (
                <span
                  key={name}
                  className="text-[11px] bg-rose-50 text-rose-600 rounded px-2 py-0.5 font-medium"
                >
                  {name}
                </span>
              ))}
              {missingRequiredSkillNames.length > 3 && (
                <span className="text-[11px] text-slate-400">
                  +{missingRequiredSkillNames.length - 3}
                </span>
              )}
            </div>
          ) : missing_required > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-[46px] flex-shrink-0">
                Missing
              </span>
              <span className="text-[11px] text-rose-600 font-medium">
                {missing_required} required skill{missing_required > 1 ? "s" : ""}
              </span>
            </div>
          ) : null}

        </div>
      )}

      {/* ── Zone D: Actions ── */}
      {jobId && resumeId && (
        <div
          className="px-5 pb-4 pt-3 border-t border-slate-100 space-y-2"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {/* Primary action */}
          <DemoToastButton
            label="Invite"
            toastMessage="Invite sent (demo)"
            className="rounded-lg border border-blue-500 bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          />

          {/* Analysis panels — each in own block div so expansion is self-contained */}
          <div>
            <GapAnalysisPanel jobId={jobId} resumeId={resumeId} mode="hr" />
          </div>
          <div>
            <MatchExplanationPanel jobId={jobId} resumeId={resumeId} mode="hr" />
          </div>
        </div>
      )}

    </div>
  )
}
