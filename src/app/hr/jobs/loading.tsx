export default function JobsLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Page header + action skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="border-l-2 border-blue-500 pl-3 space-y-2">
          <div className="h-7 w-48 rounded-lg bg-slate-200/70 animate-pulse" />
          <div className="h-4 w-64 rounded-md bg-slate-100/70 animate-pulse" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-blue-100/80 animate-pulse flex-shrink-0" />
      </div>

      {/* Job list skeleton */}
      <div className="rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-slate-200 flex-shrink-0 animate-pulse" />
                <div className="space-y-1.5 min-w-0">
                  <div
                    className="h-4 rounded-md bg-slate-200/70 animate-pulse"
                    style={{ width: `${140 + (i * 30) % 80}px` }}
                  />
                  <div className="h-3 w-32 rounded-md bg-slate-100/60 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="h-5 w-14 rounded-full bg-slate-100 animate-pulse" />
                {i % 2 === 0 && (
                  <div className="h-8 w-28 rounded-xl bg-slate-100/80 animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
