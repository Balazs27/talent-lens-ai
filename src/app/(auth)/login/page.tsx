"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, animate } from "framer-motion"
import Link from "next/link"

/* ── Animated product demo — same component, reused on login ── */
const SKILLS = [
  { label: "Python", match: true },
  { label: "SQL", match: true },
  { label: "Docker", match: false },
]

function ProductDemo() {
  const [visibleSkills, setVisibleSkills] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    SKILLS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleSkills(i + 1), 800 + i * 500))
    })
    timers.push(setTimeout(() => setShowScore(true), 800 + SKILLS.length * 500 + 300))
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (!showScore) return
    const controls = animate(0, 82, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      onUpdate: (v) => setScore(Math.round(v)),
    })
    return controls.stop
  }, [showScore])

  return (
    <div className="w-full max-w-[260px]">
      <div className="rounded-2xl bg-white/8 backdrop-blur-md border border-white/10 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
          <div className="ml-2 h-4 flex-1 rounded bg-white/8 border border-white/8 text-[9px] text-white/25 font-mono flex items-center justify-center">
            app.itm.ai
          </div>
        </div>

        {/* Resume row */}
        <motion.div
          className="flex items-center gap-2 mb-4 py-2 px-3 rounded-xl bg-white/8 border border-white/10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-white/80">resume.pdf</div>
            <div className="text-[9px] text-white/35">Uploaded · Processing</div>
          </div>
        </motion.div>

        {/* Skills */}
        <div className="space-y-2 mb-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
            Skills detected
          </div>
          {SKILLS.map((skill, i) => (
            <motion.div
              key={skill.label}
              className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/5 border border-white/8"
              initial={{ opacity: 0, x: -12 }}
              animate={i < visibleSkills ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <span className="text-xs font-medium text-white/75">{skill.label}</span>
              {skill.match ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-500/15 border border-red-400/30 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Match score */}
        <motion.div
          className="pt-3 border-t border-white/10"
          initial={{ opacity: 0, y: 8 }}
          animate={showScore ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-white/40">Match score</span>
            <motion.span
              className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"
              animate={showScore ? { scale: [1, 1.12, 1] } : {}}
              transition={{ duration: 0.4, delay: 1.5 }}
            >
              {score}%
            </motion.span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
              initial={{ scaleX: 0, originX: 0 }}
              animate={showScore ? { scaleX: score / 100 } : { scaleX: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.1 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ── Eye / Eye-off icons ── */
function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata?.role

    if (role === "hr") {
      router.push("/hr/dashboard")
    } else {
      router.push("/employee/dashboard")
    }
    router.refresh()
  }

  const inputClass =
    "mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT PANEL ── */}
      <div className="relative lg:w-[45%] flex flex-col items-center justify-center overflow-hidden bg-slate-950 px-8 py-16 lg:py-0 min-h-[320px] lg:min-h-screen">
        {/* Animated glow */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(37,99,235,0.22) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Top edge line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        {/* Faint grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-sm w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_16px_rgba(37,99,235,0.6)]">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Internal Talent Matching MVP</span>
            </Link>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            <p className="text-2xl font-bold text-white leading-snug tracking-tight">
              Welcome back.<br />Your matches await.
            </p>
            <p className="mt-2 text-sm text-white/45 leading-relaxed">
              Hybrid AI matching that sees beyond keywords.
            </p>
          </motion.div>

          {/* Product demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <ProductDemo />
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-16 lg:py-0">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              Sign in
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Welcome back to Internal Talent Matching MVP.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            {/* Password with show/hide */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="btn-shimmer relative w-full h-12 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-[0_0_24px_-6px_rgba(37,99,235,0.5)] transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}
