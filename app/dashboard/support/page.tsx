"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  LifeBuoy,
  Plus,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface TicketMessage {
  id: string
  ticket_id: string
  user_id: string | null
  is_admin: boolean
  message: string
  created_at: string
}

interface Ticket {
  id: string
  profile_id: string
  user_id: string | null
  subject: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

const statusStyles: Record<string, string> = {
  open: "bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20",
  in_progress: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  resolved: "bg-white/[0.06] text-white/40 border-white/10",
  closed: "bg-white/[0.06] text-white/30 border-white/10",
}

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
}

const priorityStyles: Record<string, string> = {
  low: "bg-white/[0.06] text-white/40 border-white/10",
  normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-400 border-red-500/20",
}

const priorityLabels: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function TicketThread({ ticketId, status }: { ticketId: string; status: string }) {
  const { data, isLoading } = useSWR(`/api/tickets/${ticketId}`, fetcher)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)

  const messages: TicketMessage[] = data?.messages || []

  async function handleReply() {
    if (!reply.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      })
      if (res.ok) {
        setReply("")
        mutate(`/api/tickets/${ticketId}`)
        mutate((key: string) => typeof key === "string" && key.startsWith("/api/tickets?"), undefined, { revalidate: true })
      }
    } finally {
      setSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-16 w-3/4 bg-white/[0.06] rounded-lg" />
        <Skeleton className="h-16 w-3/4 ml-auto bg-white/[0.06] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      {/* Chat messages */}
      <div className="space-y-3 max-h-96 overflow-y-auto px-1 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[80%] rounded-xl px-4 py-3 text-sm border ${
                msg.is_admin
                  ? "bg-white/[0.03] border-white/10 text-white/70"
                  : "bg-[#55E039]/10 border-[#55E039]/20 text-white/90"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`font-semibold text-xs ${
                  msg.is_admin ? "text-white/50" : "text-[#55E039]"
                }`}>
                  {msg.is_admin ? "Support Team" : "You"}
                </span>
                <span className="text-xs text-white/30">
                  {formatDate(msg.created_at)}
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply input */}
      {status !== "closed" && (
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleReply()
              }
            }}
            className="min-h-[60px] resize-none bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#55E039]/50 focus:ring-[#55E039]/20 rounded-lg"
          />
          <button
            onClick={handleReply}
            disabled={!reply.trim() || sending}
            className="shrink-0 self-end w-10 h-10 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] flex items-center justify-center shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300 disabled:opacity-40 disabled:shadow-none"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ${
      expanded ? "shadow-[0_0_30px_rgba(85,224,57,0.05)]" : "hover:bg-white/[0.06] hover:border-white/15"
    }`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <MessageSquare className="h-4 w-4 text-white/30 shrink-0" />
            <span className="font-medium text-sm text-white truncate">{ticket.subject}</span>
            <Badge className={`text-xs border ${statusStyles[ticket.status] || statusStyles.open}`}>
              {statusLabels[ticket.status] || ticket.status}
            </Badge>
            <Badge className={`text-xs border ${priorityStyles[ticket.priority] || priorityStyles.normal}`}>
              {priorityLabels[ticket.priority] || ticket.priority}
            </Badge>
          </div>
          <p className="text-xs text-white/40">
            Created {formatDate(ticket.created_at)} &middot; Updated {timeAgo(ticket.updated_at)}
          </p>
        </div>
        <div className="shrink-0 ml-3">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-white/30" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/30" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-white/10 p-4">
          <TicketThread ticketId={ticket.id} status={ticket.status} />
        </div>
      )}
    </div>
  )
}

export default function SupportPage() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [priority, setPriority] = useState("normal")
  const [message, setMessage] = useState("")
  const [creating, setCreating] = useState(false)

  const params = new URLSearchParams({ page: String(page) })
  if (filter !== "all") params.set("status", filter)

  const { data, isLoading } = useSWR(`/api/tickets?${params}`, fetcher)
  const tickets: Ticket[] = data?.tickets || []
  const totalPages = data?.totalPages || 1

  async function handleCreate() {
    if (!subject.trim() || !message.trim() || creating) return
    setCreating(true)
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, priority, message }),
      })
      if (res.ok) {
        setSubject("")
        setPriority("normal")
        setMessage("")
        setDialogOpen(false)
        mutate(`/api/tickets?${params}`)
      }
    } finally {
      setCreating(false)
    }
  }

  const filterTabs = [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">Help</p>
          <h1 className="text-3xl font-bold text-white">Support</h1>
          <p className="text-white/60 mt-1">
            Need help? Open a ticket and our team will respond as soon as possible.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-bold text-sm shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300">
            <Plus className="h-4 w-4" />
            New Ticket
          </DialogTrigger>
          <DialogContent className="bg-[#141414] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Subject</Label>
                <Input
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#55E039]/50 focus:ring-[#55E039]/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v ?? "normal")}>
                  <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Message</Label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#55E039]/50 focus:ring-[#55E039]/20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/[0.06] hover:text-white/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!subject.trim() || !message.trim() || creating}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-bold text-sm shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300 disabled:opacity-40 disabled:shadow-none"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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

      {/* Ticket List */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Tickets</p>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-white/[0.06] rounded-xl" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mb-4">
              <LifeBuoy className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/70 font-medium">No support tickets yet</p>
            <p className="text-white/40 text-sm mt-1">Click &ldquo;New Ticket&rdquo; to get in touch with our support team</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketRow key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

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
