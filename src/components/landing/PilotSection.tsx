"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const bullets = [
  "Up to 200 employees",
  "HR admin dashboard",
  "Explainable skill-based matching",
];

export function PilotSection() {
  return (
    <section className="py-28 px-6 bg-white border-t border-slate-200/60">
      <div className="max-w-3xl mx-auto text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">
            Pilot Program
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 mb-4">
            Launch with a 30-Day Internal Mobility Pilot
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed mb-10">
            Start with a focused pilot scoped to a single team or department.
            Validate skill-based matching inside your organisation before
            committing to a full enterprise rollout.
          </p>
        </motion.div>

        <motion.ul
          className="inline-flex flex-col gap-3 text-left mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
        >
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 text-base text-slate-700 font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-[0_0_12px_-3px_rgba(37,99,235,0.4)]">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              {b}
            </li>
          ))}
        </motion.ul>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
        >
          <Link
            href="mailto:hello@talentlens.ai"
            className="btn-shimmer inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-sm font-bold text-white hover:bg-blue-500 transition-all hover:-translate-y-0.5 shadow-[0_0_30px_-8px_rgba(37,99,235,0.45)] active:scale-[0.97]"
          >
            Book a Pilot Call
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all hover:-translate-y-0.5 active:scale-[0.97]"
          >
            Start Free
          </Link>
        </motion.div>

        <motion.p
          className="mt-5 text-xs text-slate-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          No long-term contract · Results in 30 days · Cancel anytime
        </motion.p>

      </div>
    </section>
  );
}
