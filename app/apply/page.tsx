"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2, CheckCircle2, Sparkles, Video, MessageSquareText, Activity, Lock } from "lucide-react"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MarketingBg } from "@/components/marketing-bg"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { betaApplicationSchema, type BetaApplicationInput } from "@/lib/validations"

const SPECIALTY_LABELS: Record<BetaApplicationInput["specialty"], string> = {
  regen_medicine: "Regenerative medicine",
  med_spa: "Med spa",
  weight_loss: "Weight loss clinic",
  dental: "Dental practice",
  dermatology: "Dermatology",
  aesthetic_plastic: "Aesthetic / plastic surgery",
  iv_therapy: "IV therapy",
  hormone_bhrt: "Hormone / BHRT",
  chiropractic: "Chiropractic",
  wellness: "Wellness / longevity",
  other: "Other",
}

const ROLE_LABELS: Record<BetaApplicationInput["role"], string> = {
  owner: "Owner / founder",
  practice_manager: "Practice manager",
  marketing_lead: "Marketing lead",
  content_writer: "Content writer / copywriter",
  agency_partner: "Agency partner",
  compliance_officer: "Compliance officer",
  other: "Other",
}

const VOLUME_LABELS: Record<BetaApplicationInput["monthly_volume"], string> = {
  "0-5": "0-5 marketing pieces / month",
  "6-15": "6-15 / month",
  "16-50": "16-50 / month",
  "50+": "50+ / month",
}

