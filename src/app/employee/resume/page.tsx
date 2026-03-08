import { ResumeUpload } from "@/components/resume-upload"
import { PageHeader } from "@/components/page-header"

export default function ResumePage() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="My Resume"
        description="Paste or upload your resume. We'll extract your skills and match them against our taxonomy."
      />
      <ResumeUpload />
    </div>
  )
}
