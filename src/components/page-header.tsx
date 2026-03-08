import type { ReactNode } from "react"
import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  meta?: string | number
  backHref?: string
  backLabel?: string
}

export function PageHeader({
  title,
  description,
  action,
  meta,
  backHref,
  backLabel,
}: PageHeaderProps) {
  return (
    <div className="space-y-1">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors mb-1"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {backLabel ?? "Back"}
        </Link>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="border-l-2 border-blue-500 pl-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {meta !== undefined && meta !== 0 && (
              <span className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {meta}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
