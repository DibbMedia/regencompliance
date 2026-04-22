"use client"

import useSWR, { mutate } from "swr"
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
  Eye,
  Edit3,
  UserPlus,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

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

interface Me {
  id: string
  email: string
  role: "developer" | "support"
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
  const [showAddUser, setShowAddUser] = useState(false)

  const { data: me } = useSWR<Me>("/api/admin/me", fetcher)
  const isDeveloper = me?.role === "developer"

  const params = new URLSearchParams({ page: String(page), limit: "20" })
  if (searchQuery) params.set("search", searchQuery)
  if (statusFilter) params.set("status", statusFilter)
  const listKey = `/api/admin/users?${params}`

  const { data, isLoading } = useSWR(listKey, fetcher, { refreshInterval: 30000 })

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

  async function viewAs(userId: string, mode: "read" | "write") {
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_user_id: userId, mode }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast.error(body.error ?? "Failed to start impersonation")
      return
    }
    toast.success(`Viewing as user (${mode})`)
    window.location.href = "/dashboard/scanner"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-white/40 mt-1">Manage platform users, billing, and impersonation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-[#55E039]/10 border border-[#55E039]/20 px-3 py-1">
            <Users className="h-3 w-3 text-[#55E039]" />
            <span className="text-xs font-medium text-[#55E039]">{total} total</span>
          </div>
          {isDeveloper && (
            <Button
              onClick={() => setShowAddUser(true)}
              className="bg-[#55E039] text-[#0a0a0a] hover:brightness-110"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {showAddUser && isDeveloper && (
        <AddUserPanel onClose={() => setShowAddUser(false)} onCreated={() => mutate(listKey)} />
      )}

      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[280px] max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Search by email or clinic name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#55E039]/30"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="bg-white/[0.05] border border-white/10 text-white/70 hover:bg-white/[0.08]">
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

      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-medium text-white/40 w-8" />
              <th className="px-4 py-3 text-xs font-medium text-white/40">Email</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Clinic</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Scans</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Last Active</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Signed Up</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40 text-right">View As</th>
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
                <td colSpan={8} className="px-4 py-12 text-center text-white/40">
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
                  isDeveloper={isDeveloper}
                  onViewAs={viewAs}
                  onRefresh={() => mutate(listKey)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/40">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border-white/10 text-white/70 hover:bg-white/[0.05]">
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="border-white/10 text-white/70 hover:bg-white/[0.05]">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function AddUserPanel({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState("")
  const [clinic, setClinic] = useState("")
  const [sendInvite, setSendInvite] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, clinic_name: clinic || undefined, send_invite: sendInvite }),
    })
    const body = await res.json().catch(() => ({}))
    setSubmitting(false)
    if (!res.ok) {
      toast.error(body.error ?? "Failed to create user")
      return
    }
    toast.success(sendInvite && body.invite_url ? "User created. Invite link copied to console." : "User created")
    if (body.invite_url) console.log("Invite link:", body.invite_url)
    onCreated()
    onClose()
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.03] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Add User</h3>
        <button type="button" onClick={onClose} className="text-xs text-white/40 hover:text-white">cancel</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="email" required placeholder="user@clinic.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30" />
        <Input placeholder="Clinic name (optional)" value={clinic} onChange={(e) => setClinic(e.target.value)} className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30" />
      </div>
      <label className="flex items-center gap-2 text-xs text-white/70">
        <input type="checkbox" checked={sendInvite} onChange={(e) => setSendInvite(e.target.checked)} />
        Generate magic-link invite (logged to console)
      </label>
      <Button type="submit" disabled={submitting} className="bg-[#55E039] text-[#0a0a0a] hover:brightness-110">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create user"}
      </Button>
    </form>
  )
}

