"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import useSWR, { mutate } from "swr"
import {
  ArrowLeft,
  Globe,
  RefreshCw,
  Loader2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  FileSearch,
  ArrowUpDown,
  Filter,
  Download,
} from "lucide-react"
import { toast } from "sonner"
import { ScoreExplainer } from "@/components/score-explainer"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface SitePage {
  id: string
  site_id: string
  url: string
  title: string | null
  compliance_score: number | null
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  last_scanned_at: string | null
  last_scan_id: string | null
  status: string
}

interface SiteData {
  id: string
  domain: string
  name: string | null
  is_active: boolean
  avg_compliance_score: number | null
  total_pages: number
  last_crawl_at: string | null
  pages: SitePage[]
}

// API returns { site, pages } - we merge them
interface SiteApiResponse {
  site: Omit<SiteData, "pages">
  pages: SitePage[]
}

function ScoreRing({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" className="stroke-white/[0.06]" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-bold text-white/55">--</span>
          <span className="text-[9px] font-medium text-white/50 uppercase tracking-widest">No Data</span>
        </div>
      </div>
    )
  }

  const color = score >= 80 ? "#55E039" : score >= 50 ? "#eab308" : "#ef4444"
  const textColor = score >= 80 ? "text-[#55E039]" : score >= 50 ? "text-yellow-500" : "text-red-500"
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20"
        style={{ background: color }}
      />
      <svg className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 -rotate-90 relative z-10" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" className="stroke-white/[0.06]" />
        <circle
          cx="50" cy="50" r="45" fill="none" strokeWidth="7" strokeLinecap="round"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute z-10 flex flex-col items-center">
        <span className={`text-2xl sm:text-3xl font-bold ${textColor}`}>{score}</span>
        <span className="text-[9px] font-medium text-white/40 uppercase tracking-widest">Score</span>
      </div>
    </div>
  )
}

