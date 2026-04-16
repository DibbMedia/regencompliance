"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { ShieldPlus, Trash2, Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Admin {
  id: string
  email: string
  role: "developer" | "support"
  added_by: string | null
  added_at: string
}

export default function AdminsPage() {
  const { data, isLoading } = useSWR<{ admins: Admin[] }>("/api/admin/admins", fetcher)
  const [adding, setAdding] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"developer" | "support">("support")
  const [err, setErr] = useState<string | null>(null)

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setAdding(true)
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    })
    const body = await res.json()
    setAdding(false)
    if (!res.ok) {
      setErr(body.error ?? "Failed to add admin")
      return
    }
    setEmail("")
    setRole("support")
    mutate("/api/admin/admins")
  }

  async function changeRole(id: string, newRole: "developer" | "support") {
    await fetch(`/api/admin/admins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    mutate("/api/admin/admins")
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Remove ${email} from platform admins?`)) return
    await fetch(`/api/admin/admins/${id}`, { method: "DELETE" })
    mutate("/api/admin/admins")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Admins</h1>
        <p className="text-sm text-white/40 mt-1">
          Developer = full write impersonation + admin management. Support = read-only impersonation.
        </p>
      </div>

      <form onSubmit={add} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 min-w-[240px] bg-white/[0.03] border-white/10 text-white placeholder:text-white/30"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "developer" | "support")}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#55E039]/50"
        >
          <option value="support" className="bg-[#0a0a0a]">Support (read-only)</option>
          <option value="developer" className="bg-[#0a0a0a]">Developer (full write)</option>
        </select>
        <Button type="submit" disabled={adding} className="bg-[#55E039] text-[#0a0a0a] hover:brightness-110">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
          Add
        </Button>
      </form>
      {err && <p className="text-sm text-red-400">{err}</p>}

      <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-medium text-white/40">Email</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Role</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Added By</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40">Added</th>
              <th className="px-4 py-3 text-xs font-medium text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                  <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                </td>
              </tr>
            ) : (data?.admins ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                  <ShieldPlus className="h-6 w-6 mx-auto mb-2 text-white/20" />
                  No admins. Add the first one above.
                </td>
              </tr>
            ) : (
              (data?.admins ?? []).map((a) => (
                <tr key={a.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white/80">{a.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={a.role}
                      onChange={(e) => changeRole(a.id, e.target.value as "developer" | "support")}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white"
                    >
                      <option value="support" className="bg-[#0a0a0a]">support</option>
                      <option value="developer" className="bg-[#0a0a0a]">developer</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{a.added_by ?? "—"}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {new Date(a.added_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(a.id, a.email)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
