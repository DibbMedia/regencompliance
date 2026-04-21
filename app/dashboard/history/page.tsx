"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Clock, Search, RefreshCw, Eye, ChevronLeft, ChevronRight, Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Scan } from "@/lib/types"
import { HelpTooltip } from "@/components/ui/help-tooltip"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

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
    year: "numeric",
  })
}

function ScoreIndicator({ score }: { score: number | null }) {
  if (score === null) return <span className="text-white/30 text-sm">N/A</span>
  const color = score >= 80 ? "#55E039" : score >= 50 ? "#eab308" : "#ef4444"
  const textColor = score >= 80 ? "text-[#55E039]" : score >= 50 ? "text-yellow-500" : "text-red-500"
  const bgColor = score >= 80 ? "bg-[#55E039]/10" : score >= 50 ? "bg-yellow-500/10" : "bg-red-500/10"
  const circumference = 2 * Math.PI * 12
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="12" fill="none" strokeWidth="2.5" className="stroke-white/[0.06]" />
          <circle
            cx="14" cy="14" r="12" fill="none" strokeWidth="2.5" strokeLinecap="round"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
      </div>
      <span className={`text-lg font-bold ${textColor}`}>{score}</span>
    </div>
  )
}

function ContentTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-white/[0.04] text-white/50">
      {type.replace("_", " ")}
    </span>
  )
}

export default function HistoryPage() {
  const [page, setPage] = useState(1)
  const [contentType, setContentType] = useState("all")
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  const params = new URLSearchParams({ page: String(page), limit: "20" })
  if (contentType !== "all") params.set("content_type", contentType)
  if (search) params.set("search", search)

  const { data, isLoading } = useSWR(`/api/scans?${params}`, fetcher)
  const scans: Scan[] = data?.scans || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">Records</p>
        <h1 className="text-3xl font-bold text-white inline-flex items-center gap-2">
          Scan History
          <HelpTooltip text="All your past compliance scans with scores, flags, and export options." />
        </h1>
        <p className="text-white/60 mt-1">View and manage all past compliance scans.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-stretch md:items-center rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Search content..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1) } }}
            className="pl-9 bg-white/[0.03] border-white/10 text-white/80 placeholder:text-white/30 focus-visible:border-[#55E039]/30 focus-visible:ring-[#55E039]/10"
          />
        </div>
        <Select value={contentType} onValueChange={(v) => { setContentType(v ?? "all"); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px] bg-white/[0.03] border-white/10 text-white/70">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="website_copy">Website Copy</SelectItem>
            <SelectItem value="social_post">Social Post</SelectItem>
            <SelectItem value="ad_copy">Ad Copy</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="script">Script</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] h-24 animate-pulse" />
          ))}
        </div>
      ) : scans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-5">
            <Clock className="h-8 w-8 text-white/20" />
          </div>
          <p className="text-white/50 font-medium mb-1">No scans yet</p>
          <p className="text-white/30 text-sm mb-4">Head to the Scanner to check your first piece of content.</p>
          <Link
            href="/dashboard/scanner"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] text-sm font-bold shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300"
          >
            <Shield className="h-4 w-4" />
            Start Scanning
          </Link>
        </div>
      ) : (
        <>
          {/* Scan Cards */}
          <div className="space-y-3">
            {scans.map((scan) => (
              <Link
                key={scan.id}
                href={`/dashboard/history/${scan.id}`}
                className="block group"
              >
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    {/* Score */}
                    <div className="shrink-0">
                      <ScoreIndicator score={scan.compliance_score} />
                    </div>

                    {/* Separator */}
                    <div className="w-px h-10 bg-white/[0.06] shrink-0" />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <ContentTypeBadge type={scan.content_type} />
                        {scan.flag_count > 0 && (
                          <span className="text-[10px] font-bold text-white/40">
                            {scan.flag_count} flag{scan.flag_count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/70 truncate leading-relaxed">
                        {scan.original_text.slice(0, 120)}
                      </p>
                    </div>

                    {/* Date + Actions */}
                    <div className="shrink-0 flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-white/40" title={new Date(scan.created_at).toLocaleString()}>
                          {timeAgo(scan.created_at)}
                        </p>
                        <p className="text-[10px] text-white/50">{formatDate(scan.created_at)}</p>
                      </div>
                      <div className="flex gap-1">
                        <span className="p-2 rounded-lg text-white/30 group-hover:text-[#55E039] group-hover:bg-[#55E039]/[0.06] transition-all duration-300">
                          <Eye className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-3 sm:p-2 rounded-lg border border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                let pageNum: number
                if (totalPages <= 7) {
                  pageNum = i + 1
                } else if (page <= 4) {
                  pageNum = i + 1
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i
                } else {
                  pageNum = page - 3 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`
                      w-11 h-11 sm:w-9 sm:h-9 rounded-lg text-sm font-medium transition-all duration-300
                      ${page === pageNum
                        ? "bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)]"
                        : "border border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/70"
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-3 sm:p-2 rounded-lg border border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
