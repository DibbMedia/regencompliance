"use client"

import { useEffect, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  BookOpen,
  CheckSquare,
  XSquare,
} from "lucide-react"

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

const RISK_OPTIONS = [
  { value: "", label: "All Risk Levels" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

const ACTIVE_OPTIONS = [
  { value: "", label: "All States" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
]

export default function AdminRulesPage() {
  const [rules, setRules] = useState<ComplianceRule[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [riskFilter, setRiskFilter] = useState("")
  const [activeFilter, setActiveFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [toggling, setToggling] = useState<string | null>(null)
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set())
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  const fetchRules = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "50" })
    if (search) params.set("search", search)
    if (categoryFilter) params.set("category", categoryFilter)

    const res = await fetch(`/api/admin/rules?${params}`)
    if (res.ok) {
      const data = await res.json()
      setRules(data.rules)
      setTotalPages(data.totalPages)
      setTotal(data.total)

      // Extract unique categories
      const cats = new Set<string>()
      for (const rule of data.rules) {
        if (rule.category) cats.add(rule.category)
      }
      setCategories(Array.from(cats).sort())
    }
    setLoading(false)
  }, [page, search, categoryFilter])

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

  function toggleSelectRule(id: string) {
    setSelectedRules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedRules.size === filteredRules.length) {
      setSelectedRules(new Set())
    } else {
      setSelectedRules(new Set(filteredRules.map((r) => r.id)))
    }
  }

  async function bulkToggle(activate: boolean) {
    setBulkProcessing(true)
    const promises = Array.from(selectedRules).map((id) =>
      fetch("/api/admin/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: activate }),
      })
    )
    await Promise.all(promises)
    setRules((prev) =>
      prev.map((r) =>
        selectedRules.has(r.id) ? { ...r, is_active: activate } : r
      )
    )
    setSelectedRules(new Set())
    setBulkProcessing(false)
  }

  // Client-side filtering for risk level and active state
  let filteredRules = rules
  if (riskFilter) {
    filteredRules = filteredRules.filter((r) => r.risk_level === riskFilter)
  }
  if (activeFilter) {
    const isActive = activeFilter === "true"
    filteredRules = filteredRules.filter((r) => r.is_active === isActive)
  }

  const riskColors: Record<string, string> = {
    high: "bg-red-500/10 text-red-400 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance Rules</h1>
          <p className="text-sm text-white/40 mt-1">
            Manage banned phrases and compliant alternatives
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-[#55E039]/10 border border-[#55E039]/20 px-3 py-1">
            <BookOpen className="h-3 w-3 text-[#55E039]" />
            <span className="text-xs font-medium text-[#55E039]">
              {total} rules
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#55E039] text-black hover:bg-[#55E039]/90 font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Add Rule Form */}
      {showAddForm && (
        <AddRuleForm
          onClose={() => setShowAddForm(false)}
          onAdded={() => {
            setShowAddForm(false)
            fetchRules()
          }}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form
          onSubmit={handleSearch}
          className="flex gap-2 flex-1 min-w-[280px] max-w-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Search phrases or alternatives..."
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
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
        >
          {RISK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
              {opt.label}
            </option>
          ))}
        </select>

        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
          >
            <option value="" className="bg-[#0a0a0a]">
              All Categories
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#0a0a0a]">
                {cat}
              </option>
            ))}
          </select>
        )}

        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
        >
          {ACTIVE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selectedRules.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#55E039]/20 bg-[#55E039]/5 px-4 py-3">
          <span className="text-sm text-white/70">
            {selectedRules.size} rule{selectedRules.size !== 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkToggle(true)}
              disabled={bulkProcessing}
              className="border-[#55E039]/30 text-[#55E039] hover:bg-[#55E039]/10"
            >
              <CheckSquare className="h-3.5 w-3.5 mr-1" />
              Activate All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkToggle(false)}
              disabled={bulkProcessing}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <XSquare className="h-3.5 w-3.5 mr-1" />
              Deactivate All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedRules(new Set())}
              className="border-white/10 text-white/50 hover:bg-white/[0.05]"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 w-8">
                <button
                  onClick={toggleSelectAll}
                  className={`h-4 w-4 rounded border transition-colors ${
                    selectedRules.size === filteredRules.length &&
                    filteredRules.length > 0
                      ? "bg-[#55E039] border-[#55E039]"
                      : "border-white/20 hover:border-white/40"
                  }`}
                />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Banned Phrase
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Alternative
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Risk
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Category
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Active
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
                  </td>
                </tr>
              ))
            ) : filteredRules.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-white/40"
                >
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  No rules found.
                </td>
              </tr>
            ) : (
              filteredRules.map((rule) => (
                <tr
                  key={rule.id}
                  className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${
                    !rule.is_active ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelectRule(rule.id)}
                      className={`h-4 w-4 rounded border transition-colors ${
                        selectedRules.has(rule.id)
                          ? "bg-[#55E039] border-[#55E039]"
                          : "border-white/20 hover:border-white/40"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-white/80">
                    {rule.banned_phrase}
                  </td>
                  <td className="px-4 py-3 text-white/50 max-w-xs truncate">
                    {rule.compliant_alternative}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${
                        riskColors[rule.risk_level] || riskColors.low
                      }`}
                    >
                      {rule.risk_level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {rule.category}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRule(rule.id, rule.is_active)}
                      disabled={toggling === rule.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        rule.is_active
                          ? "bg-[#55E039]"
                          : "bg-white/10"
                      } ${toggling === rule.id ? "opacity-50" : ""}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
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

/* ─── Add Rule Form ──────────────────────── */

function AddRuleForm({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: () => void
}) {
  const [phrase, setPhrase] = useState("")
  const [alternative, setAlternative] = useState("")
  const [riskLevel, setRiskLevel] = useState("medium")
  const [category, setCategory] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phrase.trim() || !alternative.trim()) {
      setError("Both phrase and alternative are required")
      return
    }
    setSaving(true)
    setError("")

    const res = await fetch("/api/admin/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        banned_phrase: phrase.trim(),
        compliant_alternative: alternative.trim(),
        risk_level: riskLevel,
        category: category.trim() || "general",
      }),
    })

    if (res.ok) {
      onAdded()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "Failed to add rule")
    }
    setSaving(false)
  }

  return (
    <div className="rounded-xl border border-[#55E039]/20 bg-[#55E039]/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">
          Add New Rule
        </p>
        <button onClick={onClose} className="text-white/40 hover:text-white/70">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-white/50 mb-1 block">
            Banned Phrase
          </label>
          <Input
            placeholder="e.g., cure, guaranteed results"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">
            Compliant Alternative
          </label>
          <Input
            placeholder="e.g., may help improve, potential benefits"
            value={alternative}
            onChange={(e) => setAlternative(e.target.value)}
            className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">
            Risk Level
          </label>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
          >
            <option value="high" className="bg-[#0a0a0a]">
              High
            </option>
            <option value="medium" className="bg-[#0a0a0a]">
              Medium
            </option>
            <option value="low" className="bg-[#0a0a0a]">
              Low
            </option>
          </select>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Category</label>
          <Input
            placeholder="e.g., fda_claims, testimonials"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30"
          />
        </div>

        {error && (
          <div className="sm:col-span-2 text-sm text-red-400">{error}</div>
        )}

        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-white/10 text-white/50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="bg-[#55E039] text-black hover:bg-[#55E039]/90 font-medium"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add Rule
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
