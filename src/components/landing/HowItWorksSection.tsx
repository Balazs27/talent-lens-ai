export function HowItWorksSection() {
  const steps = [
    { number: "01", title: "Upload Document", description: "Employees drop in a resume; HR pastes a job description. We structure it instantly." },
    { number: "02", title: "Semantic Match", description: "Our hybrid engine ranks candidates and roles based on true capability alignment." },
    { number: "03", title: "Analyze Gaps", description: "View transparent breakdowns of matched and missing skills to guide upskilling." }
  ];

  return (
    <section className="relative py-32 px-6 bg-blue-50/50 border-y border-blue-100/50 overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/40 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">How It Works</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          {steps.map((step, idx) => (
            <div key={idx} className="flex-1 relative">
              <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600/80 to-indigo-300/50 mb-6 block tracking-tighter">{step.number}</span>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed text-lg">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
