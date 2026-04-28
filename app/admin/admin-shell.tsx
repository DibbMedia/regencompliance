"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import {
  LayoutDashboard,
  Users,
  ScanSearch,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Zap,
  ListChecks,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const WAITLIST_LAST_SEEN_KEY = "admin:waitlist:lastSeen"

import { ShieldPlus, Library } from "lucide-react"
import type { AdminRole } from "@/lib/admin"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badgeKey?: "openTickets" | "waitlistNew"
}

const baseNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Waitlist", href: "/admin/waitlist", icon: ListChecks, badgeKey: "waitlistNew" },
  { title: "Scans", href: "/admin/scans", icon: ScanSearch },
  {
    title: "Tickets",
    href: "/admin/tickets",
    icon: MessageSquare,
    badgeKey: "openTickets",
  },
  { title: "Rules", href: "/admin/rules", icon: BookOpen },
  { title: "Library", href: "/admin/library", icon: Library },
]

const developerOnlyNavItems: NavItem[] = [
  { title: "Admins", href: "/admin/admins", icon: ShieldPlus },
]

export function AdminShell({ children, role }: { children: React.ReactNode; role: AdminRole }) {
  const pathname = usePathname()
  const navItems = role === "developer" ? [...baseNavItems, ...developerOnlyNavItems] : baseNavItems

  // Read the "last seen" stamp from localStorage so the API can count entries
  // newer than that. Done in useEffect to keep SSR/CSR markup identical.
  const [waitlistLastSeen, setWaitlistLastSeen] = useState<string | null>(null)
  useEffect(() => {
    setWaitlistLastSeen(
      window.localStorage.getItem(WAITLIST_LAST_SEEN_KEY) ||
        new Date(0).toISOString()
    )
  }, [])

  const statsKey = waitlistLastSeen
    ? `/api/admin/stats?waitlistSince=${encodeURIComponent(waitlistLastSeen)}`
    : null
  const { data: stats, mutate: mutateStats } = useSWR(statsKey, fetcher, {
    refreshInterval: 60000,
  })

  const openTicketCount = stats?.openTickets || 0
  const waitlistNewCount = stats?.waitlistNew || 0

  // Clear the unread badge whenever the admin lands on /admin/waitlist
  useEffect(() => {
    if (pathname?.startsWith("/admin/waitlist")) {
      const now = new Date().toISOString()
      window.localStorage.setItem(WAITLIST_LAST_SEEN_KEY, now)
      setWaitlistLastSeen(now)
      mutateStats()
    }
  }, [pathname, mutateStats])

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-white/[0.02]">
        {/* Brand header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-[#55E039]/20 blur-md" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#55E039]/10 border border-[#55E039]/30">
              <ShieldCheck className="h-5 w-5 text-[#55E039]" />
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-white">Admin Panel</span>
            <p className="text-[10px] font-medium text-[#55E039] uppercase tracking-[0.15em]">
              RegenCompliance
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold text-[#55E039] uppercase tracking-[0.2em]">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
            const badgeCount =
              item.badgeKey === "openTickets"
                ? openTicketCount
                : item.badgeKey === "waitlistNew"
                  ? waitlistNewCount
                  : 0
            const badgeStyle =
              item.badgeKey === "waitlistNew"
                ? "bg-[#55E039]/15 text-[#55E039] border-[#55E039]/30"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#55E039]/10 text-[#55E039] border border-[#55E039]/20 shadow-[0_0_12px_rgba(85,224,57,0.08)]"
                    : "text-white/60 hover:bg-white/[0.05] hover:text-white border border-transparent"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </span>
                {badgeCount > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-[10px] font-bold ${badgeStyle}`}
                  >
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* System status */}
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
            <Zap className="h-3.5 w-3.5 text-[#55E039]" />
            <span className="text-[11px] text-white/50">System Online</span>
            <span className="ml-auto h-2 w-2 rounded-full bg-[#55E039] shadow-[0_0_6px_rgba(85,224,57,0.5)]" />
          </div>
        </div>

        {/* Back link */}
        <div className="border-t border-white/10 px-3 py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/40 hover:bg-white/[0.05] hover:text-white/70 transition-all duration-200 border border-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  )
}
