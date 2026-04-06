"use client"

import { useEffect, useState } from "react"
import { Users, CreditCard, ScanSearch, DollarSign } from "lucide-react"

interface Stats {
  totalUsers: number
  activeSubscribers: number
  totalScans: number
  revenue: number
  scansPerDay: { date: string; count: number }[]
  recentSignups: {
    id: string
    email: string
    clinic_name: string | null
    subscription_status: string
    created_at: string
  }[]
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        setStats(await res.json())
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Overview</h1>
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

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Active Subscribers",
      value: stats.activeSubscribers,
      icon: CreditCard,
      color: "text-green-400",
    },
    {
      label: "Total Scans",
      value: stats.totalScans.toLocaleString(),
      icon: ScanSearch,
      color: "text-purple-400",
    },
    {
      label: "Est. MRR",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-yellow-400",
    },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Overview</h1>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {card.label}
              </span>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
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

      {/* Recent signups */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="mb-4 text-lg font-semibold">Recent Signups</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Clinic</th>
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
                  <td className="py-2 pr-4">{user.email}</td>
                  <td className="py-2 pr-4 text-muted-foreground">
                    {user.clinic_name || "—"}
                  </td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={user.subscription_status} />
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {stats.recentSignups.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted-foreground">
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    inactive: "bg-gray-500/20 text-gray-400",
    past_due: "bg-yellow-500/20 text-yellow-400",
    cancelled: "bg-red-500/20 text-red-400",
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
