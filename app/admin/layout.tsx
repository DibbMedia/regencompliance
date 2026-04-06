"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const ADMIN_EMAIL = "isaac@dibbenterprizes.com"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const navItems = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Scans", href: "/admin/scans", icon: ScanSearch },
  { title: "Tickets", href: "/admin/tickets", icon: MessageSquare, badgeKey: "openTickets" as const },
  { title: "Rules", href: "/admin/rules", icon: BookOpen },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  const { data: stats } = useSWR(
    authorized ? "/api/admin/stats" : null,
    fetcher,
    { refreshInterval: 60000 }
  )

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace("/dashboard")
        return
      }

      setAuthorized(true)
      setLoading(false)
    }

    checkAdmin()
  }, [router])

  if (loading || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const openTicketCount = stats?.openTickets || 0

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
            const showBadge = item.badgeKey && openTicketCount > 0
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </span>
                {showBadge && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500/20 px-1.5 text-[10px] font-bold text-yellow-400">
                    {openTicketCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  )
}
