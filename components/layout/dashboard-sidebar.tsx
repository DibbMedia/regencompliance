"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Shield,
  Newspaper,
  Clock,
  BookOpen,
  Bell,
  LifeBuoy,
  Settings,
  LogOut,
  Users,
  Rss,
  Globe,
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
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import useSWR from "swr"

const navSections = [
  {
    label: "Main",
    items: [
      { title: "Scanner", href: "/dashboard/scanner", icon: Shield },
      { title: "Scan History", href: "/dashboard/history", icon: Clock },
      { title: "Compliance Library", href: "/dashboard/library", icon: BookOpen },
      { title: "Sites", href: "/dashboard/sites", icon: Globe },
    ],
  },
  {
    label: "Updates",
    items: [
      { title: "News Feed", href: "/dashboard/feed", icon: Rss },
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: true },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Account & Billing", href: "/dashboard/account", icon: Settings },
      { title: "Team", href: "/dashboard/account/team", icon: Users },
      { title: "Support", href: "/dashboard/support", icon: LifeBuoy },
    ],
  },
]

interface DashboardSidebarProps {
  clinicName?: string | null
  userEmail?: string | null
}

export function DashboardSidebar({ clinicName, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const { data: unreadCount } = useSWR(
    "sidebar-unread",
    async () => {
      const res = await fetch("/api/notifications/unread-count")
      if (!res.ok) return 0
      const data = await res.json()
      return data.count || 0
    },
    { refreshInterval: 60000 }
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <Sidebar>
      {/* Brand */}
      <SidebarHeader className="border-b border-white/[0.06] px-5 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#55E039] to-[#3BB82A] shadow-[0_0_20px_rgba(85,224,57,0.2)]">
            <Shield className="h-4 w-4 text-[#0a0a0a]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight leading-none">
              Regen<span className="text-[#55E039]">Compliance</span>
            </span>
            <span className="text-[10px] text-white/30 font-medium tracking-wide">
              FDA/FTC Scanner
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Nav Sections */}
      <SidebarContent className="px-2 py-2">
        {navSections.map((section) => (
          <SidebarGroup key={section.label} className="py-1">
            <SidebarGroupLabel className="px-3 mb-1 text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href))

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                        className={
                          isActive
                            ? "bg-[#55E039]/10 text-[#55E039] font-medium border-l-2 border-[#55E039] rounded-l-none"
                            : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {"badge" in item && item.badge && unreadCount > 0 && (
                        <SidebarMenuBadge className="bg-[#55E039] text-[#0a0a0a] text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] border border-white/10">
            <span className="text-xs font-bold text-white/70">
              {clinicName?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            {clinicName && (
              <span className="text-xs font-semibold text-white truncate">{clinicName}</span>
            )}
            {userEmail && (
              <span className="text-[10px] text-white/30 truncate">{userEmail}</span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-200 w-full"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
