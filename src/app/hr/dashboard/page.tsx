import { createClient } from "@/lib/supabase/server"

export default async function HRDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name = user?.user_metadata?.full_name || "there"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your HR dashboard. Post a job description to start finding candidates.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-gray-400">Post your first job description</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Candidates</h3>
          <p className="mt-2 text-2xl font-semibold">--</p>
          <p className="mt-1 text-xs text-gray-400">Candidates appear after JD processing</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-medium text-gray-500">Avg. Match Score</h3>
          <p className="mt-2 text-2xl font-semibold">--</p>
          <p className="mt-1 text-xs text-gray-400">Computed from skill overlap + similarity</p>
        </div>
      </div>
    </div>
  )
}
