"use client"

import { useState } from "react"
import useSWR from "swr"
import { BookOpen, Search, ArrowRight, LayoutGrid, Table as TableIcon, X, ExternalLink, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ComplianceRule } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const RISK_STYLES = {
  high: {
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-500",
  },
  medium: {
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-500",
  },
  low: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
  },
}

export default function LibraryPage() {
  const [search, setSearch] = useState("")
  const [riskLevel, setRiskLevel] = useState("all")
  const [category, setCategory] = useState("all")
  const [treatment, setTreatment] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("library-disclaimer-dismissed") === "true"
    return false
  })

  const params = new URLSearchParams()
  if (riskLevel !== "all") params.set("risk_level", riskLevel)
  if (category !== "all") params.set("category", category)
  if (treatment !== "all") params.set("treatment", treatment)
  if (search) params.set("search", search)

  const { data, isLoading } = useSWR(`/api/library?${params}`, fetcher)
  const rules: ComplianceRule[] = data?.rules || []

  function dismissDisclaimer() {
    setDismissed(true)
    localStorage.setItem("library-disclaimer-dismissed", "true")
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">Reference</p>
        <h2 className="text-2xl font-bold text-white">Compliance Library</h2>
        <p className="text-white/60 mt-1">
          Live database of FDA/FTC-flagged phrases. Updated automatically.
        </p>
        {rules.length > 0 && (
          <p className="text-xs text-white/30 mt-2 font-medium">{rules.length} rules tracked</p>
        )}
      </div>

      {/* Disclaimer */}
      {!dismissed && (
        <div className="relative rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-4 flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-500 mb-0.5">Educational Reference Only</p>
            <p className="text-sm text-white/50 leading-relaxed">
              Always have final content reviewed by a qualified healthcare marketing attorney.
              This library does not constitute legal advice.
            </p>
          </div>
          <button
            onClick={dismissDisclaimer}
            className="shrink-0 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors self-start"
          >
            <X className="h-4 w-4 text-white/30" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Search phrases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.03] border-white/10 text-white/80 placeholder:text-white/30 focus-visible:border-[#55E039]/30 focus-visible:ring-[#55E039]/10"
          />
        </div>
        <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v ?? "all")}>
          <SelectTrigger className="w-[130px] bg-white/[0.03] border-white/10 text-white/70">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
          <SelectTrigger className="w-[150px] bg-white/[0.03] border-white/10 text-white/70">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="health_claims">Health Claims</SelectItem>
            <SelectItem value="fda_approval">FDA Approval</SelectItem>
            <SelectItem value="efficacy">Efficacy</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
          </SelectContent>
        </Select>
        <Select value={treatment} onValueChange={(v) => setTreatment(v ?? "all")}>
          <SelectTrigger className="w-[150px] bg-white/[0.03] border-white/10 text-white/70">
            <SelectValue placeholder="Treatment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Treatments</SelectItem>
            <SelectItem value="prp">PRP</SelectItem>
            <SelectItem value="stem_cell">Stem Cell</SelectItem>
            <SelectItem value="exosomes">Exosomes</SelectItem>
            <SelectItem value="bmac">BMAC</SelectItem>
            <SelectItem value="whartons_jelly">Wharton&apos;s Jelly</SelectItem>
            <SelectItem value="prolotherapy">Prolotherapy</SelectItem>
            <SelectItem value="peptide">Peptide</SelectItem>
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-[#55E039]/10 text-[#55E039]"
                : "bg-white/[0.02] text-white/30 hover:text-white/50"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 border-l border-white/10 transition-all duration-200 ${
              viewMode === "table"
                ? "bg-[#55E039]/10 text-[#55E039]"
                : "bg-white/[0.02] text-white/30 hover:text-white/50"
            }`}
          >
            <TableIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] h-48 animate-pulse" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-5">
            <BookOpen className="h-8 w-8 text-white/20" />
          </div>
          <p className="text-white/50 font-medium mb-1">No rules match your filters</p>
          <p className="text-white/30 text-sm">Try adjusting your search or filter criteria.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => {
            const riskStyle = RISK_STYLES[rule.risk_level as keyof typeof RISK_STYLES] || RISK_STYLES.low
            return (
              <div
                key={rule.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 overflow-hidden group"
              >
                {/* Risk strip at top */}
                <div className={`h-0.5 ${riskStyle.dot}`} />

                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-white/[0.04] text-white/40">
                      {rule.category.replace("_", " ")}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskStyle.badge}`}>
                      {rule.risk_level}
                    </span>
                  </div>

                  {/* Banned -> Alternative */}
                  <div className="space-y-2">
                    <div className="rounded-lg bg-red-500/[0.06] border border-red-500/10 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/60 mb-1">Banned</p>
                      <p className="text-sm font-medium text-red-400">{rule.banned_phrase}</p>
                    </div>
                    <div className="flex justify-center">
                      <ArrowRight className="h-3.5 w-3.5 text-white/15 rotate-90" />
                    </div>
                    <div className="rounded-lg bg-[#55E039]/[0.04] border border-[#55E039]/10 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#55E039]/60 mb-1">Use Instead</p>
                      <p className="text-sm text-[#55E039]">{rule.compliant_alternative}</p>
                    </div>
                  </div>

                  {/* Applies to */}
                  <div className="flex flex-wrap gap-1">
                    {rule.applies_to.slice(0, 3).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/[0.06] bg-white/[0.02] text-white/30">
                        {t.replace("_", " ")}
                      </span>
                    ))}
                    {rule.applies_to.length > 3 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/[0.06] bg-white/[0.02] text-white/30">
                        +{rule.applies_to.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Source */}
                  {rule.source_url && (
                    <div className="pt-2 border-t border-white/[0.04]">
                      <a
                        href={rule.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-white/30 hover:text-[#55E039] transition-colors duration-200"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {rule.source_name || "Source"}
                        {rule.source_date && ` · ${new Date(rule.source_date).toLocaleDateString()}`}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30 w-[80px]">Risk</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30">Banned Phrase</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30">Compliant Alternative</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30 w-[120px]">Category</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30 w-[100px]">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => {
                const riskStyle = RISK_STYLES[rule.risk_level as keyof typeof RISK_STYLES] || RISK_STYLES.low
                return (
                  <TableRow
                    key={rule.id}
                    className="border-white/[0.04] hover:bg-white/[0.04] transition-colors duration-200"
                  >
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskStyle.badge}`}>
                        {rule.risk_level}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-red-400">{rule.banned_phrase}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-[#55E039]">{rule.compliant_alternative}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-white/40 capitalize">{rule.category.replace("_", " ")}</span>
                    </TableCell>
                    <TableCell>
                      {rule.source_url ? (
                        <a
                          href={rule.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-[#55E039] transition-colors duration-200"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {rule.source_name || "Link"}
                        </a>
                      ) : (
                        <span className="text-xs text-white/20">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
