"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import {
  Shield,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BookOpen,
  Sparkles,
  BarChart3,
  Zap,
  FileSearch,
  Calendar,
  Globe,
  Minus,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { GettingStartedChecklist } from "@/components/getting-started-checklist"
import { TutorialModal } from "@/components/tutorial-modal"

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

interface TrendsData {
  daily_scores: Array<{ date: string; avg_score: number; scan_count: number }>
  weekly_scores: Array<{ week: string; avg_score: number; scan_count: number }>
  overall: {
    total_scans: number
    avg_score: number
    best_score: number
    worst_score: number
    most_common_violation: string
    improvement: number
  }
  by_content_type: Array<{ content_type: string; avg_score: number; scan_count: number }>
  recent_flags: Array<{ banned_phrase: string; count: number; risk_level: string }>
  monitored_sites: { count: number; avg_score: number }
  last_7_day_avg: number
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
        <span className="text-xs font-semibold text-white/65 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
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

const SAMPLE_SCANS = [
  {
    slug: "stem-cell",
    specialty: "Regen Med",
    badgeLabel: "High risk",
    badgeClass: "text-red-400 bg-red-500/10 border-red-500/20",
    text: "Our FDA-approved stem cell therapy cures arthritis and heals damaged joints permanently. Patients experience guaranteed results with no side effects. Thousands have been cured through our proven regenerative protocols.",
  },
  {
    slug: "med-spa",
    specialty: "Med Spa",
    badgeLabel: "Med risk",
    badgeClass: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    text: "Our groundbreaking Botox treatment eliminates wrinkles and reverses the signs of aging. Clinically proven to deliver a younger, more radiant appearance — risk-free and guaranteed.",
  },
  {
    slug: "weight-loss",
    specialty: "Weight Loss",
    badgeLabel: "High risk",
    badgeClass: "text-red-400 bg-red-500/10 border-red-500/20",
    text: "Our semaglutide weight loss program is guaranteed to eliminate obesity and reverse diabetes. Lose up to 30 pounds in 30 days with our FDA-approved formulation. Zero side effects, real results.",
  },
] as const

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

function WeeklyTrendChart({ weeks }: { weeks: TrendsData["weekly_scores"] }) {
  const maxScore = 100
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-6">
      <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">
        Weekly Score Trend
      </p>
      <div className="flex items-end gap-1 sm:gap-2 h-32 overflow-hidden">
        {weeks.map((w, i) => {
          const height = w.scan_count > 0 ? Math.max((w.avg_score / maxScore) * 100, 4) : 0
          const barColor =
            w.avg_score >= 80
              ? "bg-[#55E039]"
              : w.avg_score >= 50
              ? "bg-yellow-400"
              : w.avg_score > 0
              ? "bg-red-400"
              : "bg-white/[0.06]"
          const weekDate = new Date(w.week)
          const label = `${weekDate.getMonth() + 1}/${weekDate.getDate()}`
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-white/30 tabular-nums">
                {w.scan_count > 0 ? w.avg_score : ""}
              </span>
              <div className="w-full flex items-end" style={{ height: "80px" }}>
                <div
                  className={`w-full rounded-t ${barColor} transition-all duration-500`}
                  style={{ height: `${height}%`, minHeight: w.scan_count > 0 ? "3px" : "0" }}
                />
              </div>
              <span className="text-[9px] text-white/20 tabular-nums">{label}</span>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-white/20 mt-2 text-center">Last 12 weeks</p>
    </div>
  )
}

function TopViolationsWidget({
  flags,
}: {
  flags: TrendsData["recent_flags"]
}) {
  if (flags.length === 0) {
    return (
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-6">
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">
          Most Common Violations
        </p>
        <p className="text-sm text-white/30">No violations found yet. Run some scans to see trends.</p>
      </div>
    )
  }

  const riskColor: Record<string, string> = {
    high: "text-red-400 bg-red-400/10",
    medium: "text-yellow-400 bg-yellow-400/10",
    low: "text-blue-400 bg-blue-400/10",
  }

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-6">
      <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">
        Most Common Violations
      </p>
      <div className="space-y-2.5">
        {flags.slice(0, 5).map((flag, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-sm"
          >
            <span className="text-white/45 text-xs w-4 shrink-0 tabular-nums">
              {i + 1}.
            </span>
            <span className="text-white/80 truncate flex-1 text-xs">
              {flag.banned_phrase}
            </span>
            <span className="text-white/55 text-xs tabular-nums shrink-0">
              {flag.count}x
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                riskColor[flag.risk_level] || riskColor.medium
              }`}
            >
              {flag.risk_level}
            </span>
          </div>
        ))}
      </div>
      <Link
        href="/dashboard/history"
        className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-[#55E039] transition-colors mt-4"
      >
        View all in history <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

function ContentTypeBreakdown({
  types,
}: {
  types: TrendsData["by_content_type"]
}) {
  if (types.length === 0) return null

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-6">
      <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">
        Score by Content Type
      </p>
      <div className="space-y-3">
        {types.map((ct) => {
          const scoreColor =
            ct.avg_score >= 80
              ? "text-[#55E039]"
              : ct.avg_score >= 50
              ? "text-yellow-400"
              : "text-red-400"
          return (
            <div key={ct.content_type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">
                  {formatContentType(ct.content_type)}
                </span>
                <span className="text-[10px] text-white/20">
                  ({ct.scan_count} scan{ct.scan_count !== 1 ? "s" : ""})
                </span>
              </div>
              <span className={`text-sm font-bold tabular-nums ${scoreColor}`}>
                {ct.avg_score}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonitoredSitesSummary({
  sites,
}: {
  sites: TrendsData["monitored_sites"]
}) {
  if (sites.count === 0) return null

  const scoreColor =
    sites.avg_score >= 80
      ? "text-[#55E039]"
      : sites.avg_score >= 50
      ? "text-yellow-400"
      : "text-red-400"

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
          <Globe className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
          Monitored Sites
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-white">{sites.count}</p>
          <p className="text-xs text-white/40 mt-1">
            Avg score: <span className={`font-bold ${scoreColor}`}>{sites.avg_score}</span>
          </p>
        </div>
        <Link
          href="/dashboard/sites"
          className="text-xs text-white/30 hover:text-[#55E039] transition-colors flex items-center gap-1"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const supabase = createClient()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [onboardingChecklist, setOnboardingChecklist] = useState<Record<string, boolean> | null>(null)

  // Fetch trends data via SWR
  const { data: trends } = useSWR<TrendsData>("/api/compliance-trends", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from("profiles")
          .select("clinic_name, subscription_status, is_beta_subscriber")
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
          isBeta: profile?.is_beta_subscriber || false,
          totalScans,
          avgScore,
          totalFlags,
          lastScanDate,
          recentScans: allScans.slice(0, 5),
        })

        // Fetch onboarding checklist
        try {
          const checklistRes = await fetch("/api/onboarding-checklist")
          if (checklistRes.ok) {
            const checklistData = await checklistRes.json()
            setOnboardingChecklist(checklistData.checklist)
            // Show tutorial for brand new users
            if (
              totalScans === 0 &&
              !checklistData.checklist.tutorial_completed &&
              !checklistData.checklist.dismissed
            ) {
              setShowTutorial(true)
            }
          }
        } catch {
          // silent
        }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

  // Determine trend direction from trends API
  const improvement = trends?.overall?.improvement ?? 0
  const trendDirection = improvement > 2 ? "up" : improvement < -2 ? "down" : "stable"
  const last7Avg = trends?.last_7_day_avg ?? data?.avgScore ?? 0

  const showChecklist =
    onboardingChecklist &&
    !onboardingChecklist.dismissed &&
    !(
      onboardingChecklist.first_scan &&
      onboardingChecklist.review_score &&
      onboardingChecklist.try_rewrite &&
      onboardingChecklist.add_site &&
      onboardingChecklist.invite_team &&
      onboardingChecklist.explore_library
    )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal
          onComplete={() => {
            setShowTutorial(false)
            setOnboardingChecklist((prev) => prev ? { ...prev, tutorial_completed: true } : prev)
          }}
        />
      )}

      {/* Getting Started Checklist */}
      {showChecklist && (
        <GettingStartedChecklist initialChecklist={onboardingChecklist} />
      )}

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
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
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/scanner"
            className="inline-flex h-11 px-3 text-xs sm:h-10 sm:px-5 sm:text-sm items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] font-semibold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_25px_rgba(85,224,57,0.45)] hover:brightness-110 transition-all"
          >
            <Shield className="h-4 w-4" />
            New Scan
          </Link>
          <Link
            href="/dashboard/history"
            className="inline-flex h-11 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Clock className="h-4 w-4" />
            History
          </Link>
          <Link
            href="/dashboard/library"
            className="hidden sm:inline-flex h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <BookOpen className="h-4 w-4" />
            Actions
          </Link>
          <Link
            href="/dashboard/sites"
            className="hidden sm:inline-flex h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Globe className="h-4 w-4" />
            Monitor Sites
          </Link>
        </div>
      </div>

      {hasScans ? (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BarChart3}
              label="Total Scans"
              value={trends?.overall?.total_scans ?? data.totalScans}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Score"
              value={trends?.overall?.avg_score ?? data.avgScore}
              sub={
                (trends?.overall?.avg_score ?? data.avgScore) >= 80
                  ? "Good standing"
                  : (trends?.overall?.avg_score ?? data.avgScore) >= 50
                  ? "Needs attention"
                  : "High risk"
              }
              color={
                (trends?.overall?.avg_score ?? data.avgScore) >= 80
                  ? "green"
                  : (trends?.overall?.avg_score ?? data.avgScore) >= 50
                  ? "yellow"
                  : "red"
              }
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

          {/* Compliance Health Section */}
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-6 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">
                  Compliance Health
                </p>
                <p className="text-sm text-white/40 mt-1">
                  7-day average score
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Trend indicator */}
                {trends && (
                  <div className="flex items-center gap-1.5">
                    {trendDirection === "up" ? (
                      <TrendingUp className="h-5 w-5 text-[#55E039]" />
                    ) : trendDirection === "down" ? (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    ) : (
                      <Minus className="h-5 w-5 text-yellow-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        trendDirection === "up"
                          ? "text-[#55E039]"
                          : trendDirection === "down"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {improvement > 0 ? "+" : ""}
                      {improvement} pts
                    </span>
                  </div>
                )}
                {/* Large score display */}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                    last7Avg >= 80
                      ? "bg-[#55E039]/10 text-[#55E039]"
                      : last7Avg >= 50
                      ? "bg-yellow-400/10 text-yellow-400"
                      : "bg-red-400/10 text-red-400"
                  }`}
                >
                  <span className="text-2xl font-bold">{last7Avg}</span>
                </div>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  last7Avg >= 80
                    ? "bg-gradient-to-r from-[#55E039] to-[#3BB82A]"
                    : last7Avg >= 50
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                    : "bg-gradient-to-r from-red-500 to-red-400"
                }`}
                style={{ width: `${last7Avg}%` }}
              />
            </div>
            {/* Trend message */}
            <p className="text-xs text-white/40 mt-2">
              {trends ? (
                trendDirection === "up" ? (
                  <>Your compliance score improved by <span className="text-[#55E039] font-medium">{improvement} points</span> this week.</>
                ) : trendDirection === "down" ? (
                  <>Your compliance score declined by <span className="text-red-400 font-medium">{Math.abs(improvement)} points</span> this week. Review recent flags.</>
                ) : (
                  <>Your compliance score is stable. Keep scanning new content to stay ahead.</>
                )
              ) : last7Avg >= 80 ? (
                "Your content is generally compliant. Keep scanning new materials before publishing."
              ) : last7Avg >= 50 ? (
                "Some content needs attention. Review flagged items and use the rewrite tool."
              ) : (
                "Multiple high-risk issues detected. Review your content carefully before publishing."
              )}
            </p>
          </div>

          {/* Trend Chart + Violations + Content Types — 3-column grid */}
          {trends && (
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Weekly Trend Chart */}
              <WeeklyTrendChart weeks={trends.weekly_scores} />

              {/* Top Violations */}
              <TopViolationsWidget flags={trends.recent_flags} />

              {/* Content Type Breakdown + Monitored Sites */}
              <div className="space-y-4">
                <ContentTypeBreakdown types={trends.by_content_type} />
                <MonitoredSitesSummary sites={trends.monitored_sites} />
              </div>
            </div>
          )}

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

          {/* Disclaimer */}
          <p className="text-xs text-white/30 italic">
            Compliance scores are educational guidance only and do not constitute legal advice. Always consult qualified healthcare marketing counsel for regulatory decisions.
          </p>
        </>
      ) : (
        /* Getting Started - No scans yet */
        <>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 sm:p-8 lg:p-10 text-center shadow-[0_0_30px_rgba(85,224,57,0.05)]">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#55E039]/20 to-[#3BB82A]/10 border border-[#55E039]/20">
                <Zap className="h-8 w-8 text-[#55E039]" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Get started with your first scan</h2>
            <p className="text-sm text-white/65 max-w-md mx-auto mb-8">
              Paste any marketing content — website copy, social posts, ad text, emails — and get instant FDA/FTC compliance analysis with actionable suggestions.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto mb-8">
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#55E039]/10 mb-3">
                  <span className="text-sm font-bold text-[#55E039]">1</span>
                </div>
                <p className="text-sm font-medium text-white">Paste Content</p>
                <p className="text-xs text-white/65 mt-1">Copy any marketing text into the scanner</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#55E039]/10 mb-3">
                  <span className="text-sm font-bold text-[#55E039]">2</span>
                </div>
                <p className="text-sm font-medium text-white">Get Analysis</p>
                <p className="text-xs text-white/65 mt-1">AI checks against current FDA/FTC rules</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#55E039]/10 mb-3">
                  <span className="text-sm font-bold text-[#55E039]">3</span>
                </div>
                <p className="text-sm font-medium text-white">Fix & Publish</p>
                <p className="text-xs text-white/65 mt-1">Use AI rewrite to make content compliant</p>
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

          {/* Sample scans — zero-friction first click */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">
                Or try a sample
              </p>
              <span className="text-[10px] text-white/50">No setup — one click scans real example copy</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {SAMPLE_SCANS.map((s) => (
                <Link
                  key={s.slug}
                  href={`/dashboard/scanner?prefill=${encodeURIComponent(s.text)}`}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left hover:bg-white/[0.06] hover:border-[#55E039]/25 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${s.badgeClass}`}>
                      {s.badgeLabel}
                    </span>
                    <span className="text-[10px] text-white/55 uppercase tracking-wider font-semibold">{s.specialty}</span>
                  </div>
                  <p className="text-sm text-white/85 leading-relaxed line-clamp-3 mb-4">
                    &ldquo;{s.text}&rdquo;
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#55E039] group-hover:text-[#6FF055] transition-colors">
                    Scan this
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-white/55 italic">
            Compliance scores are educational guidance only and do not constitute legal advice. Always consult qualified healthcare marketing counsel for regulatory decisions.
          </p>
        </>
      )}
    </div>
  )
}
