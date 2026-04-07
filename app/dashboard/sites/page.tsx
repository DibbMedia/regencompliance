"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR, { mutate } from "swr"
import {
  Globe,
  Plus,
  Loader2,
  X,
  RefreshCw,
  Eye,
  Pause,
  Play,
} from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Site {
  id: string
  domain: string
  name: string | null
  is_active: boolean
  avg_compliance_score: number | null
  total_pages: number
  last_crawl_at: string | null
  created_at: string
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function SmallScoreRing({ score }: { score: number | null }) {
  if (score === null) return <span className="text-white/30 text-sm">--</span>
  const color = score >= 80 ? "#55E039" : score >= 50 ? "#eab308" : "#ef4444"
  const textColor = score >= 80 ? "text-[#55E039]" : score >= 50 ? "text-yellow-500" : "text-red-500"
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

function StatusBadge({ status }: { status: string }) {
  if (status === "monitoring") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#55E039]/20 bg-[#55E039]/10 text-[#55E039]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#55E039] animate-pulse" />
        Monitoring
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-white/[0.04] text-white/40">
      <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
      Paused
    </span>
  )
}

export default function SitesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addDomain, setAddDomain] = useState("")
  const [addName, setAddName] = useState("")
  const [adding, setAdding] = useState(false)
  const [scanningId, setScanningId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { data, isLoading } = useSWR("/api/sites", fetcher)
  const sites: Site[] = data?.sites || []

  async function handleAddSite() {
    if (!addDomain.trim()) return
    setAdding(true)

    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: addDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
          name: addName.trim() || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to add site.")
        return
      }

      toast.success("Site added! Initial scan starting...")
      setShowAddDialog(false)
      setAddDomain("")
      setAddName("")
      mutate("/api/sites")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setAdding(false)
    }
  }

  async function handleScanNow(siteId: string) {
    setScanningId(siteId)
    try {
      const res = await fetch(`/api/sites/${siteId}/scan`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Scan failed.")
        return
      }
      toast.success("Scan started! Results will update shortly.")
      mutate("/api/sites")
    } catch {
      toast.error("Network error.")
    } finally {
      setScanningId(null)
    }
  }

  async function handleToggleStatus(siteId: string, isActive: boolean) {
    setTogglingId(siteId)
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })
      if (!res.ok) {
        toast.error("Failed to update site status.")
        return
      }
      mutate("/api/sites")
    } catch {
      toast.error("Network error.")
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">Site Monitoring</p>
          <h2 className="text-2xl font-bold text-white">Monitored Sites</h2>
          <p className="text-white/60 mt-1">Monitor your clinic websites for compliance issues. Weekly automated scans.</p>
          <p className="text-xs text-white/30 italic mt-2">
            Automated compliance monitoring is educational guidance only, not a substitute for legal review.
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-5 text-sm font-semibold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_25px_rgba(85,224,57,0.45)] hover:brightness-110 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Site
        </button>
      </div>

      {/* Add Site Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_0_60px_rgba(85,224,57,0.1)] p-6 space-y-5 mx-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-1">New Site</p>
                <h3 className="text-lg font-bold text-white">Add Site to Monitor</h3>
              </div>
              <button
                onClick={() => setShowAddDialog(false)}
                className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <X className="h-4 w-4 text-white/40" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Domain</label>
                <Input
                  value={addDomain}
                  onChange={(e) => setAddDomain(e.target.value)}
                  placeholder="yoursite.com"
                  onKeyDown={(e) => { if (e.key === "Enter" && addDomain.trim()) handleAddSite() }}
                  className="bg-white/[0.03] border-white/10 text-white/90 placeholder:text-white/30 focus-visible:border-[#55E039]/30 focus-visible:ring-[#55E039]/10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Name (optional)</label>
                <Input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="My Clinic Website"
                  className="bg-white/[0.03] border-white/10 text-white/90 placeholder:text-white/30 focus-visible:border-[#55E039]/30 focus-visible:ring-[#55E039]/10"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSite}
                disabled={adding || !addDomain.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-sm font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add &amp; Scan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] h-28 animate-pulse" />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#55E039]/[0.06] flex items-center justify-center mb-5">
            <Globe className="h-8 w-8 text-[#55E039]/30" />
          </div>
          <p className="text-white/50 font-medium mb-1">No sites monitored yet</p>
          <p className="text-white/30 text-sm mb-4">Add your first site to get started.</p>
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] text-sm font-bold shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            Add Your First Site
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) => (
            <div
              key={site.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                {/* Score */}
                <div className="shrink-0">
                  <SmallScoreRing score={site.avg_compliance_score} />
                </div>

                {/* Separator */}
                <div className="w-px h-12 bg-white/[0.06] shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white truncate">
                      {site.name || site.domain}
                    </p>
                    <StatusBadge status={site.is_active ? "monitoring" : "paused"} />
                  </div>
                  <p className="text-xs text-white/40 truncate">{site.domain}</p>
                  <div className="flex gap-3 mt-1.5 text-xs text-white/30">
                    <span>{site.total_pages} page{site.total_pages !== 1 ? "s" : ""}</span>
                    {site.last_crawl_at && (
                      <span>Scanned {timeAgo(site.last_crawl_at)}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(site.id, site.is_active)}
                    disabled={togglingId === site.id}
                    className="p-2 rounded-lg border border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-300 disabled:opacity-50"
                    title={site.is_active ? "Pause monitoring" : "Resume monitoring"}
                  >
                    {togglingId === site.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : site.is_active ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleScanNow(site.id)}
                    disabled={scanningId === site.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-300 disabled:opacity-50"
                  >
                    {scanningId === site.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Scan Now
                  </button>
                  <Link
                    href={`/dashboard/sites/${site.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-xs font-medium text-[#55E039] hover:bg-[#55E039]/[0.08] hover:border-[#55E039]/30 transition-all duration-300"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
