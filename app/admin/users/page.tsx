"use client"

import useSWR from "swr"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Users,
  ScanSearch,
  Calendar,
  CreditCard,
} from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface AdminUser {
  id: string
  email: string
  clinic_name: string | null
  subscription_status: string
  scan_count: number
  created_at: string
  last_scan_at?: string | null
}

interface UserDetail {
  recentScans: {
    id: string
    content_type: string
    compliance_score: number | null
    flag_count: number
    created_at: string
  }[]
  subscriptionDates: {
    created_at: string
    subscription_status: string
  }
  scansThisMonth: number
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "cancelled", label: "Cancelled" },
  { value: "past_due", label: "Past Due" },
]

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const params = new URLSearchParams({ page: String(page), limit: "20" })
  if (searchQuery) params.set("search", searchQuery)
  if (statusFilter) params.set("status", statusFilter)

  const { data, isLoading } = useSWR(`/api/admin/users?${params}`, fetcher, {
    refreshInterval: 30000,
  })

  const users: AdminUser[] = data?.users || []
  const totalPages = data?.totalPages || 1
  const total = data?.total || 0

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearchQuery(search)
  }

  function toggleExpand(userId: string) {
    setExpandedUser(expandedUser === userId ? null : userId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-white/40 mt-1">
            Manage platform users and subscriptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-[#55E039]/10 border border-[#55E039]/20 px-3 py-1">
            <Users className="h-3 w-3 text-[#55E039]" />
            <span className="text-xs font-medium text-[#55E039]">
              {total} total
            </span>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <form
          onSubmit={handleSearch}
          className="flex gap-2 flex-1 min-w-[280px] max-w-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Search by email or clinic name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#55E039]/30"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            className="bg-white/[0.05] border border-white/10 text-white/70 hover:bg-white/[0.08]"
          >
            Search
          </Button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a0a]">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-medium text-white/40 w-8" />
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Clinic Name
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Plan
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Scans
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Last Active
              </th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">
                Signed Up
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={8} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-white/40"
                >
                  <Users className="h-8 w-8 mx-auto mb-2 text-white/20" />
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isExpanded={expandedUser === user.id}
                  onToggle={() => toggleExpand(user.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/40">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-white/10 text-white/70 hover:bg-white/[0.05]"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-white/10 text-white/70 hover:bg-white/[0.05]"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── User Row ──────────────────────── */

function UserRow({
  user,
  isExpanded,
  onToggle,
}: {
  user: AdminUser
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <>
      <tr
        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </td>
        <td className="px-4 py-3 text-white/80">{user.email}</td>
        <td className="px-4 py-3 text-white/50">
          {user.clinic_name || "\u2014"}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={user.subscription_status} />
        </td>
        <td className="px-4 py-3 text-white/50">
          {user.subscription_status === "active" ? "$497/mo" : "\u2014"}
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-1">
            <ScanSearch className="h-3 w-3 text-white/30" />
            <span className="text-white/70">{user.scan_count}</span>
          </span>
        </td>
        <td className="px-4 py-3 text-white/40 text-xs">
          {user.last_scan_at
            ? formatRelative(user.last_scan_at)
            : "\u2014"}
        </td>
        <td className="px-4 py-3 text-white/40 text-xs">
          {new Date(user.created_at).toLocaleDateString()}
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-white/5">
          <td colSpan={8} className="px-4 py-0">
            <UserExpandedRow userId={user.id} userEmail={user.email} />
          </td>
        </tr>
      )}
    </>
  )
}

/* ─── User Expanded Row ──────────────────────── */

function UserExpandedRow({
  userId,
  userEmail,
}: {
  userId: string
  userEmail: string
}) {
  const { data, isLoading } = useSWR<UserDetail>(
    `/api/admin/users/${userId}/detail`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="py-4 flex items-center gap-2 text-white/40">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading user details...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-4 text-sm text-white/40">
        Failed to load details.
      </div>
    )
  }

  return (
    <div className="py-5 space-y-4">
      {/* Stats cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-3.5 w-3.5 text-white/30" />
            <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.15em]">
              Member Since
            </p>
          </div>
          <p className="text-sm font-medium text-white/80">
            {new Date(data.subscriptionDates.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-3.5 w-3.5 text-white/30" />
            <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.15em]">
              Status
            </p>
          </div>
          <StatusBadge status={data.subscriptionDates.subscription_status} />
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 mb-1">
            <ScanSearch className="h-3.5 w-3.5 text-white/30" />
            <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.15em]">
              Scans This Month
            </p>
          </div>
          <p className="text-sm font-medium text-white/80">
            {data.scansThisMonth}
          </p>
        </div>
      </div>

      {/* Recent scans */}
      {data.recentScans.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.15em] mb-2">
            Last 5 Scans
          </p>
          <div className="space-y-1.5">
            {data.recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs"
              >
                <span className="text-white/50 capitalize">
                  {scan.content_type.replace(/_/g, " ")}
                </span>
                <span>
                  <span className="text-white/40 mr-1">Score:</span>
                  <span
                    className={
                      (scan.compliance_score || 0) >= 80
                        ? "text-[#55E039] font-medium"
                        : (scan.compliance_score || 0) >= 50
                          ? "text-yellow-400 font-medium"
                          : "text-red-400 font-medium"
                    }
                  >
                    {scan.compliance_score ?? "N/A"}%
                  </span>
                </span>
                <span className="text-white/40">
                  {scan.flag_count} flag{scan.flag_count !== 1 ? "s" : ""}
                </span>
                <span className="text-white/30">
                  {new Date(scan.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Utility ──────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20",
    inactive: "bg-white/5 text-white/40 border-white/10",
    past_due: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
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

function formatRelative(dateStr: string): string {
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
