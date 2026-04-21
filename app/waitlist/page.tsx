"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2, CheckCircle2, Shield, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MarketingBg } from "@/components/marketing-bg"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { waitlistSchema, type WaitlistInput } from "@/lib/validations"

export default function WaitlistPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { name: "", email: "" },
  })

  async function onSubmit(values: WaitlistInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/waitlist", {
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
        {/* Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/20 bg-[#55E039]/[0.04] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#55E039] shadow-[0_0_30px_rgba(85,224,57,0.08)]">
            <Sparkles className="h-3 w-3" />
            Pre-Release
          </div>
        </div>

        {/* Hero copy */}
        <div className="mt-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Get early access to{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#3BB82A] bg-clip-text text-transparent">
              RegenCompliance
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/60 max-w-xl mx-auto">
            FDA &amp; FTC compliance scanning built for regenerative medicine clinics.
            Join the waitlist and we&apos;ll reach out the moment a seat opens up.
          </p>
        </div>

        {/* Card */}
        <div className="mt-10 mx-auto max-w-md">
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
                  <h2 className="mt-5 text-xl font-bold text-white">You&apos;re on the list</h2>
                  <p className="mt-2 text-sm text-white/60 max-w-xs">
                    Thanks for signing up. We&apos;ll email you the moment your invite is ready.
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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          Join the waitlist
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-white/60">
                      No spam. We&apos;ll only email you when your invite is ready.
                    </p>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-[#55E039]" />
            FDA &amp; FTC rules updated daily
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-[#55E039]" />
            Built for regen medicine clinics
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-[#55E039]" />
            SOC2-aligned controls
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
