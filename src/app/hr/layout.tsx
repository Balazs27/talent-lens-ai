import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function HRLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const role = user.user_metadata?.role
  if (role !== "hr" && role !== "admin") redirect("/employee/dashboard")

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 p-4 space-y-1">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-blue-600">TalentLens</h2>
          <p className="text-xs text-gray-400">HR / Recruiter</p>
        </div>
        <nav className="space-y-1">
          <Link
            href="/hr/dashboard"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/hr/jobs"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Job Descriptions
          </Link>
          <Link
            href="/hr/jobs/new"
            className="block rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors pl-6"
          >
            + Create New
          </Link>
          <Link
            href="/hr/jobs"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Candidates
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
          <span className="text-sm text-gray-500">
            {user.user_metadata?.full_name || user.email}
          </span>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
