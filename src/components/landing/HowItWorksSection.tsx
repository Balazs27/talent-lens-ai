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
    <section className="py-24 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
          How It Works
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex flex-col p-8 rounded-2xl bg-white/50 backdrop-blur-md border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-sm font-bold text-blue-600 mb-4 tracking-wider">{step.number}</span>
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">{step.title}</h3>
            <p className="text-slate-600 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}