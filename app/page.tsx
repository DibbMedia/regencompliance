"use client"

import Link from "next/link"
import { CheckoutButton } from "@/components/checkout-button"
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Scan,
  Pencil,
  BookOpen,
  Clock,
  Users,
  Bell,
  AlertTriangle,
  Zap,
  Lock,
  ShieldCheck,
  Activity,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

const features = [
  { icon: Scan, title: "Live Compliance Scanner", desc: "Instant FDA/FTC compliance scoring on any marketing content your clinic produces." },
  { icon: Pencil, title: "AI-Powered Rewrites", desc: "One click rewrites flagged content to be fully compliant while preserving your voice." },
  { icon: BookOpen, title: "300+ Compliance Rules", desc: "Living database sourced from real FDA warning letters and FTC enforcement actions." },
  { icon: Bell, title: "Daily Rule Updates", desc: "Automated monitoring adds new violations within 24 hours of enforcement." },
  { icon: Clock, title: "Audit Trail + Export", desc: "Every scan is logged. Export PDF compliance reports for legal review." },
  { icon: Users, title: "3 Team Seats", desc: "Extend access to your marketing team, content writer, and front desk." },
]

const libraryExamples = [
  { banned: "heals", alternative: "may support the body's natural healing processes", risk: "HIGH", source: "FDA Warning Letter" },
  { banned: "FDA-approved stem cells", alternative: "performed in an FDA-registered facility", risk: "HIGH", source: "FDA CBER Guidance" },
  { banned: "cures arthritis", alternative: "some patients report reduced joint discomfort", risk: "MEDIUM", source: "FTC Enforcement" },
  { banned: "proven to reverse aging", alternative: "patients report feeling more youthful and energetic", risk: "HIGH", source: "FTC Press Release" },
]

const checklist = [
  "Unlimited compliance scans",
  "AI-powered compliant rewrites",
  "Full compliance library (300+ rules)",
  "Daily FDA/FTC rule updates",
  "Complete audit trail + PDF export",
  "Real-time enforcement alerts",
  "3 team seats included",
  "Light & dark mode dashboard",
]

