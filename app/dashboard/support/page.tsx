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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  open: "bg-green-500/10 text-green-700 border-green-300 dark:text-green-400",
  in_progress: "bg-yellow-500/10 text-yellow-700 border-yellow-300 dark:text-yellow-400",
  resolved: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-400",
  closed: "bg-gray-500/10 text-gray-700 border-gray-300 dark:text-gray-400",
}

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
}

const priorityStyles: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-700 border-gray-300 dark:text-gray-400",
  normal: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-400",
  high: "bg-orange-500/10 text-orange-700 border-orange-300 dark:text-orange-400",
  urgent: "bg-red-500/10 text-red-700 border-red-300 dark:text-red-400",
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
      <div className="space-y-2 p-4">
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-16 w-3/4 ml-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-3 max-h-96 overflow-y-auto px-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.is_admin
                  ? "bg-muted text-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-xs">
                  {msg.is_admin ? "Support Team" : "You"}
                </span>
                <span className="text-xs opacity-70">
                  {formatDate(msg.created_at)}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

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
            className="min-h-[60px] resize-none"
          />
          <Button
            onClick={handleReply}
            disabled={!reply.trim() || sending}
            size="icon"
            className="shrink-0 self-end h-10 w-10"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm truncate">{ticket.subject}</span>
            <Badge variant="outline" className={statusStyles[ticket.status] || statusStyles.open}>
              {statusLabels[ticket.status] || ticket.status}
            </Badge>
            <Badge variant="outline" className={priorityStyles[ticket.priority] || priorityStyles.normal}>
              {priorityLabels[ticket.priority] || ticket.priority}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Created {formatDate(ticket.created_at)} &middot; Updated {timeAgo(ticket.updated_at)}
          </p>
        </div>
        <div className="shrink-0 ml-2">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      {expanded && (
        <CardContent className="border-t pt-4">
          <TicketThread ticketId={ticket.id} status={ticket.status} />
        </CardContent>
      )}
    </Card>
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

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support</h2>
          <p className="text-muted-foreground">
            Need help? Open a ticket and our team will respond as soon as possible.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80">
            <Plus className="h-4 w-4" />
            New Ticket
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v ?? "normal")}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!subject.trim() || !message.trim() || creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={filter} onValueChange={(v) => { setFilter(v); setPage(1) }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
            <LifeBuoy className="h-12 w-12 mb-4 opacity-30" />
            <p>No tickets found. Click &ldquo;New Ticket&rdquo; to get in touch with support.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <TicketRow key={ticket.id} ticket={ticket} />
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
