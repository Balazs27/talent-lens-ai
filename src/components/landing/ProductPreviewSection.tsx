"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

/* Individual panel reveal — staggered on scroll */
function Panel({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function ProductPreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* Parallax: card rises slightly as you scroll through */
  const rawY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const cardY = useSpring(rawY, { stiffness: 60, damping: 20 });

  /* Subtle scale-in as section enters viewport */
  const rawScale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.98]);
  const cardScale = useSpring(rawScale, { stiffness: 80, damping: 25 });

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-6 flex flex-col items-center w-full bg-gradient-to-b from-transparent via-blue-50/30 to-transparent overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent" />

      {/* Section heading */}
      <motion.div
        className="text-center mb-16 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">Product Preview</p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
          See it in action.
        </h2>
        <p className="mt-4 text-lg text-slate-500 leading-relaxed">
          Everything you need to match talent to opportunity — in one clean interface.
        </p>
      </motion.div>

      <div className="w-full max-w-6xl relative z-10">
        <motion.div
          className="relative mx-auto w-full"
          style={{ y: cardY, scale: cardScale }}
        >
          {/* Gradient glow border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/30 via-white/10 to-transparent -m-px shadow-[0_0_80px_-15px_rgba(37,99,235,0.25)]" />

          {/* Main card */}
          <div className="relative aspect-auto md:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-2xl border border-white/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.18),_0_0_40px_rgba(37,99,235,0.12)] flex flex-col items-center justify-center p-4 md:p-8 min-h-[400px]">

            {/* Browser chrome */}
            <div className="absolute top-0 left-0 w-full h-10 bg-white/8 border-b border-white/10 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-amber-400/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
              <div className="mx-auto h-5 w-48 rounded-md bg-white/10 border border-white/10 text-[10px] text-white/30 flex items-center justify-center font-mono tracking-wide">
                app.talentlens.ai
              </div>
            </div>

            <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6 mt-10 md:mt-6 relative z-10">

              {/* Left sidebar */}
              <div className="hidden md:flex flex-col gap-4">
                <Panel delay={0.1} className="h-32 rounded-xl bg-white/70 backdrop-blur-lg border border-white/40 shadow-sm p-4 flex flex-col gap-3 justify-center">
                  <div className="h-4 w-2/3 bg-slate-200 rounded" />
                  <div className="h-3 w-1/2 bg-slate-200/50 rounded" />
                  <div className="flex gap-1.5 mt-1">
                    <div className="h-5 w-12 bg-blue-100 border border-blue-200/60 rounded-full" />
                    <div className="h-5 w-16 bg-blue-100 border border-blue-200/60 rounded-full" />
                  </div>
                </Panel>

                <Panel delay={0.2} className="h-48 rounded-xl bg-white/70 backdrop-blur-lg border border-white/40 shadow-sm p-4 flex flex-col gap-3">
                  <div className="h-4 w-1/3 bg-slate-200 rounded mb-2" />
                  <div className="h-8 w-full bg-white rounded-lg border border-slate-100" />
                  <div className="h-8 w-full bg-white rounded-lg border border-slate-100" />
                  <div className="h-8 w-full bg-white rounded-lg border border-slate-100" />
                </Panel>
              </div>

              {/* Main content */}
              <div className="md:col-span-2 flex flex-col gap-4">
                <Panel delay={0.15} className="h-auto md:h-20 py-4 md:py-0 rounded-xl bg-white/90 backdrop-blur-lg border border-white/40 shadow-lg flex flex-col md:flex-row items-start md:items-center px-6 gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-sm">
                    JD
                  </div>
                  <div className="flex-col gap-2 w-full flex mt-2 md:mt-0">
                    <div className="h-4 w-1/2 md:w-1/3 bg-slate-300 rounded" />
                    <div className="h-3 w-3/4 md:w-1/4 bg-slate-200 rounded" />
                  </div>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2 md:mt-0 shrink-0">
                    94%
                  </div>
                </Panel>

                <Panel delay={0.28} className="h-auto rounded-xl bg-white/90 backdrop-blur-lg border border-white/40 shadow-lg p-6 flex flex-col gap-4">
                  <div className="h-4 w-1/4 bg-slate-300 rounded mb-2" />
                  <div className="flex flex-wrap gap-2">
                    {[24, 32, 20, 28, 18].map((w, i) => (
                      <motion.div
                        key={i}
                        className={`h-7 rounded-full ${
                          i < 3
                            ? "bg-blue-50 border border-blue-100/60"
                            : "bg-slate-50 border border-slate-200/60"
                        }`}
                        style={{ width: `${w * 4}px` }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.07, duration: 0.35, ease: "backOut" }}
                      />
                    ))}
                  </div>
                  <div className="h-px w-full bg-slate-100 my-2" />
                  <div className="flex flex-col gap-3">
                    {["full", "4/5", "5/6"].map((w, i) => (
                      <motion.div
                        key={i}
                        className={`h-3 bg-slate-200 rounded w-${w}`}
                        initial={{ scaleX: 0, originX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.55 + i * 0.08, duration: 0.5, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
