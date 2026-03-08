export default function MatchesLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Page header skeleton */}
      <div className="border-l-2 border-blue-500 pl-3 space-y-2">
        <div className="h-7 w-40 rounded-lg bg-slate-200/70 animate-pulse" />
        <div className="h-4 w-72 rounded-md bg-slate-100/70 animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="h-11 rounded-xl bg-slate-100/80 animate-pulse" />

      {/* Card skeletons */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm overflow-hidden"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="p-5 flex items-start gap-4">
            {/* Score circle */}
            <div className="w-[58px] h-[58px] rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded-md bg-slate-200/70 animate-pulse" />
              <div className="h-3 w-32 rounded-md bg-slate-100/70 animate-pulse" />
              <div className="h-3 w-56 rounded-md bg-slate-100/70 animate-pulse" />
            </div>
          </div>
          <div className="px-5 pb-4 pt-3 border-t border-slate-100 flex gap-2 flex-wrap">
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-5 w-16 rounded-full bg-emerald-50 animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
