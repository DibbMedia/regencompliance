"use client"

import { useState, useEffect } from "react"
import {
  Shield,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  Link2,
  Code2,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { HelpTooltip } from "@/components/ui/help-tooltip"

interface BadgeData {
  clinic_name: string
  badge_id: string
  last_scan_date: string
  avg_score: number
  total_scans: number
  verified_since: string
  badge_url: string
  embed_code: string
}

export default function BadgePage() {
  const [badge, setBadge] = useState<BadgeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  async function fetchBadge() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/badge")
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to load badge")
        setBadge(null)
      } else {
        setBadge(data)
      }
    } catch {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBadge()
  }, [])

  async function copyToClipboard(text: string, type: "embed" | "url") {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "embed") {
        setCopiedEmbed(true)
        setTimeout(() => setCopiedEmbed(false), 2000)
      } else {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      }
      toast.success(`${type === "embed" ? "Embed code" : "Badge URL"} copied!`)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const scoreColor =
    badge && badge.avg_score >= 80
      ? "text-[#55E039]"
      : badge && badge.avg_score >= 60
        ? "text-yellow-400"
        : "text-red-400"

  const lastScan = badge
    ? new Date(badge.last_scan_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : ""
  const memberSince = badge
    ? new Date(badge.verified_since).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : ""

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">
          Trust
        </p>
        <h2 className="text-2xl font-bold text-white inline-flex items-center gap-2">
          Compliance Badge
          <HelpTooltip text="Add this badge to your website to show visitors your marketing compliance status." />
        </h2>
        <p className="text-white/60 mt-1">
          Display a verified compliance badge on your clinic website.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <AlertCircle className="h-10 w-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-sm mb-4">{error}</p>
          <Button
            onClick={fetchBadge}
            variant="outline"
            size="sm"
            className="border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {badge && !loading && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Badge Preview */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white/70">Badge Preview</h3>
            <div className="flex items-center justify-center py-8 bg-white/[0.02] rounded-lg border border-white/[0.06]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/badge/image?id=${badge.badge_id}`}
                alt="Compliance Badge Preview"
                width={180}
                height={60}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                <p className="text-xs text-white/40 mb-1">Avg Score</p>
                <p className={`text-lg font-bold ${scoreColor}`}>
                  {badge.avg_score}%
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                <p className="text-xs text-white/40 mb-1">Total Scans</p>
                <p className="text-lg font-bold text-white">
                  {badge.total_scans}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                <p className="text-xs text-white/40 mb-1">Last Scan</p>
                <p className="text-xs font-bold text-white mt-1">{lastScan}</p>
              </div>
            </div>

            {/* Refresh */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-white/30">
                Member since {memberSince}
              </p>
              <Button
                onClick={fetchBadge}
                variant="ghost"
                size="sm"
                className="text-white/40 hover:text-white h-7 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Embed & Actions */}
          <div className="space-y-4">
            {/* Embed Code */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/70 flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Embed Code
                </h3>
                <Button
                  onClick={() => copyToClipboard(badge.embed_code, "embed")}
                  variant="ghost"
                  size="sm"
                  className="text-[#55E039] hover:text-[#55E039]/80 hover:bg-[#55E039]/10 h-7 text-xs"
                >
                  {copiedEmbed ? (
                    <>
                      <Check className="h-3 w-3 mr-1.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <pre className="bg-[#0a0a0a] border border-white/[0.06] rounded-lg p-4 text-xs text-white/50 overflow-x-auto font-mono leading-relaxed">
                {badge.embed_code}
              </pre>
              <p className="text-xs text-white/30">
                Paste this HTML snippet into your website where you want the
                badge to appear.
              </p>
            </div>

            {/* Badge URL */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/70 flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Verification URL
                </h3>
                <Button
                  onClick={() => copyToClipboard(badge.badge_url, "url")}
                  variant="ghost"
                  size="sm"
                  className="text-[#55E039] hover:text-[#55E039]/80 hover:bg-[#55E039]/10 h-7 text-xs"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="h-3 w-3 mr-1.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-lg p-3 flex items-center gap-2">
                <code className="text-xs text-[#55E039] truncate flex-1">
                  {badge.badge_url}
                </code>
                <a
                  href={badge.badge_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-white/60 transition-colors shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="text-xs text-white/30">
                Anyone who clicks your badge will see this verification page.
              </p>
            </div>

            {/* Info */}
            <div className="rounded-xl bg-[#55E039]/5 border border-[#55E039]/10 p-4 space-y-2">
              <h4 className="text-xs font-bold text-[#55E039]">How it works</h4>
              <ul className="text-xs text-white/50 space-y-1.5 list-disc list-inside">
                <li>
                  Add the badge to your website to show visitors your compliance
                  status
                </li>
                <li>
                  Your average compliance score must be 70+ to display a score
                  on the badge
                </li>
                <li>
                  Badge refreshes automatically with each new scan
                </li>
                <li>
                  Visitors can click the badge to verify your status on
                  RegenCompliance
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
