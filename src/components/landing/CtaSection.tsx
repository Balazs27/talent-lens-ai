"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CtaSection() {
  return (
    <section className="relative py-32 px-6 bg-slate-950 overflow-hidden">
      {/* Animated ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(37,99,235,0.18) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Ready to discover <br className="hidden md:block" /> your hidden talent?
        </motion.h2>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
            <Link
              href="/signup"
              className="btn-shimmer inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-slate-950 transition-colors hover:bg-slate-100 shadow-[0_0_40px_-10px_rgba(255,255,255,0.35)]"
            >
              Get Started
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700 px-8 text-base font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
