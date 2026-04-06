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
  ChevronDown,
} from "lucide-react"
import { useState } from "react"

const features = [
  { icon: Scan, title: "Live Compliance Scanner", desc: "Instant FDA/FTC compliance scoring on any marketing content — website copy, social posts, ads, emails, scripts." },
  { icon: Pencil, title: "AI-Powered Rewrites", desc: "One click rewrites all flagged content to meet compliance standards while preserving your clinic's voice." },
  { icon: BookOpen, title: "300+ Compliance Rules", desc: "A living database sourced directly from real FDA warning letters and FTC enforcement actions." },
  { icon: Bell, title: "Daily Rule Updates", desc: "Automated monitoring adds new violations to your ruleset within 24 hours of enforcement." },
  { icon: Clock, title: "Audit Trail + Export", desc: "Every scan is permanently logged. Export PDF compliance reports for legal review or internal records." },
  { icon: Users, title: "3 Team Seats", desc: "Extend access to your marketing team, content writer, and front desk — shared history under one account." },
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
  { q: "Does this access any patient data?", a: "Never. We analyze marketing text only — no PHI, no patient records, no clinical data. Zero HIPAA implications." },
  { q: "How are rules updated?", a: "Daily. Our system monitors FDA warning letters and FTC press releases every morning. New enforcement actions are processed and added automatically." },
  { q: "Who is this for?", a: "Regenerative medicine clinics offering PRP, stem cell therapy, exosomes, BMAC, Wharton's jelly, prolotherapy, and peptide therapy." },
  { q: "What if I cancel?", a: "You keep full access through your billing period. No contracts, no fees, no penalties. Resubscribe anytime." },
]

function GridPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-100"
      style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />
  )
}

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ============ HEADER ============ */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/10" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#55E039] to-[#3BB82A] shadow-lg shadow-[#55E039]/25">
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight">RegenCompliance</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[13px] text-white/60 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-[13px] text-white/60 hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="text-[13px] text-white/60 hover:text-white transition-colors">FAQ</a>
              <Link href="/demo" className="text-[13px] text-[#55E039] hover:text-[#6FF055] font-semibold transition-colors">Try Demo</Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-[13px] text-white/60 hover:text-white transition-colors px-4 py-2">Log In</Link>
              <CheckoutButton className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-6 text-[13px] font-semibold text-white shadow-lg shadow-[#55E039]/25 hover:shadow-[#55E039]/40 hover:brightness-110 transition-all cursor-pointer">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </CheckoutButton>
            </div>

            <button className="md:hidden text-white/60 hover:text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          {mobileMenu && (
            <div className="md:hidden border-t border-white/10 py-4 space-y-1">
              <a href="#features" className="block text-sm text-white/60 hover:text-white py-2.5 px-2 rounded-lg hover:bg-white/5">Features</a>
              <a href="#pricing" className="block text-sm text-white/60 hover:text-white py-2.5 px-2 rounded-lg hover:bg-white/5">Pricing</a>
              <a href="#faq" className="block text-sm text-white/60 hover:text-white py-2.5 px-2 rounded-lg hover:bg-white/5">FAQ</a>
              <Link href="/demo" className="block text-sm text-[#55E039] font-semibold py-2.5 px-2">Try Demo</Link>
              <Link href="/login" className="block text-sm text-white/60 py-2.5 px-2">Log In</Link>
            </div>
          )}
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[700px] h-[500px] bg-[#55E039]/[0.07] rounded-full blur-[150px]" />
          <div className="absolute top-[200px] right-0 w-[400px] h-[400px] bg-[#55E039]/[0.04] rounded-full blur-[120px]" />
          <GridPattern />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#55E039]/10 border border-[#55E039]/20 px-4 py-2 text-xs font-semibold text-[#55E039] mb-8">
              <ShieldCheck className="h-3.5 w-3.5" />
              FDA/FTC Compliance for Regenerative Medicine
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[4.25rem] font-extrabold tracking-tight leading-[1.08]">
              Scan your content
              <br />
              <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">before regulators do.</span>
            </h1>

            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
              FDA and FTC enforcement against regen clinics hit a 25-year high. RegenCompliance checks every word against live enforcement data and rewrites violations automatically.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <CheckoutButton className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-semibold text-white shadow-lg shadow-[#55E039]/25 hover:shadow-xl hover:shadow-[#55E039]/40 hover:brightness-110 transition-all cursor-pointer">
                Start Scanning — $497/mo
                <ArrowRight className="h-4 w-4" />
              </CheckoutButton>
              <Link href="/demo" className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 px-8 text-[15px] font-medium text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all">
                Try Free Demo
                <ArrowRight className="h-4 w-4 opacity-50" />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/50">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#55E039]/70" /> Zero patient data
              </span>
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#55E039]/70" /> Updated daily
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#55E039]/70" /> Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SCANNER MOCKUP ============ */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-sm">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-3 bg-white/[0.02]">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="mx-auto flex h-7 items-center rounded-lg bg-white/5 border border-white/5 px-4 text-[11px] text-white/30 font-mono tracking-wide">
                compliance.regenportal.com/dashboard/scanner
              </div>
            </div>
            {/* Content */}
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-3 p-6 sm:p-8 border-r border-white/[0.06]">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <span className="text-sm font-semibold text-white">Compliance Scanner</span>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 text-sm text-white/50 leading-[2]">
                  <span className="bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded border border-red-500/15">Our stem cell therapy cures arthritis</span>{" "}and{" "}<span className="bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded border border-red-500/15">heals damaged tissue</span>{" "}with{" "}<span className="bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/15">FDA-approved stem cells</span>.{" "}Patients experience{" "}<span className="bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded border border-red-500/15">guaranteed results</span>{" "}with{" "}<span className="bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/15">no side effects</span>.
                </div>
                <div className="mt-5 h-11 rounded-xl bg-gradient-to-r from-[#55E039]/10 to-[#3BB82A]/10 border border-[#55E039]/20 flex items-center justify-center text-sm font-semibold text-[#55E039]">
                  Scan for Compliance Issues
                </div>
              </div>
              <div className="md:col-span-2 p-6 sm:p-8">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/[0.05]" />
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-red-500" strokeDasharray="264" strokeDashoffset="198" style={{ filter: "drop-shadow(0 0 8px rgba(239,68,68,0.4))" }} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-red-400">25</span>
                  </div>
                  <span className="mt-2 text-[10px] text-white/40 uppercase tracking-[0.15em] font-semibold">Compliance Score</span>
                </div>
                <div className="flex justify-center gap-4 text-[11px] text-white/50 mb-5">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" /> 3 high risk</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" /> 2 medium</span>
                </div>
                <div className="space-y-2">
                  {[
                    { phrase: "cures arthritis", level: "HIGH", c: "red" },
                    { phrase: "heals damaged tissue", level: "HIGH", c: "red" },
                    { phrase: "FDA-approved stem cells", level: "MED", c: "amber" },
                  ].map((f) => (
                    <div key={f.phrase} className={`rounded-lg border p-3 ${f.c === "red" ? "border-red-500/15 bg-red-500/[0.04]" : "border-amber-500/15 bg-amber-500/[0.04]"}`}>
                      <div className="flex items-center justify-between">
                        <code className={`text-[11px] font-medium ${f.c === "red" ? "text-red-400" : "text-amber-400"}`}>&quot;{f.phrase}&quot;</code>
                        <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md ${f.c === "red" ? "text-red-400 bg-red-500/10 border border-red-500/10" : "text-amber-400 bg-amber-500/10 border border-amber-500/10"}`}>{f.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow underneath */}
          <div className="mx-auto -mt-12 h-24 w-2/3 bg-[#55E039]/[0.06] blur-[80px] rounded-full" />
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="relative py-24 border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] via-white/[0.02] to-transparent" />
        <GridPattern />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" /> Enforcement at all-time high
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">The FDA and FTC are actively targeting regen clinics.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { stat: "200+", label: "FDA warning letters in 2024", desc: "The highest volume in 25 years — directly targeting stem cell and regenerative marketing claims." },
              { stat: "$5.15M", label: "Single FTC settlement", desc: "What one clinic group paid for deceptive stem cell marketing. A single social media post triggered the investigation." },
              { stat: "Permanent Ban", label: "Repeat offender penalty", desc: "Not a fine — a permanent, court-enforced prohibition on all marketing and advertising activity." },
            ].map((item) => (
              <div key={item.stat} className="rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300">
                <p className="text-4xl font-extrabold text-red-400 tracking-tight">{item.stat}</p>
                <p className="mt-3 text-xs font-bold text-white/70 uppercase tracking-[0.15em]">{item.label}</p>
                <p className="mt-3 text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-base text-white/50">
            One word on your website. One Instagram caption. One patient email.{" "}
            <span className="text-white font-semibold">That&apos;s all it takes.</span>
          </p>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative py-24 border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#55E039]/[0.02] to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Three steps. Thirty seconds.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { n: "01", title: "Paste your content", desc: "Website copy, social posts, ad text, emails, call scripts — anything that represents your clinic publicly." },
              { n: "02", title: "Review your score", desc: "Instant 0–100 compliance score with every flagged phrase highlighted by risk level and clearly explained." },
              { n: "03", title: "Rewrite automatically", desc: "AI rewrites your entire content to meet FDA/FTC standards — keeping your tone, message, and voice intact." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:border-[#55E039]/20 hover:bg-white/[0.06] transition-all duration-300 group">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 text-[#55E039] text-sm font-bold font-mono group-hover:bg-[#55E039]/20 transition-colors">{s.n}</span>
                <h3 className="mt-5 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="relative py-24 border-t border-white/10 scroll-mt-20">
        <GridPattern />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Everything you need to stay compliant.</h2>
            <p className="mt-4 text-base text-white/60 max-w-lg mx-auto">One tool to scan, fix, and monitor all your clinic&apos;s marketing content.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:border-[#55E039]/20 hover:bg-white/[0.06] transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#55E039]/10 text-[#55E039] mb-5 group-hover:bg-[#55E039] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#55E039]/25 transition-all duration-300">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LIBRARY ============ */}
      <section className="relative py-24 border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#55E039]/[0.015] to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">Compliance Library</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Real violations. Real alternatives.</h2>
            <p className="mt-4 text-base text-white/60">Sourced from actual FDA warning letters and FTC enforcement actions.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 max-w-4xl mx-auto">
            {libraryExamples.map((ex) => (
              <div key={ex.banned} className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:bg-white/[0.06] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold tracking-[0.15em] px-2.5 py-1 rounded-full uppercase ${ex.risk === "HIGH" ? "text-red-400 bg-red-500/10 border border-red-500/15" : "text-amber-400 bg-amber-500/10 border border-amber-500/15"}`}>
                    {ex.risk} risk
                  </span>
                  <span className="text-[11px] text-white/30">{ex.source}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-red-500/10 border border-red-500/15 flex items-center justify-center text-red-400 text-[9px] font-bold">✕</span>
                    <span className="text-[15px] font-medium text-red-400">&quot;{ex.banned}&quot;</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="shrink-0 mt-0.5 h-5 w-5 text-[#55E039]" />
                    <span className="text-[15px] text-[#55E039]/80">&quot;{ex.alternative}&quot;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-white/40">300+ rules in the full library — updated daily from live enforcement data.</p>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="relative py-24 border-t border-white/10 scroll-mt-20">
        <GridPattern />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">One plan. Everything included.</h2>
            <p className="mt-4 text-base text-white/60">No tiers, no hidden fees, no contracts.</p>
          </div>
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl bg-white/[0.03] border-2 border-[#55E039]/20 p-10 relative overflow-hidden shadow-xl shadow-[#55E039]/[0.05]">
              {/* Top glow line */}
              <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#55E039]/50 to-transparent" />
              <div className="text-center mb-10">
                <p className="text-6xl font-extrabold tracking-tight">$497<span className="text-xl font-normal text-white/40">/mo</span></p>
                <p className="mt-2 text-sm text-white/50">Cancel anytime. No contracts.</p>
              </div>
              <ul className="space-y-4 mb-10">
                {checklist.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0" />
                    <span className="text-[15px] text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
              <CheckoutButton className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[15px] font-semibold text-white shadow-lg shadow-[#55E039]/25 hover:shadow-xl hover:shadow-[#55E039]/40 hover:brightness-110 transition-all cursor-pointer">
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </CheckoutButton>
              <p className="mt-6 text-center text-xs text-white/30">
                One FDA warning letter costs more in legal fees than years of RegenCompliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="py-24 border-t border-white/10 scroll-mt-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className={`w-full text-left rounded-2xl bg-white/[0.03] border px-6 py-5 transition-all duration-300 ${openFaq === i ? "border-[#55E039]/20 bg-white/[0.06]" : "border-white/10 hover:bg-white/[0.06]"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-white/40 shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </div>
                {openFaq === i && (
                  <p className="mt-4 text-sm text-white/60 leading-relaxed">{faq.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative py-24 border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#55E039]/[0.03] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#55E039]/[0.06] rounded-full blur-[120px]" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Stop guessing.<br />Start scanning.
          </h2>
          <p className="mt-5 text-base text-white/60 max-w-md mx-auto leading-relaxed">
            Your next Instagram post, website update, or patient email could trigger a federal investigation. It takes 30 seconds to check.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <CheckoutButton className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-semibold text-white shadow-lg shadow-[#55E039]/25 hover:shadow-xl hover:shadow-[#55E039]/40 hover:brightness-110 transition-all cursor-pointer">
              Get Started — $497/mo
              <ArrowRight className="h-4 w-4" />
            </CheckoutButton>
            <Link href="/demo" className="inline-flex h-12 items-center rounded-xl bg-white/5 border border-white/10 px-8 text-[15px] font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all">
              Try Demo First
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/10 bg-[#060606]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#55E039] to-[#3BB82A]">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="text-[15px] font-bold">RegenCompliance</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                FDA/FTC compliance scanning built exclusively for regenerative medicine clinics. Scan, fix, and monitor your marketing content before regulators do.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-[0.15em] mb-4">Product</p>
              <div className="space-y-2.5">
                <a href="#features" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Features</a>
                <a href="#pricing" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Pricing</a>
                <Link href="/demo" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Demo</Link>
                <Link href="/login" className="block text-sm text-white/40 hover:text-white/70 transition-colors">Log In</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-[0.15em] mb-4">Legal</p>
              <div className="space-y-2.5">
                <span className="block text-sm text-white/40 hover:text-white/70 cursor-pointer transition-colors">Privacy Policy</span>
                <span className="block text-sm text-white/40 hover:text-white/70 cursor-pointer transition-colors">Terms of Service</span>
                <span className="block text-sm text-white/40 hover:text-white/70 cursor-pointer transition-colors">Contact</span>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/[0.06]">
            <p className="text-[11px] text-white/20 leading-relaxed text-center">
              RegenCompliance is an educational compliance tool and does not constitute legal or regulatory advice. Not affiliated with the FDA or FTC. &copy; 2026 RegenCompliance. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
