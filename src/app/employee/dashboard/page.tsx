import { createClient } from "@/lib/supabase/server"

export default async function EmployeeDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name = user?.user_metadata?.full_name || "there"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your employee dashboard. Upload a resume to get started.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Resumes</h3>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-gray-400">Upload your first resume to begin matching</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Job Matches</h3>
          <p className="mt-2 text-2xl font-semibold">--</p>
          <p className="mt-1 text-xs text-gray-400">Matches appear after resume processing</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Skills Extracted</h3>
          <p className="mt-2 text-2xl font-semibold">--</p>
          <p className="mt-1 text-xs text-gray-400">Skills are extracted from your resume</p>
        </div>
      </div>
    </div>
  )
}
