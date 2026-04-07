"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import {
  Shield,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Sparkles,
  BarChart3,
  Zap,
  FileSearch,
  Calendar,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface ScanSummary {
  id: string
  compliance_score: number
  content_type: string
  flag_count: number
  created_at: string
}

interface DashboardData {
  clinicName: string | null
  subscriptionStatus: string | null
  isBeta: boolean
  totalScans: number
  avgScore: number
  totalFlags: number
  lastScanDate: string | null
  recentScans: ScanSummary[]
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "white",
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  const colorMap: Record<string, string> = {
    green: "text-[#55E039] bg-[#55E039]/10",
    yellow: "text-yellow-400 bg-yellow-400/10",
    red: "text-red-400 bg-red-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    white: "text-white/60 bg-white/[0.06]",
  }

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium text-white/40 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  )
}

function ScoreIndicator({ score }: { score: number }) {
  const color = score >= 80 ? "text-[#55E039]" : score >= 50 ? "text-yellow-400" : "text-red-400"
  const bg = score >= 80 ? "bg-[#55E039]/10" : score >= 50 ? "bg-yellow-400/10" : "bg-red-400/10"
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${color} ${bg}`}>
      {score}
    </span>
  )
}

function formatContentType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function DashboardPage() {
  const supabase = createClient()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from("profiles")
          .select("clinic_name, subscription_status, is_beta")
          .eq("id", user.id)
          .single()

        const { data: scans } = await supabase
          .from("scans")
          .select("id, compliance_score, content_type, flag_count, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50)

        const allScans = scans || []
        const totalScans = allScans.length
        const avgScore = totalScans > 0
          ? Math.round(allScans.reduce((sum, s) => sum + (s.compliance_score || 0), 0) / totalScans)
          : 0
        const totalFlags = allScans.reduce((sum, s) => sum + (s.flag_count || 0), 0)
        const lastScanDate = allScans.length > 0 ? allScans[0].created_at : null

        setData({
          clinicName: profile?.clinic_name || null,
          subscriptionStatus: profile?.subscription_status || null,
          isBeta: profile?.is_beta || false,
          totalScans,
          avgScore,
          totalFlags,
          lastScanDate,
          recentScans: allScans.slice(0, 5),
        })
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Skeleton welcome */}
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-48 rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        {/* Skeleton stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/[0.03] border border-white/10 animate-pulse" />
          ))}
        </div>
        {/* Skeleton cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-white/[0.03] border border-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const hasScans = data && data.totalScans > 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{data?.clinicName ? `, ${data.clinicName}` : ""}
          </h1>
          <p className="text-sm text-white/40 mt-1 flex items-center gap-2">
            {data?.subscriptionStatus === "active" ? (
              <>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#55E039]" />
                Active subscription
              </>
            ) : data?.subscriptionStatus === "trialing" ? (
              <>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-yellow-400" />
                Trial active
              </>
            ) : (
              <>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/30" />
                Free plan
              </>
            )}
            {data?.isBeta && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#55E039]/10 border border-[#55E039]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#55E039] uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                Founding Member
              </span>
            )}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/scanner"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-5 text-sm font-semibold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_25px_rgba(85,224,57,0.45)] hover:brightness-110 transition-all"
          >
            <Shield className="h-4 w-4" />
            New Scan
          </Link>
          <Link
            href="/dashboard/history"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Clock className="h-4 w-4" />
            History
          </Link>
          <Link
            href="/dashboard/library"
            className="hidden sm:inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <BookOpen className="h-4 w-4" />
            Library
          </Link>
        </div>
      </div>

      {hasScans ? (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BarChart3}
              label="Total Scans"
              value={data.totalScans}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Score"
              value={data.avgScore}
              sub={data.avgScore >= 80 ? "Good standing" : data.avgScore >= 50 ? "Needs attention" : "High risk"}
              color={data.avgScore >= 80 ? "green" : data.avgScore >= 50 ? "yellow" : "red"}
            />
            <StatCard
              icon={AlertTriangle}
              label="Flags Found"
              value={data.totalFlags}
              color={data.totalFlags > 0 ? "yellow" : "green"}
            />
            <StatCard
              icon={Calendar}
              label="Last Scan"
              value={data.lastScanDate ? formatDate(data.lastScanDate) : "Never"}
              color="white"
            />
          </div>

          {/* Compliance Health */}
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-6 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Compliance Health</p>
                <p className="text-sm text-white/40 mt-1">Based on your last {Math.min(data.totalScans, 50)} scans</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  data.avgScore >= 80 ? "bg-[#55E039]/10 text-[#55E039]" :
                  data.avgScore >= 50 ? "bg-yellow-400/10 text-yellow-400" :
                  "bg-red-400/10 text-red-400"
                }`}>
                  <span className="text-xl font-bold">{data.avgScore}</span>
                </div>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  data.avgScore >= 80 ? "bg-gradient-to-r from-[#55E039] to-[#3BB82A]" :
                  data.avgScore >= 50 ? "bg-gradient-to-r from-yellow-500 to-yellow-400" :
                  "bg-gradient-to-r from-red-500 to-red-400"
                }`}
                style={{ width: `${data.avgScore}%` }}
              />
            </div>
            <p className="text-xs text-white/30 mt-2">
              {data.avgScore >= 80
                ? "Your content is generally compliant. Keep scanning new materials before publishing."
                : data.avgScore >= 50
                ? "Some content needs attention. Review flagged items and use the rewrite tool."
                : "Multiple high-risk issues detected. Review your content carefully before publishing."}
            </p>
          </div>

          {/* Recent Scans */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Recent Scans</p>
              <Link href="/dashboard/history" className="text-xs text-white/30 hover:text-[#55E039] transition-colors flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {data.recentScans.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/dashboard/history/${scan.id}`}
                  className="flex items-center gap-4 rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                    <FileSearch className="h-4 w-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {formatContentType(scan.content_type)} Scan
                    </p>
                    <p className="text-xs text-white/30">
                      {formatDate(scan.created_at)} &middot; {scan.flag_count} flag{scan.flag_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ScoreIndicator score={scan.compliance_score} />
                  <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Getting Started - No scans yet */
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-10 text-center shadow-[0_0_30px_rgba(85,224,57,0.05)]">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#55E039]/20 to-[#3BB82A]/10 border border-[#55E039]/20">
              <Zap className="h-8 w-8 text-[#55E039]" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Get started with your first scan</h2>
          <p className="text-sm text-white/40 max-w-md mx-auto mb-8">
            Paste any marketing content — website copy, social posts, ad text, emails — and get instant FDA/FTC compliance analysis with actionable suggestions.
          </p>

          <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto mb-8">
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#55E039]/10 mb-3">
                <span className="text-sm font-bold text-[#55E039]">1</span>
              </div>
              <p className="text-sm font-medium text-white">Paste Content</p>
              <p className="text-xs text-white/40 mt-1">Copy any marketing text into the scanner</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#55E039]/10 mb-3">
                <span className="text-sm font-bold text-[#55E039]">2</span>
              </div>
              <p className="text-sm font-medium text-white">Get Analysis</p>
              <p className="text-xs text-white/40 mt-1">AI checks against current FDA/FTC rules</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#55E039]/10 mb-3">
                <span className="text-sm font-bold text-[#55E039]">3</span>
              </div>
              <p className="text-sm font-medium text-white">Fix & Publish</p>
              <p className="text-xs text-white/40 mt-1">Use AI rewrite to make content compliant</p>
            </div>
          </div>

          <Link
            href="/dashboard/scanner"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-base font-semibold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_25px_rgba(85,224,57,0.45)] hover:brightness-110 transition-all"
          >
            <Shield className="h-5 w-5" />
            Run Your First Scan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
