export function AboutSection() {
  return (
    <section className="relative py-32 px-6 border-t border-slate-200/50 bg-white/40 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-8">
          Built for Clarity and Scale
        </h2>
        <p className="text-lg md:text-2xl text-slate-600 leading-relaxed font-light">
          Internal Talent Matching MVP wasn't built to be another chat interface. It was engineered to deliver deterministic, explainable results powered by cutting-edge semantic matching. We believe talent decisions should be a science, not a guessing game.
        </p>
      </div>
    </section>
  );
}