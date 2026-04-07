"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { Bell, CheckCheck, AlertTriangle, CreditCard, BookOpen, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Notification } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const typeIcons: Record<string, React.ReactNode> = {
  rule_update: <BookOpen className="h-4 w-4 text-blue-500" />,
  enforcement: <AlertTriangle className="h-4 w-4 text-red-500" />,
  billing: <CreditCard className="h-4 w-4 text-[#55E039]" />,
  system: <Info className="h-4 w-4 text-muted-foreground" />,
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function NotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page: String(page) })
  if (filter === "unread") params.set("unread_only", "true")
  else if (filter !== "all") params.set("type", filter)

  const { data, isLoading } = useSWR(`/api/notifications?${params}`, fetcher)
  const notifications: Notification[] = data?.notifications || []
  const totalPages = data?.totalPages || 1

  async function markAllRead() {
    await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    })
    mutate(`/api/notifications?${params}`)
    mutate("unread-notifications")
  }

  async function handleClick(n: Notification) {
    if (!n.read) {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [n.id] }),
      })
      mutate(`/api/notifications?${params}`)
      mutate("unread-notifications")
    }
    if (n.action_url) {
      router.push(n.action_url)
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground">Stay updated on compliance changes and alerts.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <CheckCheck className="mr-1 h-3 w-3" />
          Mark all read
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => { setFilter(v); setPage(1) }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="rule_update">Rule Updates</TabsTrigger>
          <TabsTrigger value="enforcement">Enforcement</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mb-4 opacity-20" />
            <p>You&apos;re all caught up.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                !n.read ? "border-l-4 border-l-primary bg-primary/5" : ""
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {typeIcons[n.type] || typeIcons.system}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                {timeAgo(n.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
