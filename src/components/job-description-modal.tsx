"use client"

import { useState, useEffect, useCallback, type ReactNode } from "react"

interface JobDescriptionModalProps {
  title: string
  company: string | null
  rawText: string | null
  children: ReactNode
}

export function JobDescriptionModal({
  title,
  company,
  rawText,
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={close}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl max-h-[80vh] rounded-xl border border-gray-200 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
              <div className="min-w-0 pr-4">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h2>
                {company && (
                  <p className="mt-0.5 text-sm text-gray-500">{company}</p>
                )}
              </div>
              <button
                onClick={close}
                className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
              {rawText ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {rawText}
                </pre>
              ) : (
                <p className="text-sm text-gray-400">
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
