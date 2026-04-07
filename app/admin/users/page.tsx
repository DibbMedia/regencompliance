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

  const { data, isLoading } = useSWR(
    `/api/admin/users?${params}`,
    fetcher,
    { refreshInterval: 30000 }
  )

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[280px] max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or clinic name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/[0.03] border-white/10"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
            <tr className="border-b border-white/10 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium w-8"></th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Clinic Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Scans</th>
              <th className="px-4 py-3 font-medium">Last Active</th>
              <th className="px-4 py-3 font-medium">Signed Up</th>
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
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <>
                  <tr
                    key={user.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer"
                    onClick={() => toggleExpand(user.id)}
                  >
                    <td className="px-4 py-3">
                      {expandedUser === user.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.clinic_name || "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.subscription_status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.subscription_status === "active" ? "$497/mo" : "\u2014"}
                    </td>
                    <td className="px-4 py-3">{user.scan_count}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {user.last_scan_at
                        ? new Date(user.last_scan_at).toLocaleDateString()
                        : "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                  {expandedUser === user.id && (
                    <tr key={`${user.id}-detail`} className="border-b border-white/5">
                      <td colSpan={8} className="px-4 py-0">
                        <UserExpandedRow userId={user.id} />
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-white/10"
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

function UserExpandedRow({ userId }: { userId: string }) {
  const { data, isLoading } = useSWR<UserDetail>(
    `/api/admin/users/${userId}/detail`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="py-4 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading user details...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-4 text-sm text-muted-foreground">
        Failed to load details.
      </div>
    )
  }

  return (
    <div className="py-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="text-xs text-muted-foreground">Member Since</p>
          <p className="text-sm font-medium">
            {new Date(data.subscriptionDates.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-sm font-medium">
            <StatusBadge status={data.subscriptionDates.subscription_status} />
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="text-xs text-muted-foreground">Scans This Month</p>
          <p className="text-sm font-medium">{data.scansThisMonth}</p>
        </div>
      </div>

      {data.recentScans.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">
            Last 5 Scans
          </h4>
          <div className="space-y-1">
            {data.recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] px-3 py-2 text-xs"
              >
                <span className="text-muted-foreground">{scan.content_type}</span>
                <span>
                  Score:{" "}
                  <span
                    className={
                      (scan.compliance_score || 0) >= 80
                        ? "text-[#55E039]"
                        : (scan.compliance_score || 0) >= 50
                        ? "text-yellow-500"
                        : "text-red-500"
                    }
                  >
                    {scan.compliance_score ?? "N/A"}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {scan.flag_count} flag{scan.flag_count !== 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground">
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