function PageScoreText({ score }: { score: number | null }) {
  if (score === null) return <span className="text-white/30 text-sm font-medium">--</span>
  const color = score >= 80 ? "text-[#55E039]" : score >= 50 ? "text-yellow-500" : "text-red-500"
  return <span className={`text-sm font-bold ${color}`}>{score}</span>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

type SortKey = "score" | "recent" | "alpha"
type FilterKey = "all" | "flagged" | "clean"

export default function SiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>("score")
  const [filterBy, setFilterBy] = useState<FilterKey>("all")

  const { data: apiData, isLoading } = useSWR<SiteApiResponse>(`/api/sites/${id}`, fetcher)
  const site = apiData ? { ...apiData.site, pages: apiData.pages } : null

  async function handleScanAll() {
    setScanning(true)
    toast.info("Scanning all pages... This may take a few minutes.", { duration: 15000 })
    try {
      const res = await fetch(`/api/sites/${id}/scan`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Scan failed.")
        return
      }
      const data = await res.json()
      const pagesScanned = data.summary?.pages_scanned || 0
      toast.success(`Scan complete! ${pagesScanned} pages scanned.`)
      mutate(`/api/sites/${id}`)
    } catch {
      toast.error("Network error.")
    } finally {
      setScanning(false)
    }
  }

  async function handleRemoveSite() {
    setRemoving(true)
    try {
      const res = await fetch(`/api/sites/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Failed to remove site.")
        return
      }
      toast.success("Site removed.")
      router.push("/dashboard/sites")
    } catch {
      toast.error("Network error.")
    } finally {
      setRemoving(false)
      setShowRemoveConfirm(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-4xl">
        <div className="h-8 w-24 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="h-48 w-full rounded-xl bg-white/[0.03] animate-pulse" />
        <div className="h-32 w-full rounded-xl bg-white/[0.03] animate-pulse" />
      </div>
    )
  }

  if (!site) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-5">
          <AlertTriangle className="h-8 w-8 text-white/35" />
        </div>
        <p className="text-white/80 font-medium">Site not found</p>
        <p className="text-white/60 text-sm mt-1">This site may have been removed.</p>
        <Link
          href="/dashboard/sites"
          className="mt-4 inline-flex items-center gap-2 text-sm text-[#55E039] hover:text-[#55E039]/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sites
        </Link>
      </div>
    )
  }

  const pages = site.pages || []

  // Compute stats
  const totalPages = pages.length
  const pagesWithScores = pages.filter((p) => p.compliance_score !== null)
  const avgScore = pagesWithScores.length > 0
    ? Math.round(pagesWithScores.reduce((sum, p) => sum + (p.compliance_score || 0), 0) / pagesWithScores.length)
    : null
  const issuePages = pagesWithScores.filter((p) => (p.compliance_score || 0) < 80).length
  const cleanPages = pagesWithScores.filter((p) => (p.compliance_score || 0) >= 80).length

  // Filter
  let filteredPages = [...pages]
  if (filterBy === "flagged") {
    filteredPages = filteredPages.filter((p) => p.compliance_score !== null && p.compliance_score < 80)
  } else if (filterBy === "clean") {
    filteredPages = filteredPages.filter((p) => p.compliance_score !== null && p.compliance_score >= 80)
  }

  // Sort
  filteredPages.sort((a, b) => {
    if (sortBy === "score") {
      const scoreA = a.compliance_score ?? 999
      const scoreB = b.compliance_score ?? 999
      return scoreA - scoreB
    }
    if (sortBy === "recent") {
      const dateA = a.last_scanned_at ? new Date(a.last_scanned_at).getTime() : 0
      const dateB = b.last_scanned_at ? new Date(b.last_scanned_at).getTime() : 0
      return dateB - dateA
    }
    // alpha
    const nameA = (a.title || a.url).toLowerCase()
    const nameB = (b.title || b.url).toLowerCase()
    return nameA.localeCompare(nameB)
  })

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Back Navigation */}
      <Link
        href="/dashboard/sites"
        className="inline-flex items-center gap-1.5 text-sm text-white/65 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sites
      </Link>

      {/* Header Card */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-center gap-1">
            <ScoreRing score={site.avg_compliance_score} />
            {site.avg_compliance_score !== null && (
              <ScoreExplainer score={site.avg_compliance_score} />
            )}
          </div>
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <h2 className="text-xl font-bold text-white mb-1">
              {site.name || site.domain}
            </h2>
            <a
              href={`https://${site.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-white/65 hover:text-[#55E039] transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              {site.domain}
              <ExternalLink className="h-3 w-3" />
            </a>
            {site.last_crawl_at && (
              <p className="text-xs text-white/60 mt-2">
                Last scanned {timeAgo(site.last_crawl_at)} &middot; {formatDate(site.last_crawl_at)}
              </p>
            )}
            <p className="text-xs text-white/55 italic mt-2">
              Automated compliance monitoring is educational guidance only, not a substitute for legal review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleScanAll}
              disabled={scanning}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] text-sm font-bold shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300 disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Scan All Pages
                </>
              )}
            </button>
            <a
              href={`/api/sites/${id}/export`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] text-sm font-medium hover:bg-[#55E039]/[0.08] hover:border-[#55E039]/30 transition-all duration-300"
            >
              <Download className="h-4 w-4" />
              Export Site Report
            </a>
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/[0.04] text-red-400 text-sm font-medium hover:bg-red-500/[0.08] hover:border-red-500/30 transition-all duration-300"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 space-y-4 mx-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Remove Site?</h3>
                <p className="text-sm text-white/65">This will delete all scan history for this site.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveSite}
                disabled={removing}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {removing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Remove Site
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10">
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Total Pages</span>
          </div>
          <p className="text-xl font-bold text-white">{totalPages}</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              avgScore !== null && avgScore >= 80 ? "bg-[#55E039]/10" : avgScore !== null && avgScore >= 50 ? "bg-yellow-400/10" : "bg-white/[0.06]"
            }`}>
              <FileSearch className={`h-4 w-4 ${
                avgScore !== null && avgScore >= 80 ? "text-[#55E039]" : avgScore !== null && avgScore >= 50 ? "text-yellow-400" : "text-white/40"
              }`} />
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Avg Score</span>
          </div>
          <p className="text-xl font-bold text-white">{avgScore !== null ? avgScore : "--"}</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-400/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">With Issues</span>
          </div>
          <p className="text-xl font-bold text-white">{issuePages}</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#55E039]/10">
              <CheckCircle2 className="h-4 w-4 text-[#55E039]" />
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Clean</span>
          </div>
          <p className="text-xl font-bold text-white">{cleanPages}</p>
        </div>
      </div>

      {/* Sort and Filter */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center rounded-xl border border-white/10 bg-white/[0.03] p-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-white/55" />
          <span className="text-xs text-white/60">Sort:</span>
          {(["score", "recent", "alpha"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/50 ${
                sortBy === key
                  ? "bg-[#55E039]/10 text-[#55E039] border border-[#55E039]/20"
                  : "bg-white/[0.02] border border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {key === "score" ? "Score" : key === "recent" ? "Recent" : "A-Z"}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-white/[0.06]" />
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/55" />
          <span className="text-xs text-white/60">Filter:</span>
          {(["all", "flagged", "clean"] as FilterKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setFilterBy(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55E039]/50 ${
                filterBy === key
                  ? "bg-[#55E039]/10 text-[#55E039] border border-[#55E039]/20"
                  : "bg-white/[0.02] border border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {key === "all" ? "All" : key === "flagged" ? "Flagged" : "Clean"}
            </button>
          ))}
        </div>
      </div>

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <FileSearch className="h-7 w-7 text-white/35" />
          </div>
          <p className="text-white/80 font-medium mb-1">
            {pages.length === 0 ? "No pages scanned yet" : "No pages match this filter"}
          </p>
          <p className="text-white/60 text-sm">
            {pages.length === 0
              ? "Click \"Scan All Pages\" to start scanning this site."
              : "Try adjusting your filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPages.map((page) => {
            const pageUrl = page.url
            const truncatedUrl = pageUrl.length > 60 ? pageUrl.slice(0, 57) + "..." : pageUrl

            return (
              <div
                key={page.id}
                className="group rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300"
              >
                {page.last_scan_id ? (
                  <Link href={`/dashboard/history/${page.last_scan_id}`} className="block p-4">
                    <PageRow page={page} truncatedUrl={truncatedUrl} />
                  </Link>
                ) : (
                  <div className="p-4">
                    <PageRow page={page} truncatedUrl={truncatedUrl} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PageRow({ page, truncatedUrl }: { page: SitePage; truncatedUrl: string }) {
  return (
    <div className="flex items-center gap-4">
      {/* Score */}
      <div className="shrink-0 w-10 text-center">
        <PageScoreText score={page.compliance_score} />
      </div>

      {/* Separator */}
      <div className="w-px h-10 bg-white/[0.06] shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {page.title && (
          <p className="text-sm font-medium text-white truncate mb-0.5">{page.title}</p>
        )}
        <p className="text-xs text-white/65 truncate" title={page.url}>
          {truncatedUrl}
        </p>
      </div>

      {/* Flag counts */}
      <div className="flex gap-2 shrink-0 items-center">
        {page.high_risk_count > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {page.high_risk_count}
          </span>
        )}
        {page.medium_risk_count > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            {page.medium_risk_count}
          </span>
        )}
        {page.low_risk_count > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {page.low_risk_count}
          </span>
        )}
      </div>

      {/* Date */}
      <div className="shrink-0 text-right hidden sm:block">
        {page.last_scanned_at ? (
          <p className="text-xs text-white/55">{timeAgo(page.last_scanned_at)}</p>
        ) : (
          <p className="text-xs text-white/45">Not scanned</p>
        )}
      </div>

      {/* Status indicator */}
      {page.last_scan_id && (
        <div className="shrink-0">
          <span className="p-2 rounded-lg text-white/45 group-hover:text-[#55E039] group-hover:bg-[#55E039]/[0.06] transition-all duration-300 inline-flex">
            <ExternalLink className="h-4 w-4" />
          </span>
        </div>
      )}
    </div>
  )
}
