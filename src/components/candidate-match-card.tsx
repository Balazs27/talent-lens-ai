"use client"

import { DemoToastButton } from "@/components/demo-toast-button"
import { GapAnalysisPanel } from "@/components/gap-analysis-panel"

interface CandidateMatchCardProps {
  full_name: string
  score: number
  matched_required: number
  matched_preferred: number
  matched_nice_to_have: number
  missing_required: number
  jobId?: string
  resumeId?: string
}

export function CandidateMatchCard({
  full_name,
  score,
  matched_required,
  matched_preferred,
  matched_nice_to_have,
  missing_required,
  jobId,
  resumeId,
}: CandidateMatchCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 flex items-start gap-5">
      {/* Score badge */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-blue-50 border border-blue-200 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-blue-700">
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] text-blue-400 uppercase">score</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {full_name}
        </h3>

        {/* Skill match breakdown */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-green-700">
            {matched_required} required matched
          </span>
          {matched_preferred > 0 && (
            <span className="text-amber-600">
              {matched_preferred} preferred matched
            </span>
          )}
          {matched_nice_to_have > 0 && (
            <span className="text-gray-500">
              {matched_nice_to_have} nice-to-have matched
            </span>
          )}
        </div>

        {/* Missing required — prominently red */}
        {missing_required > 0 && (
          <p className="mt-2 text-sm font-medium text-red-600">
            {missing_required} required skill{missing_required > 1 ? "s" : ""} missing
          </p>
        )}
      </div>

      {/* Actions */}
      {jobId && resumeId && (
        <div className="flex-shrink-0 flex items-center gap-2">
          <DemoToastButton
            label="Invite"
            toastMessage="Invite sent (demo)"
          />
          <GapAnalysisPanel
            jobId={jobId}
            resumeId={resumeId}
            mode="hr"
          />
        </div>
      )}
    </div>
  )
}
