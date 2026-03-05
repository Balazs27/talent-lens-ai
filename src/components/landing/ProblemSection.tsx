"use client";

import { motion } from "framer-motion";

export function ProblemSection() {
  return (
    <section className="relative py-32 px-6 bg-slate-950 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]"
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
          and forcing recruiters to guess. TalentLens translates human experience into structured data, making
          matching transparent, accurate, and undeniable.
        </motion.p>
      </div>
    </section>
  );
}
