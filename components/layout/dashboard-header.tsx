"use client"

import { usePathname, useRouter } from "next/navigation"
import { Bell, LogOut, Settings } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"
import { createClient } from "@/lib/supabase/client"
import useSWR from "swr"
import Link from "next/link"

const pageTitles: Record<string, string> = {
  "/dashboard/scanner": "Compliance Scanner",
  "/dashboard/history": "Scan History",
  "/dashboard/library": "Compliance Library",
  "/dashboard/notifications": "Notifications",
  "/dashboard/account": "Account & Billing",
  "/dashboard/account/team": "Team Members",
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
  const initials = userEmail?.slice(0, 2).toUpperCase() || "?"

  const { data: unreadCount } = useSWR(
    "unread-notifications",
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
    <header className="flex h-14 items-center gap-4 border-b px-4 lg:px-6">
      <SidebarTrigger />
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/dashboard/notifications"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "relative"
          )}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{userEmail}</p>
              {clinicName && (
                <p className="text-xs text-muted-foreground truncate">{clinicName}</p>
              )}
              {role && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {role === "owner" ? "Owner" : "Member"}
                </Badge>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/account")}>
              <Settings className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
