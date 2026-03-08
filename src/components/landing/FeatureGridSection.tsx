"use client";

import { motion } from "framer-motion";

/* Inline SVG icon components — no external dependency */
function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function NetworkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  );
}

const features = [
  {
    title: "Structured Extraction",
    desc: "We turn messy resumes and vague job descriptions into clean, normalized taxonomy data instantly.",
    Icon: BoltIcon,
    iconColor: "text-amber-600",
    accent: "from-amber-50 to-yellow-50",
    border: "border-amber-200/50",
  },
  {
    title: "Semantic Vector Search",
    desc: "Go beyond exact-match keywords. We understand the intent behind skills using advanced embeddings.",
    Icon: NetworkIcon,
    iconColor: "text-blue-600",
    accent: "from-blue-50 to-indigo-50",
    border: "border-blue-200/50",
  },
  {
    title: "Deterministic Scoring",
    desc: "No black-box AI scores. See exactly which capabilities matched and which are missing with 100% clarity.",
    Icon: TargetIcon,
    iconColor: "text-emerald-600",
    accent: "from-emerald-50 to-teal-50",
    border: "border-emerald-200/50",
  },
];

export function FeatureGridSection() {
  return (
    <section className="relative py-32 px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto w-full">

        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
            A new standard for talent.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="card-glow group relative bg-white rounded-[2rem] p-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-200/60"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" }}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            >
              <motion.div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.accent} ${f.border} border flex items-center justify-center mb-8 shadow-inner`}
                whileHover={{ scale: 1.1, rotate: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <f.Icon className={`w-6 h-6 ${f.iconColor} group-hover:text-white transition-colors duration-300`} />
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-4 tracking-tight transition-colors duration-300">{f.title}</h3>
              <p className="text-slate-500 group-hover:text-white/80 leading-relaxed text-lg font-medium transition-colors duration-300">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
