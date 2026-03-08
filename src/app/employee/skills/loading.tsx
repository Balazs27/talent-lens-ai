export default function SkillsLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Page header skeleton */}
      <div className="border-l-2 border-blue-500 pl-3 space-y-2">
        <div className="h-7 w-28 rounded-lg bg-slate-200/70 animate-pulse" />
        <div className="h-4 w-60 rounded-md bg-slate-100/70 animate-pulse" />
      </div>

      {/* Summary card skeleton */}
      <div className="rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm p-5">
        <div className="flex items-baseline gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-7 w-10 rounded-md bg-slate-200/70 animate-pulse" />
              <div className="h-3 w-20 rounded-md bg-slate-100/60 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Category card skeletons */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm p-5"
        >
          <div className="h-3 w-24 rounded-md bg-slate-200/60 animate-pulse mb-3" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 + i }).map((_, j) => (
              <div
                key={j}
                className="h-6 rounded-full bg-blue-50 animate-pulse"
                style={{ width: `${60 + (j * 15) % 40}px` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
