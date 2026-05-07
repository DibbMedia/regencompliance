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
  ScrollText,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

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
  { title: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
]

const developerOnlyNavItems: NavItem[] = [
  { title: "Admins", href: "/admin/admins", icon: ShieldPlus },
]

const adminPageTitles: Record<string, string> = {
  "/admin": "Command Center",
  "/admin/users": "Users",
  "/admin/waitlist": "Waitlist",
  "/admin/scans": "Scans",
  "/admin/tickets": "Tickets",
  "/admin/rules": "Compliance Rules",
  "/admin/library": "Enforcement Library",
  "/admin/audit-log": "Audit Log",
  "/admin/admins": "Admins",
}

function getAdminTitle(pathname: string | null): string {
  if (!pathname) return "Admin"
  if (adminPageTitles[pathname]) return adminPageTitles[pathname]
  for (const [prefix, title] of Object.entries(adminPageTitles)) {
    if (prefix !== "/admin" && pathname.startsWith(prefix)) return title
  }
  return "Admin"
}

export function AdminShell({ children, role }: { children: React.ReactNode; role: AdminRole }) {
  const pathname = usePathname()
  const navItems = role === "developer" ? [...baseNavItems, ...developerOnlyNavItems] : baseNavItems

  const [waitlistLastSeen, setWaitlistLastSeen] = useState<string | null>(null)
  useEffect(() => {
    // Mount-only: hydrate from localStorage. The cascade into the SWR key
    // below is the correct SSR pattern (null on server -> stamp on
    // client), so the set-state-in-effect rule is over-broad here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWaitlistLastSeen(
      window.localStorage.getItem(WAITLIST_LAST_SEEN_KEY) ||
        new Date(0).toISOString()
    )
  }, [])

  const statsKey = waitlistLastSeen
    ? `/api/admin/stats?waitlistSince=${encodeURIComponent(waitlistLastSeen)}`
    : null
  const { data: stats, error: statsError, isLoading: statsLoading, mutate: mutateStats } = useSWR(statsKey, fetcher, {
    refreshInterval: 60000,
  })

  const openTicketCount = stats?.openTickets || 0
  const waitlistNewCount = stats?.waitlistNew || 0

  // Drive the footer indicator off the actual /api/admin/stats poll
  // instead of a hardcoded green dot. If SWR errors (auth issue, API
  // outage) we surface that, not a fake "all good" signal.
  const systemStatus: "online" | "loading" | "error" =
    statsError ? "error" : statsLoading || !stats ? "loading" : "online"

  useEffect(() => {
    if (pathname?.startsWith("/admin/waitlist")) {
      const now = new Date().toISOString()
      window.localStorage.setItem(WAITLIST_LAST_SEEN_KEY, now)
      // The downstream cascade (waitlistLastSeen -> statsKey -> SWR
      // re-fetch) is intentional: visiting /admin/waitlist marks unread
      // entries seen and refreshes the badge count.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWaitlistLastSeen(now)
      mutateStats()
    }
  }, [pathname, mutateStats])

  const title = getAdminTitle(pathname)

  return (
    <SidebarProvider>
      <div className="flex min-h-[100dvh] w-full bg-[#0a0a0a]">
        <Sidebar>
          <SidebarHeader className="border-b border-white/[0.06] px-5 py-4">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-lg bg-[#55E039]/20 blur-md" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#55E039]/10 border border-[#55E039]/30">
                  <ShieldCheck className="h-5 w-5 text-[#55E039]" />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white truncate">Admin Panel</span>
                <span className="text-[10px] font-medium text-[#55E039] uppercase tracking-[0.15em] truncate">
                  RegenCompliance
                </span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-2 py-2">
            <SidebarGroup className="py-1">
              <SidebarGroupLabel className="px-3 mb-1 text-[10px] font-bold text-[#55E039] uppercase tracking-[0.2em]">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {navItems.map((item) => {
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname?.startsWith(item.href) ?? false
                    const badgeCount =
                      item.badgeKey === "openTickets"
                        ? openTicketCount
                        : item.badgeKey === "waitlistNew"
                          ? waitlistNewCount
                          : 0
                    const badgeStyle =
                      item.badgeKey === "waitlistNew"
                        ? "bg-[#55E039]/15 text-[#55E039] border border-[#55E039]/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.title}
                          render={<Link href={item.href} />}
                          className={
                            isActive
                              ? "bg-[#55E039]/10 text-[#55E039] font-medium border-l-2 border-[#55E039] rounded-l-none"
                              : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                        {badgeCount > 0 && (
                          <SidebarMenuBadge
                            className={`text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1.5 ${badgeStyle}`}
                          >
                            {badgeCount}
                          </SidebarMenuBadge>
                        )}
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-white/[0.06] px-3 py-3 gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
              <Zap className={`h-3.5 w-3.5 ${
                systemStatus === "online" ? "text-[#55E039]" :
                systemStatus === "loading" ? "text-white/55" :
                "text-red-400"
              }`} />
              <span className="text-[11px] text-white/60">
                {systemStatus === "online" && "Stats live"}
                {systemStatus === "loading" && "Loading stats..."}
                {systemStatus === "error" && "Stats failed"}
              </span>
              <span className={`ml-auto h-2 w-2 rounded-full ${
                systemStatus === "online" ? "bg-[#55E039] shadow-[0_0_6px_rgba(85,224,57,0.5)]" :
                systemStatus === "loading" ? "bg-white/40" :
                "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]"
              }`} />
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/55 hover:bg-white/[0.05] hover:text-white transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-14 items-center gap-3 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-sm px-4 lg:px-6 sticky top-0 z-10">
            <SidebarTrigger className="text-white/55 hover:text-white hover:bg-white/[0.04]" />
            <h1 className="text-sm font-semibold text-white truncate">{title}</h1>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
