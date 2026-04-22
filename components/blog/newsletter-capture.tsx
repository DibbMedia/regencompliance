"use client"

import { useState } from "react"
import { Mail, ArrowRight, Check } from "lucide-react"

export function NewsletterCapture({
  sourceSlug,
  heading = "Weekly compliance brief",
  subheading = "One email a week. New enforcement actions, rule changes, and tactical fixes. No spam, unsubscribe anytime.",
}: {
  sourceSlug?: string
  heading?: string
  subheading?: string
}) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "loading") return

    const trimmed = email.trim()
    if (!trimmed) {
      setStatus("error")
      setMessage("Enter an email address.")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source: "blog",
          sourceSlug,
        }),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setStatus("error")
        setMessage(json.error || "Something went wrong. Try again.")
        return
      }

      setStatus("success")
      setMessage(
        json.alreadySubscribed
          ? "You're already on the list."
          : "You're in. Check your inbox for the next issue."
      )
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Network error. Try again.")
    }
  }

  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-3xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-4 w-4 text-[#55E039]/80" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55E039]">
              {heading}
            </p>
          </div>
          <p className="text-sm text-white/70 leading-relaxed max-w-xl">
            {subheading}
          </p>

          <form onSubmit={onSubmit} className="mt-5 flex flex-col sm:flex-row gap-3">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={200}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@clinic.com"
              disabled={status === "loading" || status === "success"}
              className="flex-1 h-11 rounded-xl border border-white/15 bg-[#0a0a0a]/50 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#55E039]/50 focus:ring-2 focus:ring-[#55E039]/20 transition-colors disabled:opacity-60"
              aria-describedby="newsletter-status"
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-5 text-sm font-bold text-[#0a0a0a] shadow-lg shadow-[#55E039]/20 hover:shadow-[#55E039]/40 hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                "Subscribing..."
              ) : status === "success" ? (
                <>
                  <Check className="h-4 w-4" />
                  Subscribed
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <p
            id="newsletter-status"
            role="status"
            aria-live="polite"
            className={`mt-3 text-xs min-h-[1rem] ${
              status === "error"
                ? "text-red-400"
                : status === "success"
                ? "text-[#55E039]"
                : "text-white/50"
            }`}
          >
            {message || "We only send one email per week. No marketing blasts."}
          </p>
        </div>
      </div>
    </section>
  )
}