function UserRow({
  user,
  isExpanded,
  onToggle,
  isDeveloper,
  onViewAs,
  onRefresh,
}: {
  user: AdminUser
  isExpanded: boolean
  onToggle: () => void
  isDeveloper: boolean
  onViewAs: (id: string, mode: "read" | "write") => void
  onRefresh: () => void
}) {
  return (
    <>
      <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
        <td className="px-4 py-3 cursor-pointer" onClick={onToggle}>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
        </td>
        <td className="px-4 py-3 text-white/80 cursor-pointer" onClick={onToggle}>{user.email}</td>
        <td className="px-4 py-3 text-white/50 cursor-pointer" onClick={onToggle}>{user.clinic_name || "-"}</td>
        <td className="px-4 py-3 cursor-pointer" onClick={onToggle}><StatusBadge status={user.subscription_status} /></td>
        <td className="px-4 py-3 cursor-pointer" onClick={onToggle}>
          <span className="inline-flex items-center gap-1">
            <ScanSearch className="h-3 w-3 text-white/30" />
            <span className="text-white/70">{user.scan_count}</span>
          </span>
        </td>
        <td className="px-4 py-3 text-white/40 text-xs cursor-pointer" onClick={onToggle}>
          {user.last_scan_at ? formatRelative(user.last_scan_at) : "-"}
        </td>
        <td className="px-4 py-3 text-white/40 text-xs cursor-pointer" onClick={onToggle}>
          {new Date(user.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
          <button
            onClick={() => onViewAs(user.id, "read")}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/70 hover:bg-white/[0.08] mr-1"
            title="Read-only impersonation"
          >
            <Eye className="h-3 w-3" /> read
          </button>
          {isDeveloper && (
            <button
              onClick={() => onViewAs(user.id, "write")}
              className="inline-flex items-center gap-1 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400 hover:bg-yellow-500/20"
              title="Full-write impersonation"
            >
              <AlertTriangle className="h-3 w-3" /> write
            </button>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-white/5">
          <td colSpan={8} className="px-4 py-0">
            <UserExpandedRow userId={user.id} subscriptionStatus={user.subscription_status} isDeveloper={isDeveloper} onRefresh={onRefresh} />
          </td>
        </tr>
      )}
    </>
  )
}

function UserExpandedRow({
  userId,
  subscriptionStatus,
  isDeveloper,
  onRefresh,
}: {
  userId: string
  subscriptionStatus: string
  isDeveloper: boolean
  onRefresh: () => void
}) {
  const { data, isLoading } = useSWR<UserDetail>(`/api/admin/users/${userId}/detail`, fetcher)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(subscriptionStatus)

  async function saveStatus() {
    setSaving(true)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription_status: status }),
    })
    const body = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      toast.error(body.error ?? "Update failed")
      return
    }
    toast.success("Subscription status updated")
    onRefresh()
  }

  async function deleteUser() {
    if (!confirm("Delete this user and all their data? This cannot be undone.")) return
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast.error(body.error ?? "Delete failed")
      return
    }
    toast.success("User deleted")
    onRefresh()
  }

  if (isLoading) {
    return (
      <div className="py-4 flex items-center gap-2 text-white/40">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading user details...
      </div>
    )
  }

  if (!data) {
    return <div className="py-4 text-sm text-white/40">Failed to load details.</div>
  }

  return (
    <div className="py-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={<Calendar className="h-3.5 w-3.5 text-white/30" />} label="Member Since" value={new Date(data.subscriptionDates.created_at).toLocaleDateString()} />
        <Stat icon={<CreditCard className="h-3.5 w-3.5 text-white/30" />} label="Status" value={<StatusBadge status={data.subscriptionDates.subscription_status} />} />
        <Stat icon={<ScanSearch className="h-3.5 w-3.5 text-white/30" />} label="Scans This Month" value={data.scansThisMonth} />
      </div>

      {isDeveloper && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/[0.03] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Edit3 className="h-3.5 w-3.5 text-yellow-400" />
            <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-[0.15em]">Billing Controls (developer)</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
            >
              {["active", "past_due", "cancelled", "inactive"].map((s) => (
                <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>
              ))}
            </select>
            <Button size="sm" onClick={saveStatus} disabled={saving || status === subscriptionStatus} className="bg-yellow-500/80 text-[#0a0a0a] hover:bg-yellow-500">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Update status"}
            </Button>
            <button
              onClick={deleteUser}
              className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 ml-auto"
            >
              <Trash2 className="h-3 w-3" /> Delete user
            </button>
          </div>
        </div>
      )}

      {data.recentScans.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.15em] mb-2">Last 5 Scans</p>
          <div className="space-y-1.5">
            {data.recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs">
                <span className="text-white/50 capitalize">{scan.content_type.replace(/_/g, " ")}</span>
                <span>
                  <span className="text-white/40 mr-1">Score:</span>
                  <span className={(scan.compliance_score || 0) >= 80 ? "text-[#55E039] font-medium" : (scan.compliance_score || 0) >= 50 ? "text-yellow-400 font-medium" : "text-red-400 font-medium"}>
                    {scan.compliance_score ?? "N/A"}%
                  </span>
                </span>
                <span className="text-white/40">{scan.flag_count} flag{scan.flag_count !== 1 ? "s" : ""}</span>
                <span className="text-white/30">{new Date(scan.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-[10px] font-bold text-[#55E039] uppercase tracking-[0.15em]">{label}</p>
      </div>
      <p className="text-sm font-medium text-white/80">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20",
    inactive: "bg-white/5 text-white/40 border-white/10",
    past_due: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  }
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${colors[status] || colors.inactive}`}>
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
