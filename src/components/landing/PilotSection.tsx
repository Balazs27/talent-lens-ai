export function PilotSection() {
  const bullets = [
    "Up to 200 employees",
    "HR admin dashboard",
    "Explainable skill-based matching",
  ];

  return (
    <section className="py-24 px-6 bg-slate-950 border-t border-slate-800/60">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4">
          Pilot Program
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
          Launch with a 30-Day Internal Mobility Pilot
        </h2>
        <p className="text-lg text-slate-400 leading-relaxed mb-10">
          Start with a focused pilot scoped to a single team or department.
          Validate skill-based matching inside your organisation before
          committing to a full enterprise rollout.
        </p>
        <ul className="inline-flex flex-col gap-3 text-left">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 text-base text-slate-300 font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30">
                <svg className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
