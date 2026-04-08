"use client"

import useSWR from "swr"
import Link from "next/link"
import {
  Users,
  CreditCard,
  ScanSearch,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  CalendarDays,
  BarChart3,
  Activity,
  Ticket,
  ArrowUpRight,
  Clock,
  Cpu,
  Zap,
  UserPlus,
  BookOpen,
  MessageSquare,
  Flame,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface ActivityEvent {
  id: string
  type: "scan" | "signup" | "ticket"
  user_email: string
  description: string
  compliance_score: number | null
  flag_count: number
  created_at: string
}

interface Stats {
  totalUsers: number
  activeSubscribers: number
  churnedCount: number
  totalScans: number
  betaSubscribers: number
  betaSpots: number
  betaMrr: number
  standardMrr: number
  mrr: number
  arr: number
  revenue: number
  avgRevenuePerUser: number
  scansPerDay: { date: string; count: number }[]
  scansToday: number
  scansThisWeek: number
  scansThisMonth: number
  scansLastMonth: number
  avgScore: number
  totalFlags: number
  mostCommonViolation: string
  recentSignups: {
    id: string
    email: string
    clinic_name: string | null
    subscription_status: string
    created_at: string
  }[]
  recentActivity: ActivityEvent[]
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  totalTickets: number
  userGrowth: number
  apiCostToday: number
  apiCostThisWeek: number
  apiCostThisMonth: number
  apiCallsToday: number
  cronStatus: {
    scrapeRules: { name: string; status: string }
    deepScrape: { name: string; status: string }
    siteMonitor: { name: string; status: string }
  }
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useSWR<Stats>(
    "/api/admin/stats",
    fetcher,
    { refreshInterval: 30000 }
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Command Center</h1>
            <p className="text-sm text-white/40 mt-1">Loading metrics...</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-white/[0.03] border border-white/10"
            />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-white/[0.03] border border-white/10"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white">Command Center</h1>
        <p className="mt-4 text-white/60">Failed to load stats.</p>
      </div>
    )
  }

  const maxScans = Math.max(...stats.scansPerDay.map((d) => d.count), 1)
  const scansTrend =
    stats.scansLastMonth > 0
      ? Math.round(
          ((stats.scansThisMonth - stats.scansLastMonth) /
            stats.scansLastMonth) *
            100
        )
      : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-sm text-white/40 mt-1">
            Real-time overview of your compliance platform
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="h-2 w-2 rounded-full bg-[#55E039] shadow-[0_0_6px_rgba(85,224,57,0.5)]" />
          Live
        </div>
      </div>

      {/* TOP STATS ROW */}
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
          Key Metrics
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#55E039]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between relative">
              <span className="text-sm text-white/60">Total Users</span>
              <Users className="h-5 w-5 text-[#55E039]" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              {stats.totalUsers}
            </p>
            <div className="mt-2 flex items-center gap-1">
              {stats.userGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-[#55E039]" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              <span
                className={`text-xs font-medium ${stats.userGrowth >= 0 ? "text-[#55E039]" : "text-red-400"}`}
              >
                {stats.userGrowth >= 0 ? "+" : ""}
                {stats.userGrowth} this week
              </span>
            </div>
          </div>

          {/* Active Subscribers */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#55E039]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between relative">
              <span className="text-sm text-white/60">Active Subscribers</span>
              <CreditCard className="h-5 w-5 text-[#55E039]" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              {stats.activeSubscribers}
            </p>
            <p className="mt-2 text-xs text-white/40">
              MRR: ${stats.mrr.toLocaleString()}
            </p>
          </div>

          {/* Total Scans */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#55E039]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between relative">
              <span className="text-sm text-white/60">Scans This Month</span>
              <ScanSearch className="h-5 w-5 text-[#55E039]" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              {stats.scansThisMonth}
            </p>
            <div className="mt-2 flex items-center gap-1">
              {scansTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-[#55E039]" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-400" />
              )}
              <span
                className={`text-xs font-medium ${scansTrend >= 0 ? "text-[#55E039]" : "text-red-400"}`}
              >
                {scansTrend >= 0 ? "+" : ""}
                {scansTrend}% vs last month
              </span>
            </div>
          </div>

          {/* Beta Subscribers */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#55E039]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between relative">
              <span className="text-sm text-white/60">Beta Subscribers</span>
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              {stats.betaSubscribers}
              <span className="text-lg text-white/40 font-normal">
                /{stats.betaSpots}
              </span>
            </p>
            {/* Beta fill bar */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-[#55E039] transition-all"
                style={{
                  width: `${Math.min((stats.betaSubscribers / stats.betaSpots) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-[11px] text-white/40">
              {stats.betaSpots - stats.betaSubscribers} spots remaining
            </p>
          </div>
        </div>
      </div>

      {/* REVENUE SECTION */}
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
          Revenue
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">MRR</span>
              <DollarSign className="h-5 w-5 text-[#55E039]" />
            </div>
            <p className="mt-2 text-3xl font-bold text-[#55E039]">
              ${stats.mrr.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">ARR Projection</span>
              <TrendingUp className="h-5 w-5 text-[#55E039]" />
            </div>
            <p className="mt-2 text-3xl font-bold text-[#55E039]">
              ${stats.arr.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Beta MRR</span>
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              ${stats.betaMrr.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-white/40">
              {stats.betaSubscribers} users x $297/mo
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Standard MRR</span>
              <CreditCard className="h-5 w-5 text-[#55E039]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              ${stats.standardMrr.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-white/40">
              {stats.activeSubscribers - stats.betaSubscribers} users x $497/mo
            </p>
          </div>
        </div>
      </div>

      {/* SCAN VOLUME + COMPLIANCE */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scans per day chart */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-1">
                Scan Volume
              </p>
              <h3 className="text-sm text-white/60">Last 7 Days</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {stats.scansToday}
              </p>
              <p className="text-[11px] text-white/40">today</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-36">
            {stats.scansPerDay.map((day) => {
              const heightPct =
                maxScans > 0 ? (day.count / maxScans) * 100 : 0
              const dateLabel = new Date(
                day.date + "T00:00:00"
              ).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
              return (
                <div
                  key={day.date}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-xs font-medium text-white/70">
                    {day.count}
                  </span>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-[#55E039]/60 to-[#55E039] transition-all min-h-[2px]"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                  />
                  <span className="text-[10px] text-white/40 text-center leading-tight">
                    {dateLabel}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {stats.scansToday}
              </p>
              <p className="text-[10px] text-white/40">Today</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {stats.scansThisWeek}
              </p>
              <p className="text-[10px] text-white/40">This Week</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {stats.totalScans.toLocaleString()}
              </p>
              <p className="text-[10px] text-white/40">All Time</p>
            </div>
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">
            Compliance Summary
          </p>
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3">
                <ShieldAlert
                  className={`h-5 w-5 ${stats.avgScore >= 70 ? "text-[#55E039]" : "text-yellow-400"}`}
                />
                <span className="text-sm text-white/70">
                  Avg Compliance Score
                </span>
              </div>
              <span
                className={`text-xl font-bold ${stats.avgScore >= 70 ? "text-[#55E039]" : "text-yellow-400"}`}
              >
                {stats.avgScore}%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-white/70">
                  Total Flags Caught
                </span>
              </div>
              <span className="text-xl font-bold text-red-400">
                {stats.totalFlags.toLocaleString()}
              </span>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-white/70">
                  Most Common Violation
                </span>
              </div>
              <p
                className="text-sm font-medium text-white truncate"
                title={stats.mostCommonViolation}
              >
                {stats.mostCommonViolation}
              </p>
            </div>

            {/* Support tickets summary */}
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-white/70">Open Tickets</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                  {stats.inProgressTickets} in progress
                </span>
                <span className="text-xl font-bold text-yellow-400">
                  {stats.openTickets}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY FEED */}
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
          Recent Activity
        </p>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-8">
                No activity yet.
              </p>
            ) : (
              stats.recentActivity.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  {/* Event type icon */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      event.type === "scan"
                        ? "bg-[#55E039]/10"
                        : event.type === "signup"
                          ? "bg-blue-500/10"
                          : "bg-yellow-500/10"
                    }`}
                  >
                    {event.type === "scan" ? (
                      <ScanSearch className="h-4 w-4 text-[#55E039]" />
                    ) : event.type === "signup" ? (
                      <UserPlus className="h-4 w-4 text-blue-400" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>

                  {/* Event info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white/90 truncate">
                      {event.user_email}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {event.description}
                    </p>
                  </div>

                  {/* Score badge for scans */}
                  {event.type === "scan" &&
                    event.compliance_score !== null && (
                      <ScoreBadge score={event.compliance_score} />
                    )}

                  {/* Timestamp */}
                  <span className="text-[11px] text-white/30 shrink-0">
                    {formatRelativeTime(event.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SYSTEM HEALTH + API COSTS + QUICK LINKS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Health */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">
            System Health
          </p>
          <div className="space-y-3">
            {Object.values(stats.cronStatus).map((cron) => (
              <div
                key={cron.name}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-white/40" />
                  <span className="text-sm text-white/70">{cron.name}</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#55E039]" />
                  <span className="text-[#55E039]">{cron.status}</span>
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-white/40" />
                <span className="text-sm text-white/70">
                  API Calls Today
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                {stats.apiCallsToday}
              </span>
            </div>
          </div>
        </div>

        {/* API Cost Tracker */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">
            API Costs
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <span className="text-sm text-white/70">Today</span>
              <span className="text-sm font-bold text-white">
                ${(stats.apiCostToday / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <span className="text-sm text-white/70">This Week</span>
              <span className="text-sm font-bold text-white">
                ${(stats.apiCostThisWeek / 100).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <span className="text-sm text-white/70">This Month</span>
              <span className="text-sm font-bold text-white">
                ${(stats.apiCostThisMonth / 100).toFixed(2)}
              </span>
            </div>
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">
                  Avg per scan (est.)
                </span>
                <span className="text-xs text-white/60">
                  $
                  {stats.scansThisMonth > 0
                    ? (
                        stats.apiCostThisMonth /
                        100 /
                        stats.scansThisMonth
                      ).toFixed(3)
                    : "0.00"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">
            Quick Links
          </p>
          <div className="space-y-2">
            {[
              {
                label: "Manage Users",
                href: "/admin/users",
                icon: Users,
                desc: `${stats.totalUsers} total`,
              },
              {
                label: "View Tickets",
                href: "/admin/tickets",
                icon: MessageSquare,
                desc: `${stats.openTickets} open`,
              },
              {
                label: "Manage Rules",
                href: "/admin/rules",
                icon: BookOpen,
                desc: "Compliance rules",
              },
              {
                label: "View Scans",
                href: "/admin/scans",
                icon: ScanSearch,
                desc: `${stats.scansToday} today`,
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-3 hover:bg-white/[0.05] hover:border-[#55E039]/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] group-hover:bg-[#55E039]/10 transition-colors">
                    <link.icon className="h-4 w-4 text-white/50 group-hover:text-[#55E039] transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      {link.label}
                    </p>
                    <p className="text-[11px] text-white/30">{link.desc}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-[#55E039] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT SIGNUPS */}
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-3">
          Recent Signups
        </p>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-xs font-medium text-white/40">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-medium text-white/40">
                  Clinic
                </th>
                <th className="px-4 py-3 text-xs font-medium text-white/40">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-white/40">
                  Signed Up
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSignups.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 text-white/80">{user.email}</td>
                  <td className="px-4 py-3 text-white/50">
                    {user.clinic_name || "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.subscription_status} />
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {formatRelativeTime(user.created_at)}
                  </td>
                </tr>
              ))}
              {stats.recentSignups.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-white/40"
                  >
                    No signups yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Utility Components ──────────────────────── */

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-block rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-white/40">
        N/A
      </span>
    )
  }
  const color =
    score >= 80
      ? "bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20"
      : score >= 50
        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        : "bg-red-500/10 text-red-500 border-red-500/20"
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {score}%
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20",
    inactive: "bg-white/5 text-white/40 border-white/10",
    past_due: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  }
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${
        colors[status] || colors.inactive
      }`}
    >
      {status}
    </span>
  )
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString()
}
