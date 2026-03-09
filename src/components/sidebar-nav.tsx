"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type IconName = "dashboard" | "resume" | "matches" | "skills" | "jobs" | "create"

interface NavItem {
  href: string
  label: string
  indent?: boolean
  iconName?: IconName
  badge?: number
}

const NavIcons: Record<IconName, React.ReactNode> = {
  dashboard: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  resume: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  matches: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  skills: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  jobs: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  ),
  create: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
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
      <div className="px-5 pt-7 pb-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_18px_-3px_rgba(37,99,235,0.45)] group-hover:shadow-[0_0_22px_-3px_rgba(37,99,235,0.55)] transition-shadow flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-slate-900 leading-none">
              Internal Talent Matching MVP
            </h2>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
              {roleLabel}
            </p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-200/60 mb-2" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5" aria-label="Main navigation">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/")
          const icon = item.iconName ? NavIcons[item.iconName] : null

          return (
            <Link
              key={`${item.href}:${item.label}`}
              href={item.href}
              className={[
                "flex items-center gap-2.5 rounded-xl text-sm transition-all duration-200 ease-out",
                item.indent ? "ml-5 pl-3 pr-3 py-2" : "px-3 py-2.5",
                active
                  ? "bg-blue-600 text-white shadow-[0_6px_18px_-6px_rgba(37,99,235,0.45)] font-semibold"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 font-medium",
              ].join(" ")}
            >
              {icon && (
                <span
                  className={`flex-shrink-0 transition-opacity ${
                    active ? "opacity-90" : "opacity-55 group-hover:opacity-75"
                  }`}
                >
                  {icon}
                </span>
              )}
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`flex-shrink-0 text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    active
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 pt-3">
        <div className="border-t border-slate-200/60 mb-3" />
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          <p className="text-[11px] text-slate-400 font-medium">Internal Talent Matching MVP · Beta</p>
        </div>
      </div>

    </aside>
  )
}
