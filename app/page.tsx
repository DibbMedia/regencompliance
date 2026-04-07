"use client"

import Link from "next/link"
import { BetaCheckoutButton, BetaSpotsCounter } from "@/components/beta-checkout-button"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
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
  Lock,
  ShieldCheck,
  Activity,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
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

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      <MarketingBg />

      <MarketingHeader />

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#55E039]/10 border border-[#55E039]/20 px-4 py-2 text-xs font-semibold text-[#55E039] mb-8 shadow-[0_0_20px_rgba(85,224,57,0.1)]">
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
              <BetaCheckoutButton className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer">
                Claim Beta Access — $297/mo For Life
                <ArrowRight className="h-4 w-4" />
              </BetaCheckoutButton>
              <Link href="/demo" className="inline-flex h-12 items-center gap-2.5 rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.04] px-8 text-[15px] font-semibold text-[#55E039] shadow-[0_0_20px_rgba(85,224,57,0.08)] hover:shadow-[0_0_30px_rgba(85,224,57,0.15)] hover:bg-[#55E039]/[0.08] hover:border-[#55E039]/30 transition-all">
                Try Free Demo
                <ArrowRight className="h-4 w-4 opacity-60" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-[#55E039]/70" /> Zero patient data</span>
              <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-[#55E039]/70" /> Updated daily</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#55E039]/70" /> Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SCANNER MOCKUP ===== */}
      <section className="relative pb-28 sm:pb-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative rounded-2xl border border-white/10 bg-[#111111] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            {/* Green glow at top */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#55E039]/40 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-[#55E039]/[0.05] blur-[40px]" />

            {/* Browser Chrome */}
            <div className="flex items-center border-b border-white/[0.06] px-5 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="mx-auto flex h-7 items-center rounded-lg bg-white/[0.04] border border-white/[0.06] px-4 text-[11px] text-white/25 font-mono">
                <Lock className="h-3 w-3 mr-1.5 text-[#28C840]" />
                compliance.regenportal.com/dashboard/scanner
              </div>
              <div className="w-[52px]" />
            </div>

            {/* App Content */}
            <div className="grid md:grid-cols-5 min-h-[380px]">
              {/* Left: Input */}
              <div className="md:col-span-3 p-6 sm:p-8 border-r border-white/[0.06]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#55E039]/20 to-[#55E039]/5 border border-[#55E039]/15 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-[#55E039]" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Compliance Scanner</span>
                      <span className="text-[10px] text-white/30">Paste content below to scan</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {["Website", "Social", "Ad", "Email"].map((t, i) => (
                      <span key={t} className={`text-[10px] px-2.5 py-1 rounded-md font-medium ${i === 0 ? "bg-[#55E039]/10 text-[#55E039] border border-[#55E039]/20" : "text-white/30 hover:text-white/40 cursor-pointer"}`}>{t}</span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-[#0a0a0a] border border-white/10 p-5 text-[14px] text-white/60 leading-[2.2] mb-5" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
                  <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-md border border-red-500/30 font-medium">Our stem cell therapy cures arthritis</span>{" "}and{" "}<span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-md border border-red-500/30 font-medium">heals damaged tissue</span>{" "}with{" "}<span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md border border-amber-500/30 font-medium">FDA-approved stem cells</span>.{" "}Patients experience{" "}<span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-md border border-red-500/30 font-medium">guaranteed results</span>{" "}with{" "}<span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md border border-amber-500/30 font-medium">no side effects</span>. Our{" "}<span className="text-white/40">clinic has helped thousands of patients recover from chronic conditions using advanced regenerative protocols.</span>
                  <div className="flex justify-end mt-2">
                    <span className="text-[10px] text-white/20">312 / 5,000 characters</span>
                  </div>
                </div>

                <Link href="/demo" className="h-11 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] flex items-center justify-center text-sm font-bold text-[#0a0a0a] shadow-[0_4px_15px_rgba(85,224,57,0.25)] hover:shadow-[0_4px_25px_rgba(85,224,57,0.4)] hover:brightness-110 transition-all">
                  <Scan className="h-4 w-4 mr-2" />
                  Scan for Compliance Issues
                </Link>
                <p className="text-[10px] text-white/20 text-center mt-3">Educational guidance only. Not legal or regulatory advice.</p>
              </div>

              {/* Right: Results */}
              <div className="md:col-span-2 p-6 sm:p-8 bg-[#0e0e0e]">
                <div className="flex flex-col items-center mb-5">
                  <div className="relative">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="5" className="text-white/[0.04]" />
                      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-red-500" strokeDasharray="264" strokeDashoffset="198" style={{ filter: "drop-shadow(0 0 10px rgba(239,68,68,0.5))" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-red-400">25</span>
                      <span className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-bold mt-0.5">Score</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-5 text-[11px] text-white/60 mb-5 pb-5 border-b border-white/10">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> 3 high risk</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" /> 2 medium</span>
                </div>

                <p className="text-[11px] text-white/40 mb-3 font-bold uppercase tracking-widest">Flagged Phrases</p>
                <div className="space-y-2">
                  {[
                    { phrase: "cures arthritis", reason: "Disease cure claim", level: "HIGH", c: "red" },
                    { phrase: "heals damaged tissue", reason: "Efficacy claim", level: "HIGH", c: "red" },
                    { phrase: "guaranteed results", reason: "Guarantee claim", level: "HIGH", c: "red" },
                    { phrase: "FDA-approved stem cells", reason: "False FDA claim", level: "MED", c: "amber" },
                    { phrase: "no side effects", reason: "Safety claim", level: "MED", c: "amber" },
                  ].map((f) => (
                    <div key={f.phrase} className={`rounded-lg border p-3 flex items-center justify-between ${f.c === "red" ? "border-red-500/30 bg-red-950/40" : "border-amber-500/30 bg-amber-950/40"}`}>
                      <div>
                        <span className={`text-[12px] font-semibold ${f.c === "red" ? "text-red-300" : "text-amber-300"}`}>&quot;{f.phrase}&quot;</span>
                        <p className="text-[10px] text-white/40 mt-0.5">{f.reason}</p>
                      </div>
                      <span className={`text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-md border ${f.c === "red" ? "text-red-300 bg-red-500/20 border-red-500/30" : "text-amber-300 bg-amber-500/20 border-amber-500/30"}`}>{f.level}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 h-10 rounded-lg border border-[#55E039]/30 bg-[#55E039]/10 flex items-center justify-center text-[12px] font-bold text-[#55E039] shadow-[0_0_20px_rgba(85,224,57,0.12)] cursor-pointer hover:bg-[#55E039]/15 transition-colors">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Rewrite for Compliance
                </div>
              </div>
            </div>
          </div>
          {/* Glow underneath */}
          <div className="mx-auto -mt-16 h-32 w-2/3 bg-[#55E039]/[0.06] blur-[80px] rounded-full" />
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative py-16">
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
                <p className="mt-3 text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-base text-white/60">
            One word on your website. One Instagram caption. One patient email.{" "}
            <span className="text-white font-semibold">That&apos;s all it takes.</span>
          </p>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-16">
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
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 text-[#55E039] text-sm font-bold font-mono group-hover:bg-[#55E039]/20 transition-colors">{s.n}</span>
                <h3 className="mt-5 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="relative py-16 scroll-mt-20">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Everything you need to stay compliant.</h2>
            <p className="mt-4 text-base text-white/60 max-w-lg mx-auto">One tool to scan, fix, and monitor all your clinic&apos;s marketing content.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:border-[#55E039]/20 hover:bg-white/[0.06] transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 text-[#55E039] mb-5 group-hover:bg-[#55E039] group-hover:text-[#0a0a0a] group-hover:border-[#55E039] group-hover:shadow-[0_0_20px_rgba(85,224,57,0.3)] transition-all duration-300">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{f.desc}</p>
                <Link href="/features" className="inline-flex items-center gap-1 mt-4 text-xs text-[#55E039]/60 hover:text-[#55E039] transition-colors font-medium">
                  Learn more <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIBRARY ===== */}
      <section className="relative py-16">
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

      {/* ===== PRICING ===== */}
      <section id="pricing" className="relative py-12 scroll-mt-20">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Lock in $297/mo before it goes to $497.</h2>
            <p className="mt-4 text-base text-white/60">Limited to 25 founding members. Rate locked for life.</p>
          </div>
          <div className="mx-auto max-w-4xl grid gap-6 md:grid-cols-2 items-start">
            {/* BETA PLAN — PRIMARY */}
            <div className="rounded-2xl bg-white/[0.03] border-2 border-[#55E039]/40 p-10 relative overflow-hidden shadow-[0_0_60px_rgba(85,224,57,0.1)]">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#55E039]/70 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-24 bg-[#55E039]/[0.08] blur-[50px]" />
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#55E039]/15 border border-[#55E039]/25 px-3 py-1 text-xs font-bold text-[#55E039]">
                  <Zap className="h-3 w-3" />
                  Beta — Limited Spots
                </span>
              </div>
              <div className="relative text-center mb-8 pt-4">
                <p className="text-5xl sm:text-6xl font-extrabold tracking-tight">$297<span className="text-lg font-normal text-white/40 ml-1">/mo</span></p>
                <p className="mt-2 text-sm text-[#55E039]/80 font-semibold">Locked-In Rate — Never increases</p>
                <BetaSpotsCounter className="mt-3 inline-block text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1" />
              </div>
              <ul className="space-y-4 mb-8">
                {checklist.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0" />
                    <span className="text-[15px] text-white/70">{item}</span>
                  </li>
                ))}
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0" />
                  <span className="text-[15px] text-white font-semibold">Rate locked at $297/mo — never increases</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0" />
                  <span className="text-[15px] text-white font-semibold">All future updates included</span>
                </li>
              </ul>
              <BetaCheckoutButton className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer">
                Claim Beta Access — $297/mo
                <ArrowRight className="h-4 w-4" />
              </BetaCheckoutButton>
              <p className="mt-4 text-center text-xs text-white/30">
                Rate locked at $297/mo for life. Standard is $497/mo.
              </p>
            </div>

            {/* STANDARD PLAN — COMING SOON */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-10 relative overflow-hidden opacity-70">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-xs font-bold text-white/40">
                  Coming Soon
                </span>
              </div>
              <div className="relative text-center mb-8 pt-4">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Standard</p>
                <p className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white/40">$497<span className="text-lg font-normal text-white/30 ml-1">/mo</span></p>
                <p className="mt-2 text-sm text-white/30">Available after beta ends.</p>
              </div>
              <ul className="space-y-4 mb-8">
                {checklist.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-white/20 shrink-0" />
                    <span className="text-[15px] text-white/30">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] text-[15px] font-bold text-white/30 cursor-not-allowed select-none">
                Coming Soon
              </div>
              <p className="mt-4 text-center text-xs text-white/20">
                Lock in $297/mo now — rate goes to $497/mo after beta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="relative py-12 scroll-mt-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-8">
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
          <div className="text-center mt-8">
            <Link href="/faq" className="text-sm text-[#55E039]/70 hover:text-[#55E039] transition-colors font-medium inline-flex items-center gap-1">
              View all FAQ <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#55E039]/[0.03] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#55E039]/[0.06] blur-[120px] rounded-full" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Stop guessing.<br />Start scanning.</h2>
          <p className="mt-5 text-base text-white/60 max-w-md mx-auto leading-relaxed">
            Your next Instagram post, website update, or patient email could trigger a federal investigation. It takes 30 seconds to check.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <BetaCheckoutButton className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:shadow-[0_4px_30px_rgba(85,224,57,0.5)] hover:brightness-110 transition-all cursor-pointer">
              Claim Beta Access — $297/mo
              <ArrowRight className="h-4 w-4" />
            </BetaCheckoutButton>
            <Link href="/demo" className="inline-flex h-12 items-center rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.04] px-8 text-[15px] font-semibold text-[#55E039] shadow-[0_0_20px_rgba(85,224,57,0.08)] hover:shadow-[0_0_30px_rgba(85,224,57,0.15)] hover:bg-[#55E039]/[0.08] transition-all">
              Try Demo First
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
