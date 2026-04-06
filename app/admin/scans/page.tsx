"use client"

import { useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

interface AdminScan {
  id: string
  profile_id: string
  user_email: string
  content_type: string
  compliance_score: number | null
  flag_count: number
  created_at: string
}

export default function AdminScansPage() {
  const [scans, setScans] = useState<AdminScan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [contentType, setContentType] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchScans = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (search) params.set("search", search)
    if (contentType) params.set("content_type", contentType)

    const res = await fetch(`/api/admin/scans?${params}`)
    if (res.ok) {
      const data = await res.json()
      setScans(data.scans)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    }
    setLoading(false)
  }, [page, search, contentType])

  useEffect(() => {
    fetchScans()
  }, [fetchScans])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchScans()
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Scans</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 bg-white/[0.03] border-white/10"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
        <select
          value={contentType}
          onChange={(e) => {
            setContentType(e.target.value)
            setPage(1)
          }}
          className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-foreground"
        >
          {contentTypes.map((ct) => (
            <option key={ct.value} value={ct.value}>
              {ct.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Content Type</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Flags</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
                  </td>
                </tr>
              ))
            ) : scans.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No scans found.
                </td>
              </tr>
            ) : (
              scans.map((scan) => (
                <tr
                  key={scan.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(scan.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{scan.user_email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-white/[0.05] px-2 py-0.5 text-xs">
                      {scan.content_type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={scan.compliance_score} />
                  </td>
                  <td className="px-4 py-3">
                    {scan.flag_count > 0 ? (
                      <span className="text-red-400">{scan.flag_count}</span>
                    ) : (
                      <span className="text-green-400">0</span>
                    )}
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

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground">—</span>
  const color =
    score >= 80
      ? "text-green-400"
      : score >= 50
        ? "text-yellow-400"
        : "text-red-400"
  return <span className={`font-medium ${color}`}>{score}%</span>
}
