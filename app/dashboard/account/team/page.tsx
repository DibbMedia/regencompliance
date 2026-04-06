"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { UserPlus, Trash2, Copy, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { TeamMember } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TeamPage() {
  const { data } = useSWR("/api/team", fetcher)
  const members: TeamMember[] = data?.members || []
  const seatCount = members.length + 1 // +1 for owner
  const maxSeats = 3

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
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Team Members</h2>
        <p className="text-muted-foreground">Manage your team and invite new members.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{seatCount} of {maxSeats} seats used</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) { setInviteEmail(""); setInviteUrl(null) }
            }}>
              <DialogTrigger
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
                disabled={seatCount >= maxSeats}
              >
                <UserPlus className="h-3 w-3" />
                Invite Member
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Generate a magic link to invite a team member. No email is sent automatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="team@yourclinic.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  {!inviteUrl ? (
                    <Button onClick={handleInvite} className="w-full" disabled={inviting || !inviteEmail.trim()}>
                      {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate Invite Link
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input value={inviteUrl} readOnly className="text-xs" />
                        <Button variant="outline" size="icon" onClick={copyInvite}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Send this link directly. Expires in 7 days.
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Progress value={(seatCount / maxSeats) * 100} className="h-2" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {m.email.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{m.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs capitalize">{m.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={m.accepted ? "text-green-600" : "text-yellow-600"}
                    >
                      {m.accepted ? "Active" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleRemove(m.id)}
                      disabled={removing === m.id}
                    >
                      {removing === m.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No team members yet. Invite your first member above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
