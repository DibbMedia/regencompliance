"use client"

import useSWR from "swr"
import {
  Users,
  CreditCard,
  ScanSearch,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  CalendarDays,
  BarChart3,
  UserMinus,
  Activity,
  Ticket,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Stats {
  totalUsers: number
  activeSubscribers: number
  churnedCount: number
  totalScans: number
  mrr: number
  arr: number
  revenue: number
  avgRevenuePerUser: number
  scansPerDay: { date: string; count: number }[]
  scansToday: number
  scansThisWeek: number
  scansThisMonth: number
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
  recentActivity: {
    id: string
    profile_id: string
    user_email: string
    compliance_score: number | null
    flag_count: number
    content_type: string
    created_at: string
  }[]
  openTickets: number
  inProgressTickets: number
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useSWR<Stats>("/api/admin/stats", fetcher, {
    refreshInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-white/[0.03] border border-white/10"
            />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-white/[0.03] border border-white/10"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="mt-4 text-muted-foreground">Failed to load stats.</p>
      </div>
    )
  }

  const maxScans = Math.max(...stats.scansPerDay.map((d) => d.count), 1)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Overview</h1>

      {/* Row 1: User & Revenue Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="text-[#55E039]"
          accent="border-l-[#55E039]"
        />
        <StatCard
          label="Active Subscribers"
          value={stats.activeSubscribers}
          icon={CreditCard}
          color="text-[#55E039]"
          accent="border-l-[#55E039]"
        />
        <StatCard
          label="Churned"
          value={stats.churnedCount}
          icon={UserMinus}
          color="text-red-400"
          accent="border-l-red-500"
        />
        <StatCard
          label="MRR"
          value={`$${stats.mrr.toLocaleString()}`}
          icon={DollarSign}
          color="text-[#55E039]"
          accent="border-l-[#55E039]"
        />
        <StatCard
          label="ARR Projection"
          value={`$${stats.arr.toLocaleString()}`}
          icon={TrendingUp}
          color="text-[#55E039]"
          accent="border-l-[#55E039]"
        />
      </div>

      {/* Row 2: Scan Volume */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Scans Today"
          value={stats.scansToday}
          icon={ScanSearch}
          color="text-[#55E039]"
          accent="border-l-[#55E039]"
        />
        <StatCard
          label="Scans This Week"
          value={stats.scansThisWeek}
          icon={CalendarDays}
          color="text-[#55E039]"
          accent="border-l-[#55E039]"
        />
        <StatCard
          label="Scans This Month"
          value={stats.scansThisMonth}
          icon={BarChart3}
          color="text-[#55E039]"
          accent="border-l-[#55E039]"
        />
        <StatCard
          label="Scans All Time"
          value={stats.totalScans.toLocaleString()}
          icon={ScanSearch}
          color="text-[#55E039]"
          accent="border-l-[#55E039]"
        />
      </div>

      {/* Row 3: Compliance Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Avg Compliance Score"
          value={`${stats.avgScore}%`}
          icon={ShieldAlert}
          color={stats.avgScore >= 70 ? "text-[#55E039]" : "text-yellow-400"}
          accent={stats.avgScore >= 70 ? "border-l-[#55E039]" : "border-l-yellow-500"}
        />
        <StatCard
          label="Total Flags Caught"
          value={stats.totalFlags.toLocaleString()}
          icon={AlertTriangle}
          color="text-red-400"
          accent="border-l-red-500"
        />
        <div className="rounded-xl border border-white/10 border-l-4 border-l-orange-500 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Most Common Violation</span>
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </div>
          <p className="mt-2 text-lg font-bold truncate" title={stats.mostCommonViolation}>
            {stats.mostCommonViolation.length > 40
              ? stats.mostCommonViolation.slice(0, 40) + "..."
              : stats.mostCommonViolation}
          </p>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 border-l-4 border-l-[#55E039] bg-white/[0.03] p-5">
          <h3 className="text-sm text-white/60 mb-2">Revenue Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60">Total Revenue Est. (Monthly)</span>
              <span className="font-bold text-[#55E039]">${stats.mrr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">ARR Projection</span>
              <span className="font-bold text-[#55E039]">${stats.arr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Avg Revenue Per User</span>
              <span className="font-bold text-[#55E039]">${stats.avgRevenuePerUser.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 border-l-4 border-l-yellow-500 bg-white/[0.03] p-5">
          <h3 className="text-sm text-muted-foreground mb-2">Support Tickets</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Open Tickets</span>
              <span className="inline-flex items-center gap-1 font-bold">
                <Ticket className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400">{stats.openTickets}</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">In Progress</span>
              <span className="inline-flex items-center gap-1 font-bold">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-blue-400">{stats.inProgressTickets}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scans per day chart */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-lg font-semibold">Scans Per Day (Last 7 Days)</h2>
        <div className="flex items-end gap-2 h-40">
          {stats.scansPerDay.map((day) => {
            const heightPct = maxScans > 0 ? (day.count / maxScans) * 100 : 0
            const dateLabel = new Date(day.date + "T00:00:00").toLocaleDateString(
              "en-US",
              { weekday: "short", month: "short", day: "numeric" }
            )
            return (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-xs font-medium">{day.count}</span>
                <div
                  className="w-full rounded-t bg-primary/70 transition-all min-h-[2px]"
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {dateLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two column: Recent Activity + Recent Signups */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Feed */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans yet.</p>
            ) : (
              stats.recentActivity.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{scan.user_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {scan.content_type} &middot;{" "}
                      {new Date(scan.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <ScoreBadge score={scan.compliance_score} />
                    {scan.flag_count > 0 && (
                      <span className="text-xs text-red-400">
                        {scan.flag_count} flag{scan.flag_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-4 text-lg font-semibold">Recent Signups</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSignups.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-2 pr-4 truncate max-w-[200px]">{user.email}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={user.subscription_status} />
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {stats.recentSignups.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted-foreground">
                      No signups yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  accent,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  accent: string
}) {
  return (
    <div className={`rounded-xl border border-white/10 border-l-4 ${accent} bg-white/[0.03] p-5`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-block rounded-full bg-gray-500/10 px-2 py-0.5 text-xs font-medium text-gray-400">
        N/A
      </span>
    )
  }
  const color =
    score >= 80
      ? "bg-[#55E039]/10 text-[#55E039]"
      : score >= 50
      ? "bg-yellow-500/10 text-yellow-500"
      : "bg-red-500/10 text-red-500"
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {score}%
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-[#55E039]/10 text-[#55E039]",
    inactive: "bg-gray-500/10 text-gray-400",
    past_due: "bg-yellow-500/10 text-yellow-500",
    cancelled: "bg-red-500/10 text-red-500",
  }
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        colors[status] || colors.inactive
      }`}
    >
      {status}
    </span>
  )
}
