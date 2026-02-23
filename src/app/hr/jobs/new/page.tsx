import { JDEditor } from "@/components/jd-editor"

export default function NewJobPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Create Job Description</h1>
        <p className="mt-1 text-sm text-gray-500">
          Paste a job description below. We&apos;ll extract the required skills
          and match them against our taxonomy.
        </p>
      </div>
      <JDEditor />
    </div>
  )
}
