import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarNav } from "@/components/sidebar-nav"

const employeeNav = [
  { href: "/employee/dashboard", label: "Dashboard" },
  { href: "/employee/resume", label: "My Resume" },
  { href: "/employee/matches", label: "Job Matches" },
  { href: "/employee/skills", label: "My Skills" },
]

export default async function EmployeeLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const role = user.user_metadata?.role
  if (role === "hr") redirect("/hr/dashboard")

  return (
    <div className="min-h-screen flex bg-slate-50 selection:bg-blue-200 selection:text-blue-900">
      {/* Subtle background glow for the dashboard */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <SidebarNav items={employeeNav} roleLabel="Employee" />

      <div className="flex-1 flex flex-col relative z-10">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/60 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] sticky top-0 z-20">
          <span className="text-sm font-semibold text-slate-700">
            {user.user_metadata?.full_name || user.email}
          </span>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-red-50 hover:text-red-700 hover:shadow-sm ring-1 ring-transparent hover:ring-red-200"
            >
              Sign out
            </button>
          </form>
        </header>

        <main className="flex-1 p-8 w-full max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
