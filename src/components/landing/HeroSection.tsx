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
    <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 tracking-tighter tabular-nums">
      {display}%
    </span>
  );
}

export function HeroSection() {
  const cardRef = useRef<HTMLDivElement>(null);

  /* ── mouse-tracking parallax values ── */
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

        {/* ── Right: mouse-parallax product card ── */}
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
              <div className="w-full h-full bg-white/50 backdrop-blur-2xl rounded-[2rem] border border-white/70 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.12),_0_0_0_1px_rgba(255,255,255,0.5)] p-6 flex flex-col gap-6 overflow-hidden">

                {/* Card header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/40">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
                      <span className="text-white font-bold text-sm">JD</span>
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-slate-800/80 rounded-md mb-2" />
                      <div className="h-3 w-20 bg-slate-500/60 rounded-md" />
                    </div>
                  </div>
                  <div className="text-right">
                    <ScoreCounter />
                    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">
                      Match Score
                    </div>
                  </div>
                </div>

                {/* Skill rows */}
                <div className="flex-1 flex flex-col gap-4 mt-2">
                  <div className="h-3 w-24 bg-slate-400/50 rounded-md mb-2" />
                  <div className="space-y-3">
                    {[
                      { color: "bg-emerald-500", matched: true },
                      { color: "bg-emerald-500", matched: true },
                      { color: "bg-red-400", matched: false },
                    ].map((row, i) => (
                      <motion.div
                        key={i}
                        className={`flex items-center gap-3 p-3.5 rounded-xl shadow-sm ${
                          row.matched
                            ? "bg-white/60 border border-white/60"
                            : "bg-white/30 border border-white/40 border-dashed"
                        }`}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.15, duration: 0.5, ease: "easeOut" }}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                        <div
                          className={`flex-1 h-3 rounded-md ${
                            row.matched ? "bg-slate-700/80" : "bg-slate-400/60"
                          } ${i === 1 ? "mr-12" : i === 2 ? "mr-16" : ""}`}
                        />
                        {row.matched ? (
                          <div className="w-14 h-5 bg-emerald-100/80 rounded-md border border-emerald-200" />
                        ) : (
                          <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                            Missing
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA bar */}
                <motion.div
                  className="mt-auto h-12 w-full rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100/50 flex items-center justify-center text-xs font-bold text-blue-600 uppercase tracking-wide cursor-pointer hover:from-blue-100 hover:to-indigo-100/50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7, duration: 0.5 }}
                >
                  Analyze Skill Gap
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