export default function BetaApplyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<BetaApplicationInput>({
    resolver: zodResolver(betaApplicationSchema),
    defaultValues: {
      name: "",
      email: "",
      clinic_name: "",
      website: "",
      why_apply: "",
      accept_terms: false as unknown as true,
    },
  })

  async function onSubmit(values: BetaApplicationInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/beta-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.error || "Something went wrong. Please try again.")
        setLoading(false)
        return
      }

      setAlreadyApplied(Boolean(data?.alreadyApplied))
      setSubmitted(true)
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      <MarketingBg />
      <MarketingHeader />

      <main className="relative z-10 mx-auto max-w-3xl px-6 pt-32 pb-20">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/20 bg-[#55E039]/[0.04] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#55E039] shadow-[0_0_30px_rgba(85,224,57,0.08)]">
            <Sparkles className="h-3 w-3" />
            Founder Beta - 25 seats
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Apply to be a{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#3BB82A] bg-clip-text text-transparent">
              beta tester
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/60 max-w-xl mx-auto">
            Founder beta is capped at 25 clinics. $297/mo locked in for life. Tell us a bit about your practice and we&apos;ll reach out within 48 hours.
          </p>
          <p className="mt-3 text-sm text-white/65">
            Not ready to commit?{" "}
            <Link href="/waitlist" className="text-[#55E039] hover:text-[#6FF055] font-semibold transition-colors">
              Join the waitlist
            </Link>{" "}
            instead.
          </p>
        </div>

        {/* What you commit to */}
        <div className="mt-10 rounded-2xl border border-white/15 bg-white/[0.06] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-white">What you commit to as a founder</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#55E039]/20 bg-[#55E039]/[0.06] px-3 py-1 text-[11px] font-bold text-[#55E039]">
              <Lock className="h-3 w-3" />
              $297/mo for life
            </span>
          </div>
          <p className="text-sm text-white/80 mb-6 max-w-2xl leading-relaxed">
            Founder pricing is a partnership, not a discount. We need clinics who will genuinely use the tool and help shape it. In exchange, you get founder pricing locked in for life.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-white/[0.05] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-[#55E039]" />
                <p className="text-sm font-bold text-white">Actively use it</p>
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                Run real scans on real marketing every week. We&apos;ll see usage and reach out if it stalls.
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.05] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4 text-[#55E039]" />
                <p className="text-sm font-bold text-white">Monthly Zoom check-in</p>
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                Roughly 30 minutes once a month. Walk us through what&apos;s working and what isn&apos;t.
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.05] p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareText className="h-4 w-4 text-[#55E039]" />
                <p className="text-sm font-bold text-white">File feedback</p>
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                Bugs, missing rules, ideas - drop them in support tickets so we can act on them.
              </p>
            </div>
          </div>
          <p className="mt-5 text-xs text-white/70 leading-relaxed">
            <span className="font-bold text-white">In exchange:</span> $297/mo locked for the lifetime of your subscription, founder badge in-app, direct line to the team. <span className="font-bold text-white">If you go inactive</span> (no scans for 60+ days, missed check-ins) we&apos;ll reach out, and if there&apos;s no response we move you to standard pricing ($497/mo) so the seat opens up for someone who wants it.
          </p>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#55E039]/30 to-transparent opacity-40 blur-sm" />
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl">
              {submitted ? (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-[#55E039]/20 blur-xl" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#55E039]/10 border border-[#55E039]/30">
                      <CheckCircle2 className="h-8 w-8 text-[#55E039]" />
                    </div>
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-white">
                    {alreadyApplied ? "We already have your application" : "Application received"}
                  </h2>
                  <p className="mt-2 text-sm text-white/60 max-w-sm">
                    {alreadyApplied
                      ? "Looks like you've already applied with this email. We're still reviewing - we'll reach out within 48 hours if you're a fit for one of the 25 founder seats. If anything's changed about your application, email seo@dibbmedia.com and we'll update it manually."
                      : "Thanks - we'll review your application and reach out within 48 hours. If you're a fit for one of the 25 founder seats, we'll send a personal invite link."}
                  </p>
                  <Link
                    href="/"
                    className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.08] transition-all"
                  >
                    Back to home
                  </Link>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Your name
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Dr. Jane Smith"
                              autoComplete="name"
                              disabled={loading}
                              className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Work email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@yourclinic.com"
                              autoComplete="email"
                              disabled={loading}
                              className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clinic_name"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Clinic or practice name
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Acme Regenerative Health"
                              autoComplete="organization"
                              disabled={loading}
                              className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Specialty
                          </FormLabel>
                          <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white/[0.03] border-white/10 text-white">
                                <SelectValue placeholder="Pick one" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(SPECIALTY_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Your role
                          </FormLabel>
                          <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white/[0.03] border-white/10 text-white">
                                <SelectValue placeholder="Pick one" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Website (optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://yourclinic.com"
                              autoComplete="url"
                              disabled={loading}
                              className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="monthly_volume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Marketing volume
                          </FormLabel>
                          <Select disabled={loading} onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white/[0.03] border-white/10 text-white">
                                <SelectValue placeholder="Pick one" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(VOLUME_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="why_apply"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Why are you applying?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What compliance pain are you trying to solve? What does your current process look like? Anything else we should know."
                              disabled={loading}
                              rows={5}
                              maxLength={1000}
                              className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accept_terms"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                          <div className="flex items-start gap-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value === true}
                                onCheckedChange={(v: boolean | "indeterminate") => field.onChange(v === true)}
                                disabled={loading}
                                className="mt-0.5 border-white/30 data-[state=checked]:bg-[#55E039] data-[state=checked]:border-[#55E039] data-[state=checked]:text-[#0a0a0a]"
                              />
                            </FormControl>
                            <div className="flex-1">
                              <FormLabel className="text-sm font-semibold text-white leading-relaxed cursor-pointer">
                                I agree to the founder-beta expectations
                              </FormLabel>
                              <p className="mt-1 text-xs text-white/50 leading-relaxed">
                                I&apos;ll use RegenCompliance actively, join a roughly monthly Zoom, and file feedback via support tickets. I understand $297/mo is locked for life as long as I stay engaged - if I go inactive I move to standard pricing.
                              </p>
                              <FormMessage className="mt-2" />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="sm:col-span-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Apply for one of 25 founder seats
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <p className="sm:col-span-2 text-center text-[11px] text-white/60">
                      We review every application personally. No spam, ever.
                    </p>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
