"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  ScrollText,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface AuditEvent {
  id: string
  user_id: string | null
  user_email: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  status: "success" | "failure" | "error" | null
  created_at: string
}

interface AuditResponse {
  events: AuditEvent[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "success", label: "Success" },
  { value: "failure", label: "Failure" },
  { value: "error", label: "Error" },
]

const STATUS_TONE: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  success: { bg: "bg-[#55E039]/10 border-[#55E039]/20", text: "text-[#55E039]", icon: CheckCircle2 },
  failure: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400", icon: XCircle },
  error: { bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-300", icon: AlertTriangle },
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export default function AdminAuditLogPage() {
  const [actionFilter, setActionFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [actionInput, setActionInput] = useState("")
  const [emailInput, setEmailInput] = useState("")
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<string | null>(null)

  const params = new URLSearchParams({ page: String(page), limit: "50" })
  if (actionFilter) params.set("action", actionFilter)
  if (emailFilter) params.set("user_email", emailFilter)
  if (statusFilter) params.set("status", statusFilter)

  const { data, isLoading, error } = useSWR<AuditResponse>(
    `/api/admin/audit-log?${params.toString()}`,
    fetcher,
    { keepPreviousData: true },
  )

  function applyFilters(e: React.FormEvent) {
    e.preventDefault()
    setActionFilter(actionInput.trim())
    setEmailFilter(emailInput.trim())
    setPage(1)
  }

  function clearFilters() {
    setActionInput("")
    setEmailInput("")
    setStatusFilter("")
    setActionFilter("")
    setEmailFilter("")
    setPage(1)
  }

  const events = data?.events ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const hasFilters = Boolean(actionFilter || emailFilter || statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit log</h1>
          <p className="mt-1 text-sm text-white/55 max-w-2xl">
            Read-only feed of every audit event. Filters by action, email, or status. Drives SOC 2 evidence collection.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Total events</p>
          <p className="text-2xl font-extrabold text-white">{total.toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={applyFilters} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              Action contains
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
              <Input
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="auth.login"
                className="h-9 pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
              User email contains
            </label>
            <Input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="user@clinic.com"
              className="h-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 w-full rounded-md bg-white/[0.03] border border-white/10 text-white text-xs px-3"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" className="h-9 flex-1 bg-[#55E039]/10 border border-[#55E039]/20 text-[#55E039] hover:bg-[#55E039]/15 text-xs font-semibold">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Apply
            </Button>
            {hasFilters && (
              <Button
                type="button"
                onClick={clearFilters}
                className="h-9 bg-white/[0.04] border border-white/10 text-white/60 hover:text-white text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
        {isLoading && !data ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            Failed to load audit log. Refresh to retry.
          </div>
        ) : events.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ScrollText className="h-8 w-8 text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/50">
              {hasFilters ? "No events match these filters." : "No events yet."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {events.map((event) => {
              const tone = event.status ? STATUS_TONE[event.status] : null
              const Icon = tone?.icon
              const isOpen = expanded === event.id
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : event.id)}
                    className="w-full flex items-start gap-3 px-5 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    {tone && Icon ? (
                      <div className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border ${tone.bg} ${tone.text}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border bg-white/[0.04] border-white/10 text-white/40">
                        <ScrollText className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span className="text-sm font-mono text-white">{event.action}</span>
                          {event.status && (
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${tone?.bg} ${tone?.text}`}>
                              {event.status}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-white/40 font-mono shrink-0">{formatTime(event.created_at)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-white/55">
                        {event.user_email ?? <span className="text-white/30">no user</span>}
                        {event.ip_address ? ` - ${event.ip_address}` : ""}
                        {event.resource_type ? ` - ${event.resource_type}` : ""}
                      </p>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-white/30 mt-1" /> : <ChevronDown className="h-4 w-4 text-white/30 mt-1" />}
                  </button>
                  {isOpen && (
                    <div className="bg-black/20 border-t border-white/[0.06] px-5 py-4 space-y-2 text-xs">
                      <Field label="ID" value={event.id} mono />
                      {event.user_id && <Field label="User ID" value={event.user_id} mono />}
                      {event.resource_id && <Field label="Resource ID" value={event.resource_id} mono />}
                      {event.user_agent && (
                        <Field label="User agent" value={event.user_agent.length > 120 ? event.user_agent.slice(0, 120) + "..." : event.user_agent} />
                      )}
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Details</p>
                          <pre className="text-[11px] text-white/70 bg-black/30 border border-white/[0.06] rounded-lg p-3 overflow-x-auto">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3 px-1">
          <p className="text-xs text-white/50">
            Page {data?.page ?? 1} of {totalPages} - {total.toLocaleString()} events
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 px-3 bg-white/[0.04] border border-white/10 text-white/70 hover:text-white text-xs disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Prev
            </Button>
            <Button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 px-3 bg-white/[0.04] border border-white/10 text-white/70 hover:text-white text-xs disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{label}</span>
      <span className={`text-white/70 break-all ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
    </div>
  )
}
