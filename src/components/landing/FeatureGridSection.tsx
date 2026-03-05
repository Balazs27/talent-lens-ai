export function FeatureGridSection() {
  const features = [
    { title: "Structured Extraction", desc: "We turn messy resumes and vague job descriptions into clean, normalized taxonomy data instantly.", icon: "⚡️" },
    { title: "Semantic Vector Search", desc: "Go beyond exact-match keywords. We understand the intent behind skills using advanced embeddings.", icon: "🧠" },
    { title: "Deterministic Scoring", desc: "No black-box AI scores. See exactly which capabilities matched and which are missing with 100% clarity.", icon: "🎯" }
  ];

  return (
    <section className="relative py-32 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            A new standard for talent.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="relative bg-white rounded-[2rem] p-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-200/60 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 flex items-center justify-center text-2xl mb-8 shadow-inner">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-lg font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
