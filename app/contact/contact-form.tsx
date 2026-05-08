"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2, CheckCircle2, MessageSquare, Clock, Users } from "lucide-react"
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
import { contactFormSchema, type ContactFormInput } from "@/lib/validations"

const SUBJECT_LABELS: Record<NonNullable<ContactFormInput["subject"]>, string> = {
  general: "General question",
  sales: "Sales",
  support: "Support",
  beta: "Beta program",
  press: "Press",
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
      accept_terms: false as unknown as true,
    },
  })

  async function onSubmit(values: ContactFormInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
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
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/20 bg-[#55E039]/[0.04] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#55E039] shadow-[0_0_30px_rgba(85,224,57,0.08)]">
            <MessageSquare className="h-3 w-3" />
            Contact us
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Get in{" "}
            <span className="bg-gradient-to-r from-[#55E039] to-[#3BB82A] bg-clip-text text-transparent">
              touch
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/60 max-w-xl mx-auto">
            Questions about the product, the beta, sales, or compliance generally - send us a note and we&apos;ll get back to you.
          </p>
        </div>

        {/* About + hours card */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-[#55E039]" />
                <p className="text-sm font-bold text-white">Business hours</p>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                8am - 5pm Eastern, Monday through Friday. We aim to respond to inquiries within one business day.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-[#55E039]" />
                <p className="text-sm font-bold text-white">About us</p>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                RegenCompliance is built by a small team focused on FDA/FTC compliance scanning for healthcare practices. We read every message ourselves.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[#55E039]/30 to-transparent opacity-40 blur-sm" />
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-6 sm:p-8 backdrop-blur-xl">
              {submitted ? (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-[#55E039]/20 blur-xl" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#55E039]/10 border border-[#55E039]/30">
                      <CheckCircle2 className="h-8 w-8 text-[#55E039]" />
                    </div>
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-white">Message received</h2>
                  <p className="mt-2 text-sm text-white/65 max-w-sm">
                    Thanks - we&apos;ve got your note. We typically reply within one business day (8am-5pm ET, Mon-Fri). If your question is urgent, mention that in a follow-up.
                  </p>
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
                              className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/50 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
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
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@yourclinic.com"
                              autoComplete="email"
                              disabled={loading}
                              className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/50 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Clinic or company (optional)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Acme Regenerative Health"
                              autoComplete="organization"
                              disabled={loading}
                              className="h-11 bg-white/[0.03] border-white/10 text-white placeholder:text-white/50 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Subject
                          </FormLabel>
                          <Select disabled={loading} onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white/[0.03] border-white/10 text-white">
                                <SelectValue placeholder="Pick one (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
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
                      name="message"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                            Message
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us what you're working on, what you need, or what question you'd like answered."
                              disabled={loading}
                              rows={6}
                              maxLength={2000}
                              className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/50 focus-visible:border-[#55E039]/40 focus-visible:ring-[#55E039]/20"
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
                                I understand RegenCompliance will use my submission only to respond to this inquiry.
                              </FormLabel>
                              <FormMessage className="mt-2" />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send message
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
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
