"use client"

import { useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ScanSearch,
  AlertTriangle,
} from "lucide-react"

interface AdminScan {
  id: string
  profile_id: string
  user_email: string
  content_type: string
  compliance_score: number | null
  flag_count: number
  created_at: string
  content_text?: string
  flags?: Array<{
    banned_phrase?: string
    reason?: string
    compliant_alternative?: string
    risk_level?: string
  }>
}

export default function AdminScansPage() {
  const [scans, setScans] = useState<AdminScan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [contentType, setContentType] = useState("")
  const [scoreRange, setScoreRange] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expandedScan, setExpandedScan] = useState<string | null>(null)

  const fetchScans = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (searchQuery) params.set("search", searchQuery)
    if (contentType) params.set("content_type", contentType)

    const res = await fetch(`/api/admin/scans?${params}`)
    if (res.ok) {
      const data = await res.json()
      setScans(data.scans)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    }
    setLoading(false)
  }, [page, searchQuery, contentType])

  useEffect(() => {
    fetchScans()
  }, [fetchScans])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearchQuery(search)
  }

  // Client-side score filtering
  let filteredScans = scans
  if (scoreRange) {
    const [min, max] = scoreRange.split("-").map(Number)
    filteredScans = filteredScans.filter((s) => {
      const score = s.compliance_score
      if (score === null) return scoreRange === "null"
      return score >= min && score <= max
    })
  }

  const contentTypes = [
    { value: "", label: "All Types" },
    { value: "website_copy", label: "Website Copy" },
    { value: "social_media", label: "Social Media" },
    { value: "email_marketing", label: "Email Marketing" },
    { value: "ad_copy", label: "Ad Copy" },
    { value: "blog_post", label: "Blog Post" },
    { value: "patient_communication", label: "Patient Communication" },
    { value: "other", label: "Other" },
  ]

  const scoreRanges = [
    { value: "", label: "All Scores" },
    { value: "80-100", label: "80-100 (Good)" },
    { value: "50-79", label: "50-79 (Warning)" },
    { value: "0-49", label: "0-49 (Critical)" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Scans</h1>
          <p className="text-sm text-white/40 mt-1">
            View and analyze all compliance scans
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[#55E039]/10 border border-[#55E039]/20 px-3 py-1">
          <ScanSearch className="h-3 w-3 text-[#55E039]" />
          <span className="text-xs font-medium text-[#55E039]">
            {total} total
          </span>
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
              placeholder="Search by user email..."
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
          value={contentType}
          onChange={(e) => {
            setContentType(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
        >
          {contentTypes.map((ct) => (
            <option key={ct.value} value={ct.value} className="bg-[#0a0a0a]">
              {ct.label}
            </option>
          ))}
        </select>

        <select
          value={scoreRange}
          onChange={(e) => setScoreRange(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
        >
          {scoreRanges.map((sr) => (
            <option key={sr.value} value={sr.value} className="bg-[#0a0a0a]">
              {sr.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-medium text-white/40 w-8" />
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Date
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                User
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Content Type
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Score
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Flags
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
                  </td>
                </tr>
              ))
            ) : filteredScans.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-white/40"
                >
                  <ScanSearch className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  No scans found.
                </td>
              </tr>
            ) : (
              filteredScans.map((scan) => (
                <ScanRow
                  key={scan.id}
                  scan={scan}
                  isExpanded={expandedScan === scan.id}
                  onToggle={() =>
                    setExpandedScan(
                      expandedScan === scan.id ? null : scan.id
                    )
                  }
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

/* ─── Scan Row ──────────────────────── */

function ScanRow({
  scan,
  isExpanded,
  onToggle,
}: {
  scan: AdminScan
  isExpanded: boolean
  onToggle: () => void
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
        <td className="px-4 py-3 text-white/50 text-xs">
          {formatDate(scan.created_at)}
        </td>
        <td className="px-4 py-3 text-white/80">{scan.user_email}</td>
        <td className="px-4 py-3">
          <span className="rounded-full bg-white/[0.05] border border-white/10 px-2.5 py-0.5 text-xs text-white/60 capitalize">
            {scan.content_type.replace(/_/g, " ")}
          </span>
        </td>
        <td className="px-4 py-3">
          <ScoreBadge score={scan.compliance_score} />
        </td>
        <td className="px-4 py-3">
          {scan.flag_count > 0 ? (
            <span className="inline-flex items-center gap-1 text-red-400">
              <AlertTriangle className="h-3 w-3" />
              {scan.flag_count}
            </span>
          ) : (
            <span className="text-[#55E039]">0</span>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-white/5">
          <td colSpan={6} className="px-4 py-0">
            <ScanDetail scanId={scan.id} />
          </td>
        </tr>
      )}
    </>
  )
}

/* ─── Scan Detail ──────────────────────── */

function ScanDetail({ scanId }: { scanId: string }) {
  const [detail, setDetail] = useState<AdminScan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/admin/scans/${scanId}`)
      if (res.ok) {
        const data = await res.json()
        setDetail(data.scan || data)
      }
      setLoading(false)
    }
    load()
  }, [scanId])

  if (loading) {
    return (
      <div className="py-4 text-sm text-white/40">Loading scan detail...</div>
    )
  }

  if (!detail) {
    return (
      <div className="py-4 text-sm text-white/40">
        Scan detail not available. The detail API may need to be created.
      </div>
    )
  }

  return (
    <div className="py-5 space-y-4">
      {/* Content preview */}
      {detail.content_text && (
        <div>
          <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.15em] mb-2">
            Content Preview
          </p>
          <div className="rounded-lg border border-white/10 bg-[#0a0a0a]/50 p-3 max-h-40 overflow-y-auto">
            <p className="text-xs text-white/60 whitespace-pre-wrap leading-relaxed">
              {detail.content_text.slice(0, 1000)}
              {detail.content_text.length > 1000 ? "..." : ""}
            </p>
          </div>
        </div>
      )}

      {/* Flags */}
      {detail.flags && detail.flags.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.15em] mb-2">
            Flagged Items ({detail.flags.length})
          </p>
          <div className="space-y-1.5">
            {detail.flags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-red-400">
                    {flag.banned_phrase || flag.reason || "Violation"}
                  </p>
                  {flag.compliant_alternative && (
                    <p className="text-xs text-[#55E039]/70 mt-0.5">
                      Suggested: {flag.compliant_alternative}
                    </p>
                  )}
                </div>
                {flag.risk_level && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      flag.risk_level === "high"
                        ? "bg-red-500/10 text-red-400"
                        : flag.risk_level === "medium"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {flag.risk_level}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Utility ──────────────────────── */

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-block rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-xs font-medium text-white/40">
        N/A
      </span>
    )
  }
  const color =
    score >= 80
      ? "bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20"
      : score >= 50
        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20"
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {score}%
    </span>
  )
}

function formatDate(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffHr < 1) return "just now"
  if (diffHr < 24)
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString()
}
