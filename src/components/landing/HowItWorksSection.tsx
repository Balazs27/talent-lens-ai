export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload Resume or Job Description",
      description: "Effortless data entry. Employees drop in their latest resume; HR simply pastes a job description. The system instantly translates the document into a clean, structured profile.",
    },
    {
      number: "02",
      title: "Instantly See Skill Matches",
      description: "Immediate discovery. Employees see the internal roles they are most qualified for. HR sees a ranked list of the strongest internal candidates based on true capability alignment.",
    },
    {
      number: "03",
      title: "Analyze Gaps & Take Action",
      description: "Clear, explainable insights. View a transparent breakdown of where a candidate excels and where skills are missing to guide targeted interviews or upskilling paths.",
    }
  ];

  return (
    <section className="relative py-32 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
          How It Works
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8 md:gap-16">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex flex-col p-8 rounded-3xl bg-white/40 backdrop-blur-md border border-slate-200/50 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.1)] hover:-translate-y-1 transition-all duration-300">
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-300 mb-6 tracking-tighter opacity-80">{step.number}</span>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">{step.title}</h3>
            <p className="text-slate-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}