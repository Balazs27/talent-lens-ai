import { JDEditor } from "@/components/jd-editor"
import { PageHeader } from "@/components/page-header"

export default function NewJobPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Create Job Description"
        description="Paste a job description below. We'll extract the required skills and match them against our taxonomy."
        backHref="/hr/jobs"
        backLabel="Jobs & Candidates"
      />
      <JDEditor />
    </div>
  )
}