const faqs = [
  { q: "Is this actual legal advice?", a: "No. RegenCompliance is an educational compliance tool. We strongly recommend having all final content reviewed by qualified healthcare marketing counsel." },
  { q: "Does this access any patient data?", a: "Never. We analyze marketing text only. No PHI, no patient records, no clinical data. Zero HIPAA implications." },
  { q: "How are rules updated?", a: "Daily. Our system monitors FDA warning letters and FTC press releases every morning. New enforcement actions are processed and added automatically." },
  { q: "Who is this for?", a: "Regenerative medicine clinics offering PRP, stem cell therapy, exosomes, BMAC, Wharton's jelly, prolotherapy, and peptide therapy." },
  { q: "What if I cancel?", a: "You keep full access through your billing period. No contracts, no fees, no penalties. Resubscribe anytime." },
]

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#55E039]/[0.04] rounded-full blur-[200px]" />
        <div className="absolute top-[60%] -right-[200px] w-[500px] h-[500px] bg-[#55E039]/[0.02] rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-2xl" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#55E039]">
                <Shield className="h-4 w-4 text-[#0a0a0a]" />
              </div>
              <span className="text-base font-bold">RegenCompliance</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="text-sm text-white/50 hover:text-white transition-colors">FAQ</a>
              <Link href="/demo" className="text-sm text-[#55E039] hover:text-[#6FF055] font-medium transition-colors">Try Demo</Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors px-3 py-2">Log In</Link>
              <CheckoutButton className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#55E039] px-4 text-sm font-semibold text-[#0a0a0a] hover:bg-[#4BCC33] transition-colors cursor-pointer">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </CheckoutButton>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-white/60" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenu && (
            <div className="md:hidden border-t border-white/[0.06] py-4 space-y-3">
              <a href="#features" className="block text-sm text-white/50 hover:text-white py-2">Features</a>
              <a href="#pricing" className="block text-sm text-white/50 hover:text-white py-2">Pricing</a>
              <a href="#faq" className="block text-sm text-white/50 hover:text-white py-2">FAQ</a>
              <Link href="/demo" className="block text-sm text-[#55E039] font-medium py-2">Try Demo</Link>
              <Link href="/login" className="block text-sm text-white/50 py-2">Log In</Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-[#55E039] mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              FDA/FTC Compliance for Regenerative Medicine
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Scan your content
              <br />
              <span className="text-[#55E039]">before regulators do.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-white/40 leading-relaxed max-w-xl">
              FDA and FTC enforcement against regen clinics is at an all-time high. RegenCompliance checks every word of your marketing against live enforcement data — and rewrites violations instantly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CheckoutButton className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#55E039] px-6 text-sm font-semibold text-[#0a0a0a] hover:bg-[#4BCC33] shadow-lg shadow-[#55E039]/20 hover:shadow-[#55E039]/30 transition-all cursor-pointer">
                Start Scanning — $497/mo
                <ArrowRight className="h-4 w-4" />
              </CheckoutButton>
              <Link href="/demo" className="inline-flex h-11 items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.08] px-6 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-all">
                Try Free Demo
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-xs text-white/30">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#55E039]/50" /> Zero patient data
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[#55E039]/50" /> Updated daily
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#55E039]/50" /> Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Scanner Preview */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2.5 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]/80" />
              </div>
              <div className="mx-auto text-[10px] text-white/20 font-mono">compliance.regenportal.com/dashboard/scanner</div>
            </div>
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-3 p-6 sm:p-8 border-r border-white/[0.04]">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-4 w-4 text-[#55E039]" />
                  <span className="text-sm font-semibold">Compliance Scanner</span>
                </div>
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 text-xs sm:text-sm text-white/40 leading-[1.9]">
                  <span className="bg-red-500/10 text-red-400 px-1 py-0.5 rounded border border-red-500/10">Our stem cell therapy cures arthritis</span>{" "}and{" "}<span className="bg-red-500/10 text-red-400 px-1 py-0.5 rounded border border-red-500/10">heals damaged tissue</span>{" "}with{" "}<span className="bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded border border-amber-500/10">FDA-approved stem cells</span>.{" "}Patients experience{" "}<span className="bg-red-500/10 text-red-400 px-1 py-0.5 rounded border border-red-500/10">guaranteed results</span>{" "}with{" "}<span className="bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded border border-amber-500/10">no side effects</span>.
                </div>
                <div className="mt-4 h-10 rounded-lg bg-[#55E039]/[0.06] border border-[#55E039]/10 flex items-center justify-center text-xs font-semibold text-[#55E039]">
                  Scan for Compliance Issues
                </div>
              </div>
              <div className="md:col-span-2 p-6 sm:p-8">
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/[0.03]" />
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-red-500" strokeDasharray="264" strokeDashoffset="198" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-red-400">25</span>
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Compliance Score</span>
                  <div className="flex gap-3 mt-3 text-[10px]">
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> 3 high</span>
                    <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> 2 medium</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {[
                    { phrase: "cures arthritis", level: "HIGH", c: "red" },
                    { phrase: "heals damaged tissue", level: "HIGH", c: "red" },
                    { phrase: "FDA-approved stem cells", level: "MED", c: "amber" },
                  ].map((f) => (
                    <div key={f.phrase} className={`rounded-lg border p-2.5 ${f.c === "red" ? "border-red-500/[0.08] bg-red-500/[0.02]" : "border-amber-500/[0.08] bg-amber-500/[0.02]"}`}>
                      <div className="flex items-center justify-between">
                        <code className={`text-[10px] sm:text-[11px] ${f.c === "red" ? "text-red-400/80" : "text-amber-400/80"}`}>&quot;{f.phrase}&quot;</code>
                        <span className={`text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded ${f.c === "red" ? "text-red-400/70 bg-red-500/[0.06]" : "text-amber-400/70 bg-amber-500/[0.06]"}`}>{f.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 sm:py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" /> Enforcement at all-time high
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">The FDA and FTC are watching.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { stat: "200+", label: "FDA warning letters in 2024", desc: "The highest volume in 25 years — targeting stem cell and regenerative marketing claims." },
              { stat: "$5.15M", label: "Single FTC settlement", desc: "What one clinic group paid for deceptive stem cell marketing. One social post started it." },
              { stat: "Permanent Ban", label: "Repeat offender penalty", desc: "Not a fine. A permanent, court-enforced prohibition on all marketing activity." },
            ].map((item) => (
              <div key={item.stat} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.04] transition-colors">
                <p className="text-3xl sm:text-4xl font-extrabold text-red-400 tracking-tight">{item.stat}</p>
                <p className="mt-2 text-xs font-semibold text-white/60 uppercase tracking-wider">{item.label}</p>
                <p className="mt-2 text-sm text-white/30 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-white/30">
            One word on your website. One caption. One email. <span className="text-white/60">That&apos;s all it takes.</span>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#55E039] uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Three steps. Thirty seconds.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "01", title: "Paste your content", desc: "Website copy, social posts, ad text, emails, scripts — anything that represents your clinic publicly." },
              { n: "02", title: "Review your score", desc: "0–100 compliance score with every flagged phrase highlighted by risk level and explained." },
              { n: "03", title: "Rewrite automatically", desc: "AI rewrites your content to meet FDA/FTC standards while keeping your tone and message." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 hover:border-[#55E039]/10 hover:bg-white/[0.04] transition-all">
                <span className="text-xs font-mono text-[#55E039]/40 font-bold">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-white/30 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-24 border-t border-white/[0.04] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#55E039] uppercase tracking-widest mb-3">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to stay compliant.</h2>
            <p className="mt-3 text-sm text-white/30 max-w-md mx-auto">One tool to scan, fix, and monitor all your clinic&apos;s marketing.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl bg-white/[0.03] border border-white/[0.06] p-6 hover:border-[#55E039]/15 hover:bg-white/[0.04] transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#55E039]/[0.08] text-[#55E039] mb-4 group-hover:bg-[#55E039] group-hover:text-[#0a0a0a] transition-all">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-white/30 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Library */}
      <section className="py-20 sm:py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#55E039] uppercase tracking-widest mb-3">Compliance Library</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Real violations. Real alternatives.</h2>
            <p className="mt-3 text-sm text-white/30">Sourced from actual FDA warning letters and FTC enforcement actions.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-4xl mx-auto">
            {libraryExamples.map((ex) => (
              <div key={ex.banned} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase ${ex.risk === "HIGH" ? "text-red-400/80 bg-red-500/[0.08]" : "text-amber-400/80 bg-amber-500/[0.08]"}`}>
                    {ex.risk} risk
                  </span>
                  <span className="text-[10px] text-white/20">{ex.source}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-0.5 h-4 w-4 rounded-full bg-red-500/[0.08] flex items-center justify-center text-red-400 text-[8px]">✕</span>
                    <span className="text-sm text-red-400/70">&quot;{ex.banned}&quot;</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="shrink-0 mt-0.5 h-4 w-4 text-[#55E039]/60" />
                    <span className="text-sm text-[#55E039]/60">&quot;{ex.alternative}&quot;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-white/20">300+ rules. Updated daily from live enforcement data.</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-24 border-t border-white/[0.04] scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#55E039] uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">One plan. Everything included.</h2>
            <p className="mt-3 text-sm text-white/30">No tiers. No hidden fees. No contracts.</p>
          </div>
          <div className="mx-auto max-w-sm">
            <div className="rounded-xl bg-white/[0.03] border border-[#55E039]/15 p-8 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#55E039]/30 to-transparent" />
              <div className="text-center mb-8">
                <p className="text-5xl font-extrabold tracking-tight">$497<span className="text-lg font-normal text-white/30">/mo</span></p>
                <p className="mt-1.5 text-xs text-white/30">Cancel anytime. No contracts.</p>
              </div>
              <ul className="space-y-3 mb-8">
                {checklist.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#55E039] shrink-0" />
                    <span className="text-sm text-white/50">{item}</span>
                  </li>
                ))}
              </ul>
              <CheckoutButton className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#55E039] text-sm font-semibold text-[#0a0a0a] hover:bg-[#4BCC33] shadow-lg shadow-[#55E039]/20 transition-all cursor-pointer">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </CheckoutButton>
              <p className="mt-4 text-center text-[10px] text-white/20">
                One warning letter costs more than years of RegenCompliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-24 border-t border-white/[0.04] scroll-mt-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-[#55E039] uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Common questions</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left rounded-xl bg-white/[0.03] border border-white/[0.06] px-5 py-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <span className="text-white/20 text-lg shrink-0">{openFaq === i ? "−" : "+"}</span>
                </div>
                {openFaq === i && (
                  <p className="mt-3 text-sm text-white/30 leading-relaxed pr-8">{faq.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24 border-t border-white/[0.04]">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Stop guessing.<br />Start scanning.
          </h2>
          <p className="mt-4 text-sm text-white/30 max-w-md mx-auto leading-relaxed">
            Your next post could trigger a federal investigation. It takes 30 seconds to check.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CheckoutButton className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#55E039] px-6 text-sm font-semibold text-[#0a0a0a] hover:bg-[#4BCC33] shadow-lg shadow-[#55E039]/20 transition-all cursor-pointer">
              Get Started — $497/mo
              <ArrowRight className="h-4 w-4" />
            </CheckoutButton>
            <Link href="/demo" className="inline-flex h-11 items-center rounded-lg bg-white/[0.04] border border-white/[0.08] px-6 text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
              Try Demo First
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#060606]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#55E039]">
                  <Shield className="h-3.5 w-3.5 text-[#0a0a0a]" />
                </div>
                <span className="text-sm font-bold">RegenCompliance</span>
              </div>
              <p className="text-xs text-white/20 leading-relaxed max-w-xs">
                FDA/FTC compliance scanning for regenerative medicine clinics. Scan, fix, and monitor your marketing content.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Product</p>
              <div className="space-y-2">
                <a href="#features" className="block text-sm text-white/20 hover:text-white/40 transition-colors">Features</a>
                <a href="#pricing" className="block text-sm text-white/20 hover:text-white/40 transition-colors">Pricing</a>
                <Link href="/demo" className="block text-sm text-white/20 hover:text-white/40 transition-colors">Demo</Link>
                <Link href="/login" className="block text-sm text-white/20 hover:text-white/40 transition-colors">Log In</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Legal</p>
              <div className="space-y-2">
                <span className="block text-sm text-white/20 cursor-pointer hover:text-white/40 transition-colors">Privacy Policy</span>
                <span className="block text-sm text-white/20 cursor-pointer hover:text-white/40 transition-colors">Terms of Service</span>
                <span className="block text-sm text-white/20 cursor-pointer hover:text-white/40 transition-colors">Contact</span>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/[0.04]">
            <p className="text-[10px] text-white/10 leading-relaxed text-center">
              RegenCompliance is an educational compliance tool and does not constitute legal or regulatory advice. Not affiliated with the FDA or FTC. &copy; 2026 RegenCompliance. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
