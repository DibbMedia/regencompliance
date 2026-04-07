"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { UserPlus, Trash2, Copy, Check, Loader2, Users, AlertTriangle, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { TeamMember } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TeamPage() {
  const { data } = useSWR("/api/team", fetcher)
  const members: TeamMember[] = data?.members || []
  const seatCount = members.length + 1 // +1 for owner
  const maxSeats = 3
  const seatPercent = (seatCount / maxSeats) * 100

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleInvite() {
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteUrl(null)

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to create invite")
        return
      }

      setInviteUrl(data.invite_url)
      mutate("/api/team")
    } catch {
      toast.error("Network error")
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(id: string) {
    setRemoving(id)
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to remove member")
        return
      }
      toast.success("Member removed")
      mutate("/api/team")
    } catch {
      toast.error("Network error")
    } finally {
      setRemoving(null)
    }
  }

  function copyInvite() {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <p className="text-white/60 mt-1">Manage your team and invite new members.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) { setInviteEmail(""); setInviteUrl(null) }
        }}>
          <DialogTrigger
            disabled={seatCount >= maxSeats}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-bold text-sm shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </DialogTrigger>
          <DialogContent className="bg-[#141414] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Invite Team Member</DialogTitle>
              <DialogDescription className="text-white/50">
                Generate a magic link to invite a team member. No email is sent automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                type="email"
                placeholder="team@yourclinic.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#55E039]/50 focus:ring-[#55E039]/20"
              />
              {!inviteUrl ? (
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-bold text-sm shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Generate Invite Link
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={inviteUrl}
                      readOnly
                      className="bg-white/[0.03] border-white/10 text-white/70 text-xs"
                    />
                    <button
                      onClick={copyInvite}
                      className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] hover:bg-[#55E039]/[0.08] transition-all"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-white/40">
                    Send this link directly. Expires in 7 days.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── SEATS ── */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Seats</p>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#55E039]/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#55E039]" />
              </div>
              <div>
                <h3 className="text-white font-bold">{seatCount} of {maxSeats} seats used</h3>
                <p className="text-white/50 text-sm">{maxSeats - seatCount} seat{maxSeats - seatCount !== 1 ? "s" : ""} remaining</p>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#55E039] to-[#3BB82A] rounded-full transition-all duration-500"
              style={{ width: `${seatPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── TEAM MEMBERS ── */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Members</p>

        {members.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/70 font-medium">No team members yet</p>
            <p className="text-white/40 text-sm mt-1">Invite your first team member to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m) => {
              const initials = m.email.slice(0, 2).toUpperCase()
              const isPending = !m.accepted

              return (
                <div
                  key={m.id}
                  className={`bg-white/[0.03] border rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:bg-white/[0.06] ${
                    isPending
                      ? "border-dashed border-white/10"
                      : "border-white/10 hover:border-white/15"
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isPending
                      ? "bg-yellow-500/10 text-yellow-500 border border-dashed border-yellow-500/30"
                      : "bg-[#55E039]/10 text-[#55E039]"
                  }`}>
                    {isPending ? <Mail className="h-4 w-4" /> : initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm truncate">{m.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-white/[0.06] text-white/50 border-white/10 text-xs capitalize">
                        {m.role}
                      </Badge>
                      {isPending ? (
                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs">
                          Pending
                        </Badge>
                      ) : (
                        <Badge className="bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Remove */}
                  <AlertDialog>
                    <AlertDialogTrigger
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
                      disabled={removing === m.id}
                    >
                      {removing === m.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#141414] border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Remove team member?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/50">
                          This will revoke access for <strong className="text-white/70">{m.email}</strong>. They will no longer be able to access your clinic&apos;s compliance data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06] hover:text-white">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemove(m.id)}
                          className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Remove Member
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
