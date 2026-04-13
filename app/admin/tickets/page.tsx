"use client"

import useSWR, { mutate } from "swr"
import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Ticket {
  id: string
  user_id?: string
  profile_id?: string
  user_email: string
  subject: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

interface TicketMessage {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_admin: boolean
  created_at: string
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
]

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

const STATUS_FLOW = ["open", "in_progress", "resolved", "closed"]

export default function AdminTicketsPage() {
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [search, setSearch] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"date" | "priority">("date")

  const params = new URLSearchParams({ page: String(page), limit: "20" })
  if (statusFilter) params.set("status", statusFilter)

  const { data, isLoading } = useSWR(
    `/api/admin/tickets?${params}`,
    fetcher,
    { refreshInterval: 15000 }
  )

  let tickets: Ticket[] = data?.tickets || []
  const totalPages = data?.totalPages || 1
  const total = data?.total || 0

  // Client-side filtering for search and priority (API supports status only)
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    tickets = tickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.user_email.toLowerCase().includes(q)
    )
  }
  if (priorityFilter) {
    tickets = tickets.filter((t) => t.priority === priorityFilter)
  }

  // Sort
  const priorityOrder: Record<string, number> = {
    urgent: 0,
    high: 1,
    normal: 2,
    medium: 2,
    low: 3,
  }
  if (sortBy === "priority") {
    tickets = [...tickets].sort(
      (a, b) =>
        (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
    )
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearchQuery(search)
  }

  function toggleExpand(ticketId: string) {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId)
  }

  async function updateTicket(
    ticketId: string,
    updates: { status?: string; priority?: string }
  ) {
    const field = updates.status ? "status" : "priority"
    const value = updates.status || updates.priority
    if (
      !window.confirm(
        `Change ticket ${field} to "${value?.replace("_", " ")}"?`
      )
    )
      return

    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticketId, ...updates }),
    })
    mutate(`/api/admin/tickets?${params}`)
  }

  // Status count badges
  const openCount = (data?.tickets || []).filter(
    (t: Ticket) => t.status === "open"
  ).length
  const ipCount = (data?.tickets || []).filter(
    (t: Ticket) => t.status === "in_progress"
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-sm text-white/40 mt-1">
            Manage customer support requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          {openCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
              <AlertCircle className="h-3 w-3" />
              {openCount} open
            </span>
          )}
          {ipCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
              <Clock className="h-3 w-3" />
              {ipCount} in progress
            </span>
          )}
          <span className="text-sm text-white/40">{total} total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form
          onSubmit={handleSearch}
          className="flex gap-2 flex-1 min-w-[280px] max-w-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Search by subject or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#55E039]/30"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            className="bg-white/[0.05] border border-white/10 text-white/70 hover:bg-white/[0.08]"
          >
            Search
          </Button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "priority")}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
        >
          <option value="date" className="bg-[#0a0a0a]">
            Sort by Date
          </option>
          <option value="priority" className="bg-[#0a0a0a]">
            Sort by Priority
          </option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-medium text-white/40 w-8" />
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                ID
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                User
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Subject
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Priority
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Created
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={8} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
                  </td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-white/40"
                >
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  {data?.error
                    ? "Support tickets table not found. Create the table in Supabase to enable this feature."
                    : "No tickets found."}
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  isExpanded={expandedTicket === ticket.id}
                  onToggle={() => toggleExpand(ticket.id)}
                  onStatusChange={(newStatus) =>
                    updateTicket(ticket.id, { status: newStatus })
                  }
                  onPriorityChange={(newPriority) =>
                    updateTicket(ticket.id, { priority: newPriority })
                  }
                  queryKey={`/api/admin/tickets?${params}`}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/40">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-white/10 text-white/70 hover:bg-white/[0.05]"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-white/10 text-white/70 hover:bg-white/[0.05]"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Ticket Row ──────────────────────── */

function TicketRow({
  ticket,
  isExpanded,
  onToggle,
  onStatusChange,
  onPriorityChange,
  queryKey,
}: {
  ticket: Ticket
  isExpanded: boolean
  onToggle: () => void
  onStatusChange: (status: string) => void
  onPriorityChange: (priority: string) => void
  queryKey: string
}) {
  return (
    <>
      <tr
        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </td>
        <td className="px-4 py-3 font-mono text-xs text-white/50">
          {ticket.id.slice(0, 8)}
        </td>
        <td className="px-4 py-3 text-white/80">{ticket.user_email}</td>
        <td className="px-4 py-3 max-w-[240px] truncate text-white/70">
          {ticket.subject}
        </td>
        <td className="px-4 py-3">
          <TicketStatusBadge status={ticket.status} />
        </td>
        <td className="px-4 py-3">
          <PriorityBadge priority={ticket.priority} />
        </td>
        <td className="px-4 py-3 text-white/40 text-xs">
          {formatDate(ticket.created_at)}
        </td>
        <td className="px-4 py-3 text-white/40 text-xs">
          {formatDate(ticket.updated_at)}
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-white/5">
          <td colSpan={8} className="px-4 py-0">
            <TicketDetailPanel
              ticket={ticket}
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
              queryKey={queryKey}
            />
          </td>
        </tr>
      )}
    </>
  )
}

