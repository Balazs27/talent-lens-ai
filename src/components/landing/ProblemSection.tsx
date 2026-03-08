"use client";

import { motion } from "framer-motion";

const before = [
  { label: "Keyword-dependent search", sub: "Miss candidates who describe skills differently" },
  { label: "Hidden internal talent", sub: "Your best fit doesn't know they qualify" },
  { label: "Unexplainable decisions", sub: "No one can say why a candidate was passed over" },
  { label: "Inconsistent screening", sub: "Every recruiter applies different criteria" },
];

const after = [
  { label: "Structured skill extraction", sub: "Resumes and Job Descriptions become normalized taxonomy data" },
  { label: "Explainable match scores", sub: "See exactly why a candidate ranked where they did" },
  { label: "Required vs. missing clarity", sub: "Know every gap before the first interview" },
  { label: "Transparent talent discovery", sub: "Surface the right people, every time" },
];

export function ProblemSection() {
  return (
    <section className="relative py-32 px-6 bg-slate-950 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Heading block */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            The black box of hiring <br /> is broken.
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75, delay: 0.18, ease: "easeOut" }}
          >
            Traditional platforms rely on rigid keyword searches, leaving incredible internal talent undiscovered
            and forcing recruiters to guess. TalentLens makes matching transparent, accurate, and undeniable.
          </motion.p>
        </div>

        {/* Comparison block */}
        <motion.div
          className="grid md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {/* Before */}
          <div className="rounded-2xl bg-slate-900/60 border border-red-500/10 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-6 h-6 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-sm font-bold text-red-400/80 uppercase tracking-wider">The Old Way</span>
            </div>
            <ul className="space-y-4">
              {before.map((item, i) => (
                <motion.li
                  key={item.label}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: "easeOut" }}
                >
                  <div className="w-4 h-4 rounded-full border border-red-500/25 bg-red-500/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-px bg-red-400/60 rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-300">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.sub}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="rounded-2xl bg-blue-950/40 border border-blue-500/20 p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">The TalentLens Way</span>
              </div>
              <ul className="space-y-4">
                {after.map((item, i) => (
                  <motion.li
                    key={item.label}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2 h-2 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.sub}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
