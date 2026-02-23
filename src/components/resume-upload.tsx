"use client"

import { useState } from "react"

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch("/api/ingest/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
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
            htmlFor="resume-text"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Paste your resume text
          </label>
          <textarea
            id="resume-text"
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your resume or LinkedIn profile text here..."
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
          {loading ? "Extracting skills..." : "Extract Skills"}
        </button>
      </form>

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Analyzing resume and extracting skills... This may take 5-15 seconds.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-lg font-medium mb-3">Extraction Result</h3>
            {result.parsed.full_name && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Name:</span>{" "}
                {result.parsed.full_name}
              </p>
            )}
            {result.parsed.email && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span>{" "}
                {result.parsed.email}
              </p>
            )}
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Skills extracted:</span>{" "}
              {result.parsed.skills.length} total,{" "}
              {result.matchedSkills.length} matched to taxonomy
            </p>
          </div>

          {/* Matched skills */}
          {result.matchedSkills.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-5">
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

          {/* Unmatched skills (extracted but not in taxonomy) */}
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