/* ─── Ticket Detail Panel ──────────────────────── */

function TicketDetailPanel({
  ticket,
  onStatusChange,
  onPriorityChange,
  queryKey,
}: {
  ticket: Ticket
  onStatusChange: (status: string) => void
  onPriorityChange: (priority: string) => void
  queryKey: string
}) {
  const {
    data,
    isLoading,
    mutate: mutateMessages,
  } = useSWR<{
    messages: TicketMessage[]
  }>(`/api/admin/tickets/${ticket.id}/messages`, fetcher)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)

  const messages = data?.messages || []

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    try {
      await fetch(`/api/admin/tickets/${ticket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      })
      setReply("")
      mutateMessages()
    } catch (err) {
      console.error("Reply failed:", err)
    }
    setSending(false)
  }

  return (
    <div className="py-5 space-y-5">
      {/* Ticket info bar */}
      <div className="flex flex-wrap gap-4 items-center rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-white/40" />
          <span className="text-sm text-white/70">{ticket.user_email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/40" />
          <span className="text-xs text-white/50">
            Created {new Date(ticket.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Status & Priority controls */}
      <div className="flex flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">
            Status
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation()
                  onStatusChange(s)
                }}
                disabled={ticket.status === s}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  ticket.status === s
                    ? "bg-[#55E039]/10 text-[#55E039] border border-[#55E039]/30"
                    : "bg-white/[0.03] text-white/50 border border-white/10 hover:bg-white/[0.06] hover:text-white/80"
                }`}
              >
                {s === "open" && <AlertCircle className="h-3 w-3" />}
                {s === "in_progress" && <Clock className="h-3 w-3" />}
                {s === "resolved" && <CheckCircle2 className="h-3 w-3" />}
                {s === "closed" && <XCircle className="h-3 w-3" />}
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">
            Priority
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {["low", "normal", "high", "urgent"].map((p) => (
              <button
                key={p}
                onClick={(e) => {
                  e.stopPropagation()
                  onPriorityChange(p)
                }}
                disabled={ticket.priority === p}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  ticket.priority === p
                    ? priorityActiveClass(p)
                    : "bg-white/[0.03] text-white/50 border border-white/10 hover:bg-white/[0.06] hover:text-white/80"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message thread */}
      <div>
        <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">
          Conversation
        </p>
        <div className="rounded-lg border border-white/10 bg-[#0a0a0a]/50 p-4 max-h-80 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-4">
              No messages yet.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg px-4 py-3 text-sm ${
                  msg.is_admin
                    ? "bg-[#55E039]/5 border border-[#55E039]/15 ml-8"
                    : "bg-white/[0.03] border border-white/10 mr-8"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-medium ${
                      msg.is_admin ? "text-[#55E039]" : "text-white/50"
                    }`}
                  >
                    {msg.is_admin ? "Admin" : "User"}
                  </span>
                  <span className="text-[10px] text-white/30">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-white/80">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply form */}
      <form onSubmit={handleReply} className="flex gap-2">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          rows={2}
          className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#55E039]/50 focus:border-[#55E039]/30 resize-none"
        />
        <Button
          type="submit"
          size="sm"
          disabled={sending || !reply.trim()}
          className="self-end bg-[#55E039] text-black hover:bg-[#55E039]/90 font-medium"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
}

/* ─── Utility ──────────────────────── */

function priorityActiveClass(p: string): string {
  const map: Record<string, string> = {
    low: "bg-white/5 text-white/60 border border-white/20",
    normal: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    high: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
    urgent: "bg-red-500/10 text-red-400 border border-red-500/30",
  }
  return map[p] || map.normal
}

function TicketStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    resolved: "bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20",
    closed: "bg-white/5 text-white/40 border-white/10",
  }
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${
        colors[status] || colors.open
      }`}
    >
      {status.replace("_", " ")}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: "bg-white/5 text-white/40 border-white/10",
    normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    urgent: "bg-red-500/10 text-red-400 border-red-500/20",
  }
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${
        colors[priority] || colors.normal
      }`}
    >
      {priority}
    </span>
  )
}

function formatDate(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffDay < 1)
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString()
}
