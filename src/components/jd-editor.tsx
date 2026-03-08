"use client"

import { useState } from "react"
import Link from "next/link"
import { Toast, Spinner } from "@/components/toast"

interface MatchedSkill {
  skillId: number
  canonicalName: string
  category: string
  importance: "required" | "preferred" | "nice_to_have"
  minYears: number | null
}

interface IngestResult {
  jobId: string
  status: string
  parsed: {
    title: string | null
    company: string | null
    location: string | null
    seniority: string | null
    skills: Array<{
      name: string
      importance: string
      min_years: number | null
    }>
  }
  matchedSkills: MatchedSkill[]
}

const IMPORTANCE_STYLES = {
  required: "bg-red-50 border-red-200 text-red-800",
  preferred: "bg-amber-50 border-amber-200 text-amber-800",
  nice_to_have: "bg-green-50 border-green-200 text-green-800",
} as const

const IMPORTANCE_LABELS = {
  required: "Required",
  preferred: "Preferred",
  nice_to_have: "Nice to have",
} as const

export function JDEditor() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setToast(null)
    setLoading(true)

    try {
      const res = await fetch("/api/ingest/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText: text }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data.error || `Request failed (${res.status})`
        setError(msg)
        setToast({ message: msg, type: "error" })
        return
      }

      setResult(data)
      setToast({ message: `Job processed — ${data.matchedSkills.length} requirements matched!`, type: "success" })
      setText("")
    } catch {
      setError("Network error. Please try again.")
      setToast({ message: "Network error. Please try again.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="jd-text"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Paste the job description
          </label>
          <textarea
            id="jd-text"
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full job description text here..."
            className="block w-full rounded-xl border border-slate-200/80 bg-white/50 px-4 py-3 text-sm focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-slate-400">
            Minimum 50 characters. Plain text only.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || text.trim().length < 50}
          className="btn-shimmer inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Spinner />}
          {loading ? "Extracting requirements..." : "Extract Requirements"}
        </button>
      </form>

      {loading && (
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Analyzing job description…</p>
              <p className="text-xs text-slate-400 mt-0.5">This may take 5–15 seconds</p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Job metadata */}
          <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Job description processed</h3>
            </div>
            {result.parsed.title && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Title:</span>{" "}
                {result.parsed.title}
              </p>
            )}
            {result.parsed.company && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Company:</span>{" "}
                {result.parsed.company}
              </p>
            )}
            {result.parsed.location && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Location:</span>{" "}
                {result.parsed.location}
              </p>
            )}
            {result.parsed.seniority && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Seniority:</span>{" "}
                <span className="capitalize">{result.parsed.seniority}</span>
              </p>
            )}
            <p className="text-sm text-slate-600 mt-1">
              <span className="font-medium">Skills extracted:</span>{" "}
              {result.parsed.skills.length} total,{" "}
              {result.matchedSkills.length} matched to taxonomy
            </p>
          </div>

          {/* Matched skills grouped by importance */}
          {result.matchedSkills.length > 0 && (
            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5">
              <h3 className="text-lg font-medium mb-3">
                Matched Skills ({result.matchedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map((skill) => (
                  <span
                    key={skill.skillId}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                      IMPORTANCE_STYLES[skill.importance] ??
                      IMPORTANCE_STYLES.required
                    }`}
                  >
                    <span className="font-medium">{skill.canonicalName}</span>
                    <span className="text-xs opacity-70">
                      {IMPORTANCE_LABELS[skill.importance] ??
                        skill.importance}
                    </span>
                    {skill.minYears != null && (
                      <span className="text-xs opacity-60">
                        {skill.minYears}y+
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* View Candidates CTA */}
          <div className="rounded-2xl border border-blue-200/50 bg-blue-50/80 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5 text-center">
            <p className="text-sm text-blue-800">
              Requirements have been extracted and matched. See which candidates
              fit this role.
            </p>
            <Link
              href={`/hr/jobs/${result.jobId}/candidates`}
              className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)]"
            >
              View Candidates
            </Link>
          </div>

          {/* Unmatched skills */}
          {result.parsed.skills.length > result.matchedSkills.length && (
            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5">
              <h3 className="text-sm font-medium text-slate-500 mb-2">
                Not in taxonomy (
                {result.parsed.skills.length - result.matchedSkills.length}{" "}
                skills)
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.parsed.skills
                  .filter(
                    (s) =>
                      !result.matchedSkills.some(
                        (ms) =>
                          ms.canonicalName.toLowerCase() ===
                          s.name.toLowerCase()
                      )
                  )
                  .map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs text-slate-500"
                    >
                      {s.name}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
