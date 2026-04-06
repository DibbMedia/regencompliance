"use client"

import { useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

interface ComplianceRule {
  id: string
  banned_phrase: string
  compliant_alternative: string
  risk_level: "high" | "medium" | "low"
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminRulesPage() {
  const [rules, setRules] = useState<ComplianceRule[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchRules = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "50" })
    if (search) params.set("search", search)

    const res = await fetch(`/api/admin/rules?${params}`)
    if (res.ok) {
      const data = await res.json()
      setRules(data.rules)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    }
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchRules()
  }

  async function toggleRule(id: string, currentActive: boolean) {
    setToggling(id)
    const res = await fetch("/api/admin/rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !currentActive }),
    })
    if (res.ok) {
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: !currentActive } : r))
      )
    }
    setToggling(null)
  }

  const riskColors: Record<string, string> = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-blue-500/20 text-blue-400",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compliance Rules</h1>
        <span className="text-sm text-muted-foreground">{total} rules</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search phrases or alternatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.03] border-white/10"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Search
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Banned Phrase</th>
              <th className="px-4 py-3 font-medium">Alternative</th>
              <th className="px-4 py-3 font-medium">Risk</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
                  </td>
                </tr>
              ))
            ) : rules.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No rules found.
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr
                  key={rule.id}
                  className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] ${
                    !rule.is_active ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium">
                    {rule.banned_phrase}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                    {rule.compliant_alternative}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        riskColors[rule.risk_level] || riskColors.low
                      }`}
                    >
                      {rule.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {rule.category}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRule(rule.id, rule.is_active)}
                      disabled={toggling === rule.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        rule.is_active ? "bg-primary" : "bg-white/10"
                      } ${toggling === rule.id ? "opacity-50" : ""}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.is_active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
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
