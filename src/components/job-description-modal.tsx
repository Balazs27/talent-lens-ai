"use client"

import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { segmentJdText } from "@/lib/highlight-jd"

interface JobDescriptionModalProps {
  title: string
  company: string | null
  rawText: string | null
  matchedSkillNames?: string[]
  missingRequiredSkillNames?: string[]
  children: ReactNode
}

export function JobDescriptionModal({
  title,
  company,
  rawText,
  matchedSkillNames = [],
  missingRequiredSkillNames = [],
  children,
}: JobDescriptionModalProps) {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, close])

  // Compute segments only when modal opens (not on every render)
  const segments = useMemo(() => {
    if (!rawText) return null
    return segmentJdText(rawText, matchedSkillNames, missingRequiredSkillNames)
  }, [rawText, matchedSkillNames, missingRequiredSkillNames])

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true)
        }}
      >
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.18s_ease-out]"
          onClick={close}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl max-h-[80vh] rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col animate-[scaleIn_0.22s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div className="min-w-0 pr-4">
                <h2 className="text-lg font-semibold text-slate-900 truncate">
                  {title}
                </h2>
                {company && (
                  <p className="mt-0.5 text-sm text-slate-500">{company}</p>
                )}
              </div>

              {/* Legend */}
              {(matchedSkillNames.length > 0 || missingRequiredSkillNames.length > 0) && (
                <div className="flex items-center gap-3 mr-3 flex-shrink-0">
                  {matchedSkillNames.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-200 border border-green-400" />
                      Matched
                    </span>
                  )}
                  {missingRequiredSkillNames.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300" />
                      Missing
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={close}
                className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-5">
              {segments ? (
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
                  {segments.map((seg, i) => {
                    if (seg.kind === "matched") {
                      return (
                        <span
                          key={i}
                          title="Matched from your resume"
                          className="relative group bg-green-100 text-green-900 rounded px-0.5 border border-green-300/60 cursor-default"
                        >
                          {seg.text}
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-green-800 px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                            ✓ Matched from your resume
                          </span>
                        </span>
                      )
                    }
                    if (seg.kind === "missing") {
                      return (
                        <span
                          key={i}
                          title="Missing from your resume"
                          className="relative group bg-red-50 text-red-800 rounded px-0.5 border border-red-300/60 cursor-default"
                        >
                          {seg.text}
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-md bg-red-700 px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                            ✗ Missing from your resume
                          </span>
                        </span>
                      )
                    }
                    return <span key={i}>{seg.text}</span>
                  })}
                </pre>
              ) : (
                <p className="text-sm text-slate-400">
                  Job description text not available.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
