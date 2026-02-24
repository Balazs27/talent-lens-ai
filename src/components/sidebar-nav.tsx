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
    <aside className="w-56 flex flex-col bg-gradient-to-b from-blue-50 to-white border-r border-slate-200/80">
      {/* Brand mark */}
      <div className="px-5 pt-5 pb-6">
        <h2 className="text-lg font-bold tracking-tight text-blue-600">
          TalentLens
        </h2>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
          {roleLabel}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={`${item.href}:${item.label}`}
              href={item.href}
              className={[
                "block rounded-lg text-sm transition-all duration-150 ease-out",
                item.indent ? "ml-3 px-3 py-1.5" : "px-3 py-2",
                active
                  ? "font-semibold text-blue-600 bg-blue-600/[0.08] shadow-[0_1px_8px_rgba(37,99,235,0.12)]"
                  : [
                      "font-medium text-slate-500",
                      "hover:text-blue-600 hover:bg-blue-50/80",
                      "hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(37,99,235,0.08)]",
                    ].join(" "),
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
