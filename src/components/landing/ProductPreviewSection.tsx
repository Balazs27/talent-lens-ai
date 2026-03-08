"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

/* Staggered scroll-reveal wrapper */
function Reveal({
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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* Tier badge */
function TierBadge({ tier }: { tier: "strong" | "potential" | "weak" }) {
  const map = {
    strong: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    potential: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    weak: "bg-slate-600/30 text-slate-400 border-slate-600/40",
  };
  const label = { strong: "Strong", potential: "Potential", weak: "Weak" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border flex-shrink-0 ${map[tier]}`}>
      {label[tier]}
    </span>
  );
}

/* Score circle */
function Score({ value, tier }: { value: number; tier: "strong" | "potential" | "weak" }) {
  const color = { strong: "text-emerald-400", potential: "text-amber-400", weak: "text-slate-400" };
  return (
    <div className={`text-base font-extrabold tabular-nums tracking-tight flex-shrink-0 ${color[tier]}`}>
      {value}%
    </div>
  );
}

/* Skill chip */
function SkillChip({ label, matched }: { label: string; matched: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border flex-shrink-0 ${
      matched
        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
        : "bg-red-500/10 border-red-500/25 text-red-400 border-dashed"
    }`}>
      {matched ? (
        <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {label}
    </span>
  );
}

const candidates = [
  {
    initials: "AJ",
    name: "Alex Johnson",
    role: "Sr. Analyst · 6 yrs",
    score: 94,
    tier: "strong" as const,
    skills: [
      { label: "Python", matched: true },
      { label: "SQL", matched: true },
      { label: "Data Modeling", matched: true },
      { label: "Leadership", matched: false },
    ],
  },
  {
    initials: "PN",
    name: "Priya Nair",
    role: "Data Analyst · 4 yrs",
    score: 71,
    tier: "potential" as const,
    skills: [
      { label: "Python", matched: true },
      { label: "SQL", matched: true },
      { label: "Data Modeling", matched: false },
      { label: "Leadership", matched: false },
    ],
  },
  {
    initials: "MW",
    name: "Marcus Webb",
    role: "BI Analyst · 3 yrs",
    score: 46,
    tier: "weak" as const,
    skills: [
      { label: "SQL", matched: true },
      { label: "Python", matched: false },
      { label: "Data Modeling", matched: false },
    ],
  },
];

const navItems = [
  {
    label: "Dashboard",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    active: false,
  },
  {
    label: "Jobs",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    ),
    active: true,
  },
  {
    label: "Candidates",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    active: false,
  },
];

export function ProductPreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const cardY = useSpring(rawY, { stiffness: 60, damping: 20 });

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
          {/* Gradient glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/20 via-white/5 to-transparent -m-px shadow-[0_0_80px_-15px_rgba(37,99,235,0.2)]" />

          {/* Main window */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900/60 backdrop-blur-2xl border border-white/15 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.22),_0_0_40px_rgba(37,99,235,0.1)] flex flex-col min-h-[480px]">

            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/8 flex-shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/60" />
                <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
              </div>
              <div className="mx-auto h-5 w-52 rounded-md bg-white/8 border border-white/10 flex items-center justify-center">
                <span className="text-[9px] text-white/30 font-mono tracking-wide">app.talentlens.ai/hr/jobs</span>
              </div>
            </div>

            {/* App layout */}
            <div className="flex flex-1 overflow-hidden">

              {/* Left sidebar */}
              <div className="hidden md:flex flex-col w-44 flex-shrink-0 border-r border-white/8 bg-slate-950/40 py-4 px-3 gap-1">
                {/* Brand */}
                <div className="flex items-center gap-2 px-2 mb-4">
                  <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <span className="text-xs font-bold text-white">TalentLens</span>
                </div>

                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
                      item.active
                        ? "bg-blue-600 text-white shadow-[0_4px_12px_-4px_rgba(37,99,235,0.5)]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                ))}

                {/* Job context card */}
                <div className="mt-auto mx-0 p-2.5 rounded-xl bg-white/5 border border-white/8">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Active Job</p>
                  <p className="text-[10px] font-bold text-slate-200 leading-tight">Senior Data Analyst</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">TechCorp · London</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-slate-400 font-medium">5 candidates</span>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Content header */}
                <Reveal delay={0.1} className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 flex-shrink-0">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">Senior Data Analyst</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">TechCorp · London, UK · Ranked by match score</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-6 px-2.5 rounded-lg bg-white/8 border border-white/10 flex items-center">
                      <span className="text-[9px] text-slate-400 font-medium">All Tiers</span>
                    </div>
                    <div className="h-6 px-2.5 rounded-lg bg-white/8 border border-white/10 flex items-center">
                      <span className="text-[9px] text-slate-400 font-medium">Score ↓</span>
                    </div>
                  </div>
                </Reveal>

                {/* Candidate rows */}
                <div className="flex-1 overflow-hidden divide-y divide-white/5">
                  {candidates.map((c, i) => (
                    <Reveal
                      key={c.name}
                      delay={0.18 + i * 0.1}
                      className={`flex items-center gap-3 px-5 py-3.5 group hover:bg-white/4 transition-colors ${
                        c.tier === "weak" ? "opacity-60" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        c.tier === "strong"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : c.tier === "potential"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-600/30 text-slate-400 border border-slate-600/40"
                      }`}>
                        {c.initials}
                      </div>

                      {/* Name + role */}
                      <div className="min-w-0 flex-shrink-0 w-28">
                        <p className="text-[11px] font-bold text-slate-200 truncate">{c.name}</p>
                        <p className="text-[9px] text-slate-500 truncate">{c.role}</p>
                      </div>

                      {/* Score */}
                      <Score value={c.score} tier={c.tier} />

                      {/* Tier badge */}
                      <TierBadge tier={c.tier} />

                      {/* Skills */}
                      <div className="hidden lg:flex flex-wrap gap-1 flex-1 min-w-0 overflow-hidden">
                        {c.skills.map((s) => (
                          <SkillChip key={s.label} label={s.label} matched={s.matched} />
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="flex-shrink-0 ml-auto hidden sm:block">
                        <div className="h-6 px-3 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center text-[9px] font-bold text-blue-400 whitespace-nowrap">
                          Analyze Gap
                        </div>
                      </div>
                    </Reveal>
                  ))}

                  {/* Subtle "show more" hint */}
                  <div className="px-5 py-3 flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[9px] text-slate-600 font-medium">2 more candidates</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                </div>

                {/* Bottom stats bar */}
                <Reveal delay={0.5} className="flex items-center gap-6 px-5 py-3 border-t border-white/8 bg-white/3 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-slate-400 font-medium">1 Strong match</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[9px] text-slate-400 font-medium">1 Potential</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-[9px] text-slate-400 font-medium">1 Weak</span>
                  </div>
                  <div className="ml-auto text-[9px] text-slate-500 font-medium">Powered by hybrid AI matching</div>
                </Reveal>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
