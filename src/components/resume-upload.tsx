"use client"

import { useState } from "react"
import Link from "next/link"
import { Toast, Spinner } from "@/components/toast"

interface MatchedSkill {
  skillId: number
  canonicalName: string
  category: string
  proficiency: string | null
  confidence: number
  yearsExperience: number | null
}

interface IngestResult {
  resumeId: string
  status: string
  parsed: {
    full_name: string | null
    email: string | null
    skills: Array<{
      name: string
      proficiency: string | null
      years_experience: number | null
      confidence: number
    }>
  }
  matchedSkills: MatchedSkill[]
}

export function ResumeUpload() {
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
      const res = await fetch("/api/ingest/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data.error || `Request failed (${res.status})`
        setError(msg)
        setToast({ message: msg, type: "error" })
        return
      }

      setResult(data)
      setToast({ message: `Resume processed — ${data.matchedSkills.length} skills matched!`, type: "success" })
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
            htmlFor="resume-text"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Paste your resume text
          </label>
          <textarea
            id="resume-text"
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your resume or LinkedIn profile text here..."
            className="block w-full rounded-xl border border-slate-200/80 bg-white/50 px-4 py-3 text-sm focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-slate-400">
            Minimum 50 characters. Plain text only.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || text.trim().length < 50}
          className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Spinner />}
          {loading ? "Extracting skills..." : "Extract Skills"}
        </button>
      </form>

      {loading && (
        <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-6 text-center">
          <p className="text-sm text-slate-500">
            Analyzing resume and extracting skills... This may take 5-15 seconds.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5">
            <h3 className="text-lg font-medium mb-3">Extraction Result</h3>
            {result.parsed.full_name && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Name:</span>{" "}
                {result.parsed.full_name}
              </p>
            )}
            {result.parsed.email && (
              <p className="text-sm text-slate-600">
                <span className="font-medium">Email:</span>{" "}
                {result.parsed.email}
              </p>
            )}
            <p className="text-sm text-slate-600 mt-1">
              <span className="font-medium">Skills extracted:</span>{" "}
              {result.parsed.skills.length} total,{" "}
              {result.matchedSkills.length} matched to taxonomy
            </p>
          </div>

          {/* Matched skills */}
          {result.matchedSkills.length > 0 && (
            <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5">
              <h3 className="text-lg font-medium mb-3">
                Matched Skills ({result.matchedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map((skill) => (
                  <span
                    key={skill.skillId}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-sm"
                  >
                    <span className="font-medium text-blue-800">
                      {skill.canonicalName}
                    </span>
                    {skill.proficiency && (
                      <span className="text-blue-500 text-xs">
                        ({skill.proficiency})
                      </span>
                    )}
                    {skill.yearsExperience != null && (
                      <span className="text-blue-400 text-xs">
                        {skill.yearsExperience}y
                      </span>
                    )}
                    <span
                      className={`text-xs ${
                        skill.confidence >= 0.7
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {Math.round(skill.confidence * 100)}%
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* View Matches CTA */}
          <div className="rounded-2xl border border-blue-200/50 bg-blue-50/80 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5 text-center">
            <p className="text-sm text-blue-800">
              Your skills have been extracted and matched. See which jobs fit
              your profile.
            </p>
            <Link
              href="/employee/matches"
              className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)]"
            >
              View Matches
            </Link>
          </div>

          {/* Unmatched skills (extracted but not in taxonomy) */}
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
