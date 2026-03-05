"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Structured Extraction",
    desc: "We turn messy resumes and vague job descriptions into clean, normalized taxonomy data instantly.",
    icon: "⚡️",
    accent: "from-amber-50 to-yellow-50",
    border: "border-amber-200/50",
  },
  {
    title: "Semantic Vector Search",
    desc: "Go beyond exact-match keywords. We understand the intent behind skills using advanced embeddings.",
    icon: "🧠",
    accent: "from-blue-50 to-indigo-50",
    border: "border-blue-200/50",
  },
  {
    title: "Deterministic Scoring",
    desc: "No black-box AI scores. See exactly which capabilities matched and which are missing with 100% clarity.",
    icon: "🎯",
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
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.accent} ${f.border} border flex items-center justify-center text-2xl mb-8 shadow-inner`}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {f.icon}
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
