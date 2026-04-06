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
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  { title: "Scanner", href: "/dashboard/scanner", icon: Shield },
  { title: "News Feed", href: "/dashboard/feed", icon: Newspaper },
  { title: "Scan History", href: "/dashboard/history", icon: Clock },
  { title: "Compliance Library", href: "/dashboard/library", icon: BookOpen },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Support", href: "/dashboard/support", icon: LifeBuoy },
  { title: "Account & Billing", href: "/dashboard/account", icon: Settings },
]

interface DashboardSidebarProps {
  clinicName?: string | null
  userEmail?: string | null
}

export function DashboardSidebar({ clinicName, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/dashboard/scanner" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">RegenCompliance</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-3">
        <div className="flex flex-col gap-1 text-sm">
          {clinicName && (
            <span className="font-medium truncate">{clinicName}</span>
          )}
          {userEmail && (
            <span className="text-muted-foreground truncate text-xs">{userEmail}</span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
