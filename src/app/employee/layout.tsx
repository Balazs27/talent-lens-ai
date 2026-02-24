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
    <div className="min-h-screen flex">
      <SidebarNav items={employeeNav} roleLabel="Employee" />

      <div className="flex-1 flex flex-col bg-slate-50/80">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm border-b border-slate-200/80 shadow-[0_1px_2px_rgba(37,99,235,0.04)]">
          <span className="text-sm font-medium text-slate-600">
            {user.user_metadata?.full_name || user.email}
          </span>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
