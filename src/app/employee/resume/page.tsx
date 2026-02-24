import { ResumeUpload } from "@/components/resume-upload"

export default function ResumePage() {
  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold border-l-2 border-blue-500 pl-3">My Resume</h1>
        <p className="mt-1 text-sm text-gray-500 pl-3">
          Paste your resume text below. We&apos;ll extract your skills and match
          them against our taxonomy.
        </p>
      </div>
      <ResumeUpload />
    </div>
  )
}
