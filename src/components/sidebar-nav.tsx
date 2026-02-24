"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  href: string
  label: string
  indent?: boolean
}

export function SidebarNav({
  items,
  roleLabel,
}: {
  items: NavItem[]
  roleLabel: string
}) {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex flex-col bg-white/60 backdrop-blur-xl border-r border-slate-200/60 relative z-20 shadow-[4px_0_24px_-15px_rgba(0,0,0,0.05)]">
      {/* Brand mark */}
      <div className="px-6 pt-8 pb-8">
        <Link href="/" className="flex items-center gap-2 mb-1 group">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_20px_-3px_rgba(37,99,235,0.5)] transition-shadow">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            TalentLens
          </h2>
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500 ml-9">
          {roleLabel}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={`${item.href}:${item.label}`}
              href={item.href}
              className={[
                "block rounded-xl text-sm font-medium transition-all duration-200 ease-out",
                item.indent ? "ml-4 px-4 py-2.5" : "px-4 py-2.5",
                active ? "bg-blue-600 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] ring-1 ring-blue-500 font-semibold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
              ].join(" ")}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
