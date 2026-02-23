"use client"

import { useState } from "react"

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch("/api/ingest/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText: text }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`)
        return
      }

      setResult(data)
      setText("")
    } catch {
      setError("Network error. Please try again.")
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Paste the job description
          </label>
          <textarea
            id="jd-text"
            rows={14}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full job description text here..."
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-400">
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
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Extracting requirements..." : "Extract Requirements"}
        </button>
      </form>

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Analyzing job description and extracting requirements... This may
            take 5-15 seconds.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Job metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-medium mb-3">Extraction Result</h3>
            {result.parsed.title && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Title:</span>{" "}
                {result.parsed.title}
              </p>
            )}
            {result.parsed.company && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Company:</span>{" "}
                {result.parsed.company}
              </p>
            )}
            {result.parsed.location && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Location:</span>{" "}
                {result.parsed.location}
              </p>
            )}
            {result.parsed.seniority && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Seniority:</span>{" "}
                <span className="capitalize">{result.parsed.seniority}</span>
              </p>
            )}
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Skills extracted:</span>{" "}
              {result.parsed.skills.length} total,{" "}
              {result.matchedSkills.length} matched to taxonomy
            </p>
          </div>

          {/* Matched skills grouped by importance */}
          {result.matchedSkills.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
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

          {/* Unmatched skills */}
          {result.parsed.skills.length > result.matchedSkills.length && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
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
                      className="inline-flex rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs text-gray-500"
                    >
                      {s.name}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
