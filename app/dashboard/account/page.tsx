"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ExternalLink, Shield, Crown, X, Plus, Users, CreditCard, AlertTriangle, Download, Trash2, Award, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import Link from "next/link"

const TREATMENTS = [
  { slug: "prp", label: "PRP" },
  { slug: "stem_cell", label: "Stem Cell" },
  { slug: "exosomes", label: "Exosomes" },
  { slug: "bmac", label: "BMAC" },
  { slug: "whartons_jelly", label: "Wharton's Jelly" },
  { slug: "prolotherapy", label: "Prolotherapy" },
  { slug: "peptide", label: "Peptide" },
  { slug: "other", label: "Other" },
]

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState("")
  const [clinicName, setClinicName] = useState("")
  const [treatments, setTreatments] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [role, setRole] = useState("owner")
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || "")

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (p) {
        setProfile(p as Profile)
        setClinicName(p.clinic_name || "")
        setTreatments(p.treatments || [])
      }

      const { data: member } = await supabase
        .from("team_members")
        .select("role")
        .eq("user_id", user.id)
        .single()

      if (member) setRole(member.role)
    }
    load()
  }, [supabase])

  async function saveProfile(updates: Record<string, unknown>) {
    setSaving(true)
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      setProfile(data)
      toast.success("Profile updated")
    } else {
      toast.error("Failed to save")
    }
  }

  function toggleTreatment(slug: string) {
    const updated = treatments.includes(slug)
      ? treatments.filter((t) => t !== slug)
      : [...treatments, slug]
    setTreatments(updated)
    saveProfile({ treatments: updated })
  }

  async function handleCheckout() {
    setCheckoutLoading(true)
    const res = await fetch("/api/stripe/checkout", { method: "POST" })
    const data = await res.json()
    setCheckoutLoading(false)
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error(data.error || "Failed to start checkout")
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    const res = await fetch("/api/stripe/portal", { method: "POST" })
    const data = await res.json()
    setPortalLoading(false)
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error(data.error || "Failed to open billing portal")
    }
  }

  async function handleExport() {
    setExportLoading(true)
    try {
      const res = await fetch("/api/user/export", { method: "POST" })
      if (!res.ok) {
        toast.error("Failed to export data")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "regencompliance-data-export.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Data exported successfully")
    } catch {
      toast.error("Failed to export data")
    } finally {
      setExportLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to delete account")
        return
      }
      toast.success("Account deleted. Redirecting...")
      router.push("/")
    } catch {
      toast.error("Failed to delete account")
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    )
  }

  const isBeta = profile.is_beta_subscriber
  const isActive = profile.subscription_status === "active"
  const hasStripeCustomer = !!profile.stripe_customer_id

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">Account</p>
        <h1 className="text-3xl font-bold text-white">Account & Billing</h1>
        <p className="text-white/60 mt-1">Manage your clinic profile, subscription, and team.</p>
      </div>

      {/* ── PROFILE SECTION ── */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Clinic Profile</p>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-6 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
          {/* Display info row */}
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#55E039] to-[#3BB82A] flex items-center justify-center text-[#0a0a0a] font-bold text-lg shrink-0">
              {(clinicName || "C").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg truncate">{clinicName || "Your Clinic"}</h3>
              <p className="text-white/65 text-sm">{email}</p>
            </div>
            {saving && <Loader2 className="h-4 w-4 animate-spin text-[#55E039] shrink-0" />}
          </div>

          {/* Clinic Name Input */}
          <div className="space-y-2">
            <Label className="text-white/70 text-sm">Clinic Name</Label>
            <Input
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              onBlur={() => {
                if (clinicName !== profile.clinic_name) {
                  saveProfile({ clinic_name: clinicName })
                }
              }}
              disabled={role === "member"}
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus:border-[#55E039]/50 focus:ring-[#55E039]/20 rounded-lg"
              placeholder="Enter your clinic name"
            />
          </div>

          {/* Treatments as pills */}
          <div className="space-y-3">
            <Label className="text-white/70 text-sm">Treatments</Label>
            <div className="flex flex-wrap gap-2">
              {TREATMENTS.map((t) => {
                const selected = treatments.includes(t.slug)
                return (
                  <button
                    key={t.slug}
                    onClick={() => { if (role !== "member") toggleTreatment(t.slug) }}
                    disabled={role === "member"}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                      selected
                        ? "bg-[#55E039]/10 border-[#55E039]/30 text-[#55E039] shadow-[0_0_10px_rgba(85,224,57,0.1)]"
                        : "bg-white/[0.03] border-white/10 text-white/70 hover:border-white/20 hover:text-white",
                      role === "member" && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {selected ? (
                      <X className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── SUBSCRIPTION SECTION ── */}
      {role === "owner" && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Subscription</p>

          {isBeta ? (
            /* Beta Subscription Card — $297/mo locked-in rate */
            <div className="relative bg-white/[0.03] border border-[#55E039]/20 rounded-xl p-6 overflow-hidden shadow-[0_0_40px_rgba(85,224,57,0.08)]">
              {/* Subtle glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#55E039]/[0.04] to-transparent pointer-events-none" />
              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#55E039]/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[#55E039]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold">Beta — $297/mo Locked-In Rate</h3>
                      <Badge className="bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20 text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Founding Member
                      </Badge>
                    </div>
                    <p className="text-white/70 text-sm mt-0.5">Your rate is locked at $297/mo for life — it will never increase</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#55E039]/[0.06] rounded-lg border border-[#55E039]/10">
                  <Shield className="h-4 w-4 text-[#55E039]" />
                  <span className="text-sm text-[#55E039]">$297/mo locked in — standard rate is $497/mo</span>
                </div>
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] text-sm font-medium hover:bg-[#55E039]/[0.08] transition-all duration-200"
                >
                  {portalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  Manage Billing & Payment Method
                </button>
              </div>
            </div>
          ) : isActive && hasStripeCustomer ? (
            /* Active Subscriber Card */
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#55E039]/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-[#55E039]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">RegenCompliance Pro</h3>
                    <p className="text-white/70 text-sm">$497/month</p>
                  </div>
                </div>
                <Badge className="bg-[#55E039]/10 text-[#55E039] border-[#55E039]/20">Active</Badge>
              </div>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] text-sm font-medium hover:bg-[#55E039]/[0.08] transition-all duration-200"
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Manage Billing & Payment Method
              </button>
            </div>
          ) : (
            /* Subscribe CTA */
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white/40" />
                </div>
                <div>
                  <h3 className="text-white font-bold">RegenCompliance Pro</h3>
                  <p className="text-white/70 text-sm">Full compliance scanning, alerts, and team access</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold text-white">$497</span>
                <span className="text-white/65">/month</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[#0a0a0a] font-bold text-sm shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] transition-all duration-300"
              >
                {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Subscribe Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Member view */}
      {role === "member" && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-white/70">
            You are a member of <strong className="text-white">{profile.clinic_name}</strong>&apos;s account.
          </p>
        </div>
      )}

      {/* ── TEAM SECTION ── */}
      {role === "owner" && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Team</p>

          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 flex items-center justify-between hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
                <Users className="h-5 w-5 text-white/40" />
              </div>
              <div>
                <h3 className="text-white font-bold">Team Members</h3>
                <p className="text-white/70 text-sm">Manage access for your clinic staff</p>
              </div>
            </div>
            <Link
              href="/dashboard/account/team"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] text-sm font-medium hover:bg-[#55E039]/[0.08] transition-all duration-200"
            >
              Manage Team
            </Link>
          </div>
        </div>
      )}

      {/* ── COMPLIANCE BADGE SECTION ── */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Compliance Badge</p>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 flex items-center justify-between hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#55E039]/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-[#55E039]" />
            </div>
            <div>
              <h3 className="text-white font-bold">Verified Compliance Badge</h3>
              <p className="text-white/70 text-sm">Display your compliance status on your clinic website</p>
            </div>
          </div>
          <Link
            href="/dashboard/badge"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] text-sm font-medium hover:bg-[#55E039]/[0.08] transition-all duration-200"
          >
            Manage Badge
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── DATA & PRIVACY ── */}
      {role === "owner" && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">Data & Privacy</p>

          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4 shadow-[0_0_30px_rgba(85,224,57,0.05)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#55E039]/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-[#55E039]" />
              </div>
              <div>
                <h3 className="text-white font-bold">Export My Data</h3>
                <p className="text-white/70 text-sm">Download all your data as a JSON file (GDPR compliant)</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#55E039]/20 bg-[#55E039]/[0.04] text-[#55E039] text-sm font-medium hover:bg-[#55E039]/[0.08] transition-all duration-200"
            >
              {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Export My Data
            </button>
          </div>
        </div>
      )}

      {/* ── DANGER ZONE ── */}
      {role === "owner" && (
        <div className="space-y-4">
          <p className="text-xs font-bold text-red-500 uppercase tracking-[0.2em]">Danger Zone</p>

          {isActive && !isBeta && (
            <div className="bg-red-500/[0.04] border border-red-500/20 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Cancel Subscription</h3>
                  <p className="text-white/70 text-sm">This will cancel your subscription at the end of the current billing period</p>
                </div>
              </div>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all duration-200"
              >
                {portalLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Cancel Subscription
              </button>
            </div>
          )}

          <div className="bg-red-500/[0.04] border border-red-500/20 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-bold">Delete My Account</h3>
                <p className="text-white/50 text-sm">Permanently delete your account, all scans, tickets, and data. This cannot be undone.</p>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
                Delete My Account
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-red-500/[0.06] border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 font-medium">
                  Are you absolutely sure? This will permanently delete your account, cancel any active subscription, and remove all your data. This action cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all duration-200"
                  >
                    {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-white/10 text-white/60 text-sm font-medium hover:text-white hover:border-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
