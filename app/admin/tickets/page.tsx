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
} from "lucide-react"
import { Button } from "@/components/ui/button"

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

const STATUS_FLOW = ["open", "in_progress", "resolved", "closed"]

export default function AdminTicketsPage() {
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)

  const params = new URLSearchParams({ page: String(page), limit: "20" })
  if (statusFilter) params.set("status", statusFilter)

  const { data, isLoading } = useSWR(
    `/api/admin/tickets?${params}`,
    fetcher,
    { refreshInterval: 15000 }
  )

  const tickets: Ticket[] = data?.tickets || []
  const totalPages = data?.totalPages || 1
  const total = data?.total || 0

  function toggleExpand(ticketId: string) {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId)
  }

  async function updateStatus(ticketId: string, newStatus: string) {
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticketId, status: newStatus }),
    })
    mutate(`/api/admin/tickets?${params}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Status filter */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium w-8"></th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">User Email</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Last Updated</th>
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
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {data?.error
                    ? "Support tickets table not found. Create the table in Supabase to enable this feature."
                    : "No tickets found."}
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <>
                  <tr
                    key={ticket.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => toggleExpand(ticket.id)}
                  >
                    <td className="px-4 py-3">
                      {expandedTicket === ticket.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {ticket.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">{ticket.user_email}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-3">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                  {expandedTicket === ticket.id && (
                    <tr key={`${ticket.id}-expand`} className="border-b border-white/5">
                      <td colSpan={8} className="px-4 py-0">
                        <TicketExpandedRow
                          ticket={ticket}
                          onStatusChange={(newStatus) =>
                            updateStatus(ticket.id, newStatus)
                          }
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-white/10"
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

function TicketExpandedRow({
  ticket,
  onStatusChange,
}: {
  ticket: Ticket
  onStatusChange: (status: string) => void
}) {
  const { data, isLoading, mutate: mutateMessages } = useSWR<{
    messages: TicketMessage[]
  }>(`/api/admin/tickets/${ticket.id}/messages`, fetcher)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)

  const messages = data?.messages || []
  const currentIdx = STATUS_FLOW.indexOf(ticket.status)

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
    <div className="py-4 space-y-4">
      {/* Status change buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground mr-2">Change status:</span>
        {STATUS_FLOW.map((s, idx) => (
          <Button
            key={s}
            variant={ticket.status === s ? "default" : "outline"}
            size="sm"
            disabled={ticket.status === s}
            onClick={(e) => {
              e.stopPropagation()
              onStatusChange(s)
            }}
            className={`text-xs ${
              ticket.status !== s ? "border-white/10" : ""
            }`}
          >
            {s === "open" && <AlertCircle className="h-3 w-3 mr-1" />}
            {s === "in_progress" && <Clock className="h-3 w-3 mr-1" />}
            {s === "resolved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {s === "closed" && <XCircle className="h-3 w-3 mr-1" />}
            {s.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Message thread */}
      <div className="rounded-lg border border-white/10 bg-white/[0.01] p-4 max-h-80 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.is_admin
                  ? "bg-primary/10 border border-primary/20 ml-8"
                  : "bg-white/[0.03] border border-white/10 mr-8"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-medium ${
                    msg.is_admin ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {msg.is_admin ? "Admin" : "User"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      {/* Reply form */}
      <form onSubmit={handleReply} className="flex gap-2">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          rows={2}
          className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <Button
          type="submit"
          size="sm"
          disabled={sending || !reply.trim()}
          className="self-end"
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

function TicketStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-yellow-500/20 text-yellow-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    resolved: "bg-green-500/20 text-green-400",
    closed: "bg-gray-500/20 text-gray-400",
  }
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        colors[status] || colors.open
      }`}
    >
      {status.replace("_", " ")}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: "bg-gray-500/20 text-gray-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-orange-500/20 text-orange-400",
    urgent: "bg-red-500/20 text-red-400",
  }
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        colors[priority] || colors.medium
      }`}
    >
      {priority}
    </span>
  )
}
