"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Toast, Spinner } from "@/components/toast"

type UploadMode = "text" | "pdf"

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

const MAX_PDF_SIZE = 5 * 1024 * 1024 // 5MB

export function ResumeUpload() {
  const [mode, setMode] = useState<UploadMode>("text")

  // Text mode state
  const [text, setText] = useState("")

  // PDF mode state
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Shared state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  function resetState() {
    setError(null)
    setResult(null)
    setToast(null)
  }

  function handleModeChange(newMode: UploadMode) {
    setMode(newMode)
    resetState()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setError(null)

    if (!file) {
      setPdfFile(null)
      return
    }

    // Client-side validation: type
    if (file.type !== "application/pdf") {
      setPdfFile(null)
      setError("Invalid file type. Please upload a PDF file.")
      return
    }

    // Client-side validation: size
    if (file.size > MAX_PDF_SIZE) {
      setPdfFile(null)
      setError(`File too large. Maximum size is 5MB (your file: ${(file.size / 1024 / 1024).toFixed(1)}MB).`)
      return
    }

    setPdfFile(file)
  }

  async function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetState()
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

  async function handlePdfSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pdfFile) return
    resetState()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", pdfFile)

      const res = await fetch("/api/ingest/resume/pdf", {
        method: "POST",
        body: formData,
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
      setPdfFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch {
      setError("Network error. Please try again.")
      setToast({ message: "Network error. Please try again.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="inline-flex rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 gap-1">
        <button
          type="button"
          onClick={() => handleModeChange("text")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            mode === "text"
              ? "bg-white shadow-sm text-blue-700 border border-slate-200/80"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Paste Text
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("pdf")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            mode === "pdf"
              ? "bg-white shadow-sm text-blue-700 border border-slate-200/80"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Upload PDF
        </button>
      </div>

      {/* Text paste mode */}
      {mode === "text" && (
        <form onSubmit={handleTextSubmit} className="space-y-4">
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
            {loading ? "Extracting skills..." : "Extract Skills"}
          </button>
        </form>
      )}

      {/* PDF upload mode */}
      {mode === "pdf" && (
        <form onSubmit={handlePdfSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload your resume PDF
            </label>

            {/* Drop zone / file selector */}
            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-all cursor-pointer ${
                pdfFile
                  ? "border-blue-400 bg-blue-50/60"
                  : "border-slate-200 bg-white/50 hover:border-blue-400 hover:bg-blue-50/40"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={handleFileChange}
                disabled={loading}
              />

              {pdfFile ? (
                <>
                  {/* File selected state */}
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{pdfFile.name}</p>
                      <p className="text-xs text-slate-500">{(pdfFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-blue-600">Click to change file</p>
                </>
              ) : (
                <>
                  {/* Empty state */}
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </span>
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Click to select a PDF
                  </p>
                  <p className="mt-1 text-xs text-slate-400">PDF only · Max 5MB</p>
                </>
              )}
            </div>
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
            disabled={loading || !pdfFile}
            className="btn-shimmer inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.3)] hover:shadow-[0_0_24px_-5px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Spinner />}
            {loading ? "Processing PDF..." : "Extract Skills from PDF"}
          </button>
        </form>
      )}

      {/* Loading state (shared) */}
      {loading && (
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {mode === "pdf" ? "Extracting text from PDF…" : "Analyzing resume…"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === "pdf" ? "This may take 10–20 seconds" : "This may take 5–15 seconds"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result (shared) */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Resume processed</h3>
            </div>
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
