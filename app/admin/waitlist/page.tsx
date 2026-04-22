"use client"

import useSWR, { mutate } from "swr"
import { useState } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Trash2, Mail, Loader2, ListChecks, Send } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface WaitlistEntry {
  id: string
  name: string
  email: string
  source: string | null
  created_at: string
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function AdminWaitlistPage() {
  const [search, setSearch] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [sendingLaunch, setSendingLaunch] = useState(false)

  const params = new URLSearchParams({ page: String(page), limit: "20" })
  if (searchQuery) params.set("search", searchQuery)
  const key = `/api/admin/waitlist?${params}`

  const { data, isLoading } = useSWR(key, fetcher, { refreshInterval: 30000 })
  const entries: WaitlistEntry[] = data?.entries || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearchQuery(search.trim())
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Remove ${email} from the waitlist?`)) return
    setDeleting(id)
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to remove entry")
        return
      }
      toast.success("Removed from waitlist")
      mutate(key)
    } catch {
      toast.error("Network error")
    } finally {
      setDeleting(null)
    }
  }

  function handleExport() {
    window.location.href = "/api/admin/waitlist/export"
  }

  async function handleSendLaunch() {
    if (
      !confirm(
        "Send the launch announcement email to every waitlist signup that hasn't been emailed yet? This cannot be undone."
      )
    )
      return
    setSendingLaunch(true)
    try {
      const res = await fetch("/api/admin/waitlist/send-launch", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to send launch emails")
        return
      }
      const { total, sent, failed } = data
      if (failed > 0) {
        toast.warning(`Sent ${sent} of ${total}. ${failed} failed - check server logs.`)
      } else if (sent === 0) {
        toast.info("No pending waitlist signups to email.")
      } else {
        toast.success(`Launch email sent to ${sent} waitlist signups.`)
      }
      mutate(key)
    } catch {
      toast.error("Network error")
    } finally {
      setSendingLaunch(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Waitlist</h1>
          <p className="text-sm text-white/65 mt-1">
            Pre-release signups awaiting an invite
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-[#55E039]/10 border border-[#55E039]/20 px-3 py-1">
            <ListChecks className="h-3 w-3 text-[#55E039]" />
            <span className="text-xs font-medium text-[#55E039]">{total} signups</span>
          </div>
          <Button
            onClick={handleExport}
            size="sm"
            className="bg-[#55E039]/10 border border-[#55E039]/20 text-[#55E039] hover:bg-[#55E039]/15"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button
            onClick={handleSendLaunch}
            disabled={sendingLaunch}
            size="sm"
            className="bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] hover:brightness-110 disabled:opacity-60"
          >
            {sendingLaunch ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Send Launch Email
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Search by name or email..."
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

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/65">Name</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/65">Email</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/65">Source</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/65">Joined</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/65 w-8" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
                  </td>
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/70">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-white/35" />
                  No waitlist signups yet.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">{entry.name}</td>
                  <td className="px-4 py-3 text-white/70">
                    <a
                      href={`mailto:${entry.email}`}
                      className="hover:text-[#55E039] transition-colors"
                    >
                      {entry.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-white/65 text-xs">
                    {entry.source || "-"}
                  </td>
                  <td className="px-4 py-3 text-white/65 text-xs">
                    {formatDate(entry.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(entry.id, entry.email)}
                      disabled={deleting === entry.id}
                      aria-label={`Remove ${entry.email}`}
                      className="text-white/55 hover:text-red-400 transition-colors disabled:opacity-30 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                    >
                      {deleting === entry.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/65">
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
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-white/10 text-white/70 hover:bg-white/[0.05]"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
