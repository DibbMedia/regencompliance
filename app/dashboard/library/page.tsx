"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import {
  BookOpen,
  Search,
  X,
  ExternalLink,
  AlertTriangle,
  ArrowUpRight,
  Building2,
} from "lucide-react"
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
import type { EnforcementActionWithRules } from "@/lib/types"
import { HelpTooltip } from "@/components/ui/help-tooltip"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const AGENCY_STYLES: Record<string, { badge: string; dot: string }> = {
  FDA: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
  },
  FTC: {
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    dot: "bg-purple-500",
  },
  DOJ: {
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  fda_warning: "FDA Warning Letter",
  fda_483: "FDA 483",
  fda_cber: "FDA CBER",
  ftc_press: "FTC Press Release",
  ftc_guidance: "FTC Guidance",
  doj_fraud: "DOJ Fraud",
  manual: "Manual Entry",
}

const CATEGORY_LABELS: Record<string, string> = {
  health_claims: "Health Claims",
  fda_approval: "FDA Approval",
  efficacy: "Efficacy",
  safety: "Safety",
}

function formatDate(date: string | null): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function LibraryPage() {
  const [search, setSearch] = useState("")
  const [riskLevel, setRiskLevel] = useState("all")
  const [category, setCategory] = useState("all")
  const [treatment, setTreatment] = useState("all")
  const [sourceType, setSourceType] = useState("all")
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("library-disclaimer-dismissed") === "true"
    return false
  })

  const params = new URLSearchParams()
  if (riskLevel !== "all") params.set("risk_level", riskLevel)
  if (category !== "all") params.set("category", category)
  if (treatment !== "all") params.set("treatment", treatment)
  if (sourceType !== "all") params.set("source_type", sourceType)
  if (search) params.set("search", search)

  const { data, isLoading } = useSWR(`/api/library?${params}`, fetcher)
  const actions: EnforcementActionWithRules[] = data?.actions || []

  function dismissDisclaimer() {
    setDismissed(true)
    localStorage.setItem("library-disclaimer-dismissed", "true")
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">Reference</p>
        <h1 className="text-3xl font-bold text-white inline-flex items-center gap-2">
          Enforcement Actions
          <HelpTooltip text="Browse FDA Warning Letters, FTC enforcement actions, and DOJ healthcare fraud announcements relevant to regenerative medicine. Each action lists the marketing claims that were cited as violations." />
        </h1>
        <p className="text-white/60 mt-1">
          Live feed of FDA / FTC / DOJ enforcement actions. Updated automatically.
        </p>
        {actions.length > 0 && (
          <p className="text-xs text-white/30 mt-2 font-medium">
            {actions.length} enforcement action{actions.length === 1 ? "" : "s"} tracked
          </p>
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
            className="shrink-0 p-2.5 sm:p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors self-start"
          >
            <X className="h-4 w-4 text-white/30" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-3 items-stretch md:items-center rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Search company, summary, or phrase..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.03] border-white/10 text-white/80 placeholder:text-white/30 focus-visible:border-[#55E039]/30 focus-visible:ring-[#55E039]/10"
          />
        </div>
        <Select value={sourceType} onValueChange={(v) => setSourceType(v ?? "all")}>
          <SelectTrigger className="w-[170px] bg-white/[0.03] border-white/10 text-white/70">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="fda_warning">FDA Warning Letters</SelectItem>
            <SelectItem value="fda_483">FDA 483</SelectItem>
            <SelectItem value="fda_cber">FDA CBER</SelectItem>
            <SelectItem value="ftc_press">FTC Press Releases</SelectItem>
            <SelectItem value="ftc_guidance">FTC Guidance</SelectItem>
            <SelectItem value="doj_fraud">DOJ Fraud</SelectItem>
          </SelectContent>
        </Select>
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
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.04]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse" />
          ))}
        </div>
      ) : actions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-5">
            <BookOpen className="h-8 w-8 text-white/20" />
          </div>
          <p className="text-white/50 font-medium mb-1">No enforcement actions match your filters</p>
          <p className="text-white/30 text-sm">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <>
        <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30 w-[90px]">Agency</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30 w-[110px]">Date</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30 min-w-[180px]">Company / Source</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30 min-w-[280px]">Summary</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30 min-w-[160px]">Violations</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30 w-[80px] text-center">Rules</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-white/30 w-[90px] text-right pr-4">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.map((action) => {
                  const agencyStyle =
                    (action.agency && AGENCY_STYLES[action.agency]) || {
                      badge: "bg-white/[0.04] text-white/40 border-white/10",
                      dot: "bg-white/20",
                    }
                  const sourceLabel = SOURCE_TYPE_LABELS[action.source_type] || action.source_name
                  const ruleCount = action.rule_count || action.compliance_rules?.length || 0
                  const categories = action.violation_categories?.length
                    ? action.violation_categories
                    : Array.from(new Set((action.compliance_rules ?? []).map((r) => r.category)))

                  return (
                    <TableRow
                      key={action.id}
                      className="border-white/[0.04] hover:bg-white/[0.04] transition-colors duration-200 cursor-pointer group"
                    >
                      <TableCell className="align-top py-4">
                        <Link href={`/dashboard/library/${action.id}`} className="block">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${agencyStyle.badge}`}>
                            {action.agency || "—"}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <Link
                          href={`/dashboard/library/${action.id}`}
                          className="block text-sm text-white/60 whitespace-nowrap"
                        >
                          {formatDate(action.source_date)}
                        </Link>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <Link href={`/dashboard/library/${action.id}`} className="block group/link">
                          <div className="flex items-start gap-2">
                            <Building2 className="h-3.5 w-3.5 text-white/20 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white/90 group-hover/link:text-[#55E039] transition-colors line-clamp-1">
                                {action.company_name || sourceLabel}
                              </p>
                              <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">
                                {action.product_or_treatment || sourceLabel}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <Link
                          href={`/dashboard/library/${action.id}`}
                          className="block text-sm text-white/60 leading-relaxed line-clamp-2"
                        >
                          {action.summary || (
                            <span className="text-white/40 italic">No summary available — open to view violations.</span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <Link href={`/dashboard/library/${action.id}`} className="flex flex-wrap gap-1">
                          {categories.slice(0, 3).map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/[0.06] bg-white/[0.02] text-white/40"
                            >
                              {CATEGORY_LABELS[c] || c.replace("_", " ")}
                            </span>
                          ))}
                          {categories.length > 3 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/[0.06] bg-white/[0.02] text-white/30">
                              +{categories.length - 3}
                            </span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="align-top py-4 text-center">
                        <Link href={`/dashboard/library/${action.id}`} className="block">
                          <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md text-xs font-semibold bg-[#55E039]/10 text-[#55E039] border border-[#55E039]/20">
                            {ruleCount}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="align-top py-4 text-right pr-4">
                        <a
                          href={action.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-[#55E039] transition-colors"
                          title="Open source document"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <Link
                          href={`/dashboard/library/${action.id}`}
                          className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-[#55E039] transition-colors ml-2"
                          title="Open detail"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile card stack */}
        <div className="md:hidden space-y-3">
          {actions.map((action) => {
            const agencyStyle =
              (action.agency && AGENCY_STYLES[action.agency]) || {
                badge: "bg-white/[0.04] text-white/40 border-white/10",
                dot: "bg-white/20",
              }
            const sourceLabel = SOURCE_TYPE_LABELS[action.source_type] || action.source_name
            const ruleCount = action.rule_count || action.compliance_rules?.length || 0
            const categories = action.violation_categories?.length
              ? action.violation_categories
              : Array.from(new Set((action.compliance_rules ?? []).map((r) => r.category)))

            return (
              <Link
                key={action.id}
                href={`/dashboard/library/${action.id}`}
                className="block rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${agencyStyle.badge}`}>
                    {action.agency || "—"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md text-xs font-semibold bg-[#55E039]/10 text-[#55E039] border border-[#55E039]/20">
                      {ruleCount}
                    </span>
                    <span className="text-[11px] text-white/40 whitespace-nowrap">
                      {formatDate(action.source_date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 mb-1.5">
                  <Building2 className="h-3.5 w-3.5 text-white/20 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white/90 line-clamp-1">
                      {action.company_name || sourceLabel}
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">
                      {action.product_or_treatment || sourceLabel}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed line-clamp-2 mb-2">
                  {action.summary || (
                    <span className="text-white/40 italic">No summary available — open to view violations.</span>
                  )}
                </p>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {categories.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/[0.06] bg-white/[0.02] text-white/40"
                      >
                        {CATEGORY_LABELS[c] || c.replace("_", " ")}
                      </span>
                    ))}
                    {categories.length > 3 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/[0.06] bg-white/[0.02] text-white/30">
                        +{categories.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
        </>
      )}
    </div>
  )
}
