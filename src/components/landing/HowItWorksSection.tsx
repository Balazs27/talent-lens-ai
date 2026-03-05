"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Upload Document",
    description: "Employees drop in a resume; HR pastes a job description. We structure it instantly.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "AI Extracts Skills",
    description: "An AI model parses every competency, tool, and domain into structured taxonomy data.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Hybrid Matching",
    description: "Our engine blends vector semantics with deterministic scoring for explainable results.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Discover Your Role",
    description: "Ranked matches, gap analysis, and a clear path to your next opportunity — instantly.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-32 px-6 bg-blue-50/50 border-y border-blue-100/50 overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/40 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">How It Works</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            Four steps to clarity.
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-8 left-[4.5rem] right-[4.5rem] h-px">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-200 via-blue-400 to-indigo-300"
              initial={{ scaleX: 0, originX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-10 lg:gap-12">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                className="flex-1 relative"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: 0.2 + idx * 0.12, ease: "easeOut" }}
              >
                {/* Step icon circle */}
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-white border border-blue-100 shadow-md shadow-blue-100/50 flex items-center justify-center text-blue-600 mb-6 relative z-10"
                  whileHover={{ scale: 1.1, rotate: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </motion.div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
