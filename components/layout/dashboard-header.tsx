"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Bell, LogOut, Settings } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"
import Link from "next/link"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/scanner": "Compliance Scanner",
  "/dashboard/history": "Scan History",
  "/dashboard/library": "Enforcement Actions",
  "/dashboard/sites": "Monitored Sites",
  "/dashboard/templates": "Templates",
  "/dashboard/badge": "Compliance Badge",
  "/dashboard/feed": "Compliance Feed",
  "/dashboard/notifications": "Notifications",
  "/dashboard/account": "Account & Billing",
  "/dashboard/account/team": "Team Members",
  "/dashboard/support": "Support",
  "/dashboard/help": "Help Center",
}

interface DashboardHeaderProps {
  userEmail?: string | null
  clinicName?: string | null
  role?: string
}

export function DashboardHeader({ userEmail, clinicName, role }: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const title = pageTitles[pathname] || "Dashboard"
  const initials = clinicName?.slice(0, 2).toUpperCase() || userEmail?.slice(0, 2).toUpperCase() || "?"

  const { data: unreadCount, mutate: refreshUnread } = useSWR(
    "unread-notifications",
    async () => {
      const res = await fetch("/api/notifications/unread-count")
      if (!res.ok) return 0
      const data = await res.json()
      return data.count || 0
    },
    { refreshInterval: 60000 }
  )

  useEffect(() => {
    function handleUpdate() { refreshUnread() }
    window.addEventListener("notifications-updated", handleUpdate)
    return () => window.removeEventListener("notifications-updated", handleUpdate)
  }, [refreshUnread])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="flex h-14 items-center gap-4 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-sm px-4 lg:px-6">
      <SidebarTrigger className="text-white/50 hover:text-white hover:bg-white/[0.04]" />
      <h1 className="text-sm font-semibold text-white">{title}</h1>
      <div className="ml-auto flex items-center gap-1">
        {/* Notification bell */}
        <Link
          href="/dashboard/notifications"
          className={cn(
            "relative inline-flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
          )}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#55E039] px-1 text-[9px] font-bold text-[#0a0a0a]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-2.5 sm:py-1.5 hover:bg-white/[0.04] transition-colors outline-none">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] border border-white/10">
              <span className="text-[10px] font-bold text-white/70">{initials}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#111111] border-white/10">
            <div className="px-3 py-2">
              {clinicName && (
                <p className="text-sm font-semibold text-white truncate">{clinicName}</p>
              )}
              <p className="text-xs text-white/40 truncate">{userEmail}</p>
              {role && (
                <span className="inline-flex mt-1.5 items-center rounded-full bg-[#55E039]/10 border border-[#55E039]/20 px-2 py-0.5 text-[10px] font-medium text-[#55E039]">
                  {role === "owner" ? "Owner" : "Member"}
                </span>
              )}
            </div>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/account")}
              className="text-white/60 hover:text-white focus:text-white focus:bg-white/[0.04]"
            >
              <Settings className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-white/40 hover:text-white focus:text-white focus:bg-white/[0.04]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
