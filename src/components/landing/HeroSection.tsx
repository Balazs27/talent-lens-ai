"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
} from "framer-motion";

/* ── stagger container variant ── */
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
};

/* ── animated score counter ── */
function ScoreCounter() {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, 94, {
      duration: 1.6,
      delay: 1.0,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, []);

  return (
    <span className="text-3xl font-extrabold text-white tracking-tighter tabular-nums leading-none">
      {display}%
    </span>
  );
}

const skills = [
  { name: "Python", matched: true },
  { name: "SQL", matched: true },
  { name: "Data Modeling", matched: true },
  { name: "Leadership", matched: false },
];

export function HeroSection() {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), {
    stiffness: 120,
    damping: 20,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section className="relative min-h-[90vh] pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 flex items-center overflow-hidden bg-slate-50">
      {/* Ambient glows */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">

        {/* ── Left: staggered text ── */}
        <motion.div
          className="flex flex-col items-start text-left"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 text-blue-600 text-sm font-semibold mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Introducing Hybrid Matching
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-6xl sm:text-7xl lg:text-[7.5rem] font-extrabold tracking-tighter text-slate-950 leading-[0.85]"
          >
            Intelligence <br /> for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 pb-2 inline-block">
              modern workforce.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-lg text-lg sm:text-xl text-slate-500 leading-relaxed font-medium"
          >
            Upload a resume. Extract skills automatically. Discover your best job
            matches instantly with hybrid AI matching.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex items-center gap-4">
            <Link
              href="/signup"
              className="btn-shimmer inline-flex h-14 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-semibold text-white transition-all hover:-translate-y-1 hover:bg-blue-500 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] ring-1 ring-white/20"
            >
              Get Started
            </Link>
            <a
              href="#demo"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-slate-700 transition-all hover:-translate-y-1 hover:bg-slate-50 shadow-sm border border-slate-200"
            >
              Watch Demo
            </a>
          </motion.div>
        </motion.div>

        {/* ── Right: product mockup card ── */}
        <motion.div
          ref={cardRef}
          className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square mt-12 lg:mt-0 hidden md:flex items-center justify-center"
          style={{ perspective: 2000 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT }}
        >
          {/* Animated glow behind card */}
          <motion.div
            className="absolute inset-0 bg-blue-500/20 blur-[70px] rounded-full pointer-events-none"
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="relative w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] h-[calc(100%-2rem)] sm:h-[calc(100%-4rem)]"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            {/* Floating animation wrapper */}
            <motion.div
              className="w-full h-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* App window frame */}
              <div className="w-full h-full rounded-[2rem] border border-white/70 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.14),_0_0_0_1px_rgba(255,255,255,0.5)] overflow-hidden flex flex-col bg-white/60 backdrop-blur-2xl">

                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-100/70 border-b border-slate-200/50 flex-shrink-0">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="h-4 bg-white/70 rounded-md flex items-center px-2.5">
                      <span className="text-[8px] text-slate-400 font-mono truncate">app.itm.ai/hr/jobs/candidates</span>
                    </div>
                  </div>
                </div>

                {/* Job header */}
                <div className="px-5 py-3 border-b border-slate-100/60 bg-white/40 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Senior Data Analyst</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">TechCorp · London, UK · 3 matched</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-200/60 flex-shrink-0">
                      Active
                    </span>
                  </div>
                </div>

                {/* Candidate match header */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      AJ
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white leading-tight">Alex Johnson</p>
                      <p className="text-[9px] text-blue-200 mt-0.5">Data Analyst · 6 yrs exp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <ScoreCounter />
                    <p className="text-[8px] text-blue-200 uppercase tracking-wider mt-0.5">Match</p>
                  </div>
                </div>

                {/* Skills section */}
                <div className="flex-1 px-5 py-4 overflow-hidden">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Required Skills</p>
                  <div className="space-y-2">
                    {skills.map((skill, i) => (
                      <motion.div
                        key={skill.name}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                          skill.matched
                            ? "bg-emerald-50/80 border border-emerald-100"
                            : "bg-red-50/60 border border-red-100 border-dashed"
                        }`}
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.12, duration: 0.45, ease: "easeOut" }}
                      >
                        <span className={`text-[10px] font-semibold ${skill.matched ? "text-emerald-700" : "text-red-500"}`}>
                          {skill.name}
                        </span>
                        {skill.matched ? (
                          <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 flex-shrink-0">Missing</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA bar */}
                <motion.div
                  className="px-5 pb-5 flex-shrink-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.85, duration: 0.5 }}
                >
                  <div className="h-9 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center gap-2 text-[11px] font-bold text-white cursor-pointer hover:from-blue-500 hover:to-indigo-500 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                    Analyze Skill Gap
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
