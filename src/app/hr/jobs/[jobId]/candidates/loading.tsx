export default function CandidatesLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Back link + header skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-32 rounded-md bg-slate-200/60 animate-pulse" />
        <div className="border-l-2 border-blue-500 pl-3 space-y-2">
          <div className="h-7 w-64 rounded-lg bg-slate-200/70 animate-pulse" />
          <div className="h-4 w-80 rounded-md bg-slate-100/70 animate-pulse" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="h-11 rounded-xl bg-slate-100/80 animate-pulse" />

      {/* Card skeletons */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/60 bg-white/70 shadow-sm overflow-hidden"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="p-5 flex items-start gap-4">
            {/* Score circle */}
            <div className="w-[58px] h-[58px] rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded-md bg-slate-200/70 animate-pulse" />
              <div className="h-3 w-28 rounded-md bg-slate-100/70 animate-pulse" />
              <div className="h-3 w-52 rounded-md bg-slate-100/70 animate-pulse" />
            </div>
            <div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  )
}
