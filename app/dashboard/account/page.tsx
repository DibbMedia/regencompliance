"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Loader2, Sun, Moon, Monitor, ExternalLink, Shield } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { buttonVariants } from "@/components/ui/button"
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
  const { theme, setTheme } = useTheme()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clinicName, setClinicName] = useState("")
  const [treatments, setTreatments] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [role, setRole] = useState("owner")

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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

      // Check if member
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

  async function handleThemeChange(newTheme: string) {
    setTheme(newTheme)
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme_preference: newTheme }),
    })
  }

  const statusColor = {
    active: "bg-[#55E039]/10 text-[#55E039]",
    past_due: "bg-yellow-500/10 text-yellow-500",
    cancelled: "bg-red-500/10 text-red-500",
    inactive: "bg-gray-500/10 text-gray-400",
  }

  function getDisplayStatus(): string {
    if (profile?.is_beta_subscriber) return "Beta Lifetime"
    return (profile?.subscription_status || "inactive").replace("_", " ")
  }

  function getStatusBadgeClass(): string {
    if (profile?.is_beta_subscriber) return "bg-purple-500/10 text-purple-400"
    return statusColor[profile?.subscription_status as keyof typeof statusColor] || statusColor.inactive
  }

  if (!profile) return null

  const isBeta = profile.is_beta_subscriber
  const isActive = profile.subscription_status === "active"
  const hasStripeCustomer = !!profile.stripe_customer_id

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Account & Billing</h2>
        <p className="text-muted-foreground">Manage your clinic profile, subscription, and team.</p>
      </div>

      {/* Clinic Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clinic Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Clinic Name</Label>
            <Input
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              onBlur={() => {
                if (clinicName !== profile.clinic_name) {
                  saveProfile({ clinic_name: clinicName })
                }
              }}
              disabled={role === "member"}
            />
          </div>
          <div className="space-y-2">
            <Label>Treatments</Label>
            <div className="grid grid-cols-2 gap-2">
              {TREATMENTS.map((t) => (
                <div key={t.slug} className="flex items-center space-x-2">
                  <Checkbox
                    id={`acct-${t.slug}`}
                    checked={treatments.includes(t.slug)}
                    onCheckedChange={() => toggleTreatment(t.slug)}
                    disabled={role === "member"}
                  />
                  <Label htmlFor={`acct-${t.slug}`} className="text-sm cursor-pointer">{t.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map(({ value, icon: Icon, label }) => (
              <Button
                key={value}
                variant={theme === value ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleThemeChange(value)}
              >
                <Icon className="mr-1 h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing (owner only) */}
      {role === "owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing</CardTitle>
            <CardDescription>
              {isBeta ? "Beta Program" : "RegenCompliance — $497/month"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">Status:</span>
              <Badge className={getStatusBadgeClass()}>
                {isBeta && <Shield className="mr-1 h-3 w-3" />}
                {getDisplayStatus()}
              </Badge>
            </div>

            {isBeta ? (
              <p className="text-sm text-muted-foreground">
                You have lifetime access through the beta program. No billing to manage.
              </p>
            ) : isActive && hasStripeCustomer ? (
              <Button variant="outline" onClick={handlePortal} disabled={portalLoading}>
                {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ExternalLink className="mr-1 h-3 w-3" />
                Manage Billing & Payment Method
              </Button>
            ) : (
              <Button onClick={handleCheckout} disabled={checkoutLoading}>
                {checkoutLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Subscribe Now — $497/month
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Member view */}
      {role === "member" && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              You are a member of <strong>{profile.clinic_name}</strong>&apos;s account.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Team (owner only) */}
      {role === "owner" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/account/team"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Manage Team →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone (owner only, not for beta) */}
      {role === "owner" && isActive && !isBeta && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={handlePortal}>
              Cancel Subscription
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
