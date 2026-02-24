export function ProblemSection() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl rounded-3xl bg-white/60 backdrop-blur-md border border-slate-200/50 p-8 md:p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
          The black box of hiring is broken.
        </h2>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Traditional platforms rely on rigid keyword searches, leaving incredible internal talent undiscovered and forcing recruiters to guess. TalentLens translates human experience into structured data, making matching transparent, accurate, and undeniable.
        </p>
      </div>
    </section>
  );
}