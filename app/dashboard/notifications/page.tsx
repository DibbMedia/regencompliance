"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { toast } from "sonner"
import { Bell, CheckCheck, AlertTriangle, CreditCard, Scale, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Notification } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  rule_update: {
    icon: <Scale className="h-4 w-4" />,
    color: "text-blue-400 bg-blue-500/10",
  },
  enforcement: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-red-400 bg-red-500/10",
  },
  billing: {
    icon: <CreditCard className="h-4 w-4" />,
    color: "text-[#55E039] bg-[#55E039]/10",
  },
  system: {
    icon: <Info className="h-4 w-4" />,
    color: "text-white/40 bg-white/[0.06]",
  },
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 172800) return "yesterday"
  return `${Math.floor(seconds / 86400)}d ago`
}

function getDateGroup(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return "This Week"
  if (diffDays < 30) return "This Month"
  return "Older"
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

  // Group notifications by date
  const grouped = useMemo(() => {
    const groups: { label: string; items: Notification[] }[] = []
    let currentLabel = ""

    for (const n of notifications) {
      const label = getDateGroup(n.created_at)
      if (label !== currentLabel) {
        groups.push({ label, items: [n] })
        currentLabel = label
      } else {
        groups[groups.length - 1].items.push(n)
      }
    }

    return groups
  }, [notifications])

  async function markAllRead() {
    const res = await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    })
    if (res.ok) {
      toast.success("All notifications marked as read.")
    } else {
      toast.error("Failed to mark notifications as read.")
    }
    mutate(`/api/notifications?${params}`)
    // Force sidebar badge refresh by re-fetching
    window.dispatchEvent(new CustomEvent("notifications-updated"))
  }

  async function handleClick(n: Notification) {
    if (!n.read) {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [n.id] }),
      })
      mutate(`/api/notifications?${params}`)
      window.dispatchEvent(new CustomEvent("notifications-updated"))
    }
    if (n.action_url) {
      router.push(n.action_url)
    }
  }

  const filterTabs = [
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
    { value: "rule_update", label: "Rule Updates" },
    { value: "enforcement", label: "Enforcement" },
    { value: "billing", label: "Billing" },
  ]

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-white/60 mt-1">Stay updated on compliance changes and alerts.</p>
        </div>
        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] text-sm font-medium hover:bg-[#55E039]/[0.08] transition-all duration-200"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.03] rounded-lg border border-white/10 w-fit overflow-x-auto max-w-full">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setFilter(tab.value); setPage(1) }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              filter === tab.value
                ? "bg-[#55E039]/10 text-[#55E039]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-white/[0.06] rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-white/20" />
          </div>
          <p className="text-white/70 font-medium">You&apos;re all caught up</p>
          <p className="text-white/40 text-sm mt-1">No notifications to display right now</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label} className="space-y-3">
              {/* Date group label */}
              <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">{group.label}</p>

              <div className="space-y-2">
                {group.items.map((n) => {
                  const config = typeConfig[n.type] || typeConfig.system
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`relative flex gap-4 rounded-xl border p-3 sm:p-4 cursor-pointer transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15 ${
                        !n.read
                          ? "bg-white/[0.03] border-l-2 border-l-[#55E039] border-t-white/10 border-r-white/10 border-b-white/10"
                          : "bg-white/[0.02] border-white/[0.07]"
                      }`}
                    >
                      {/* Unread dot */}
                      {!n.read && (
                        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#55E039] shadow-[0_0_8px_rgba(85,224,57,0.5)]" />
                      )}

                      {/* Icon */}
                      <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={`text-sm font-medium ${!n.read ? "text-white" : "text-white/70"}`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-white/50 line-clamp-2 mt-0.5">{n.body}</p>
                      </div>

                      {/* Timestamp */}
                      <span className="text-xs text-white/30 shrink-0 mt-0.5">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-white/40">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
