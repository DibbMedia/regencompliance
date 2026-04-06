import Link from "next/link"
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
  FileWarning,
  Activity,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const features = [
  { icon: Scan, title: "Live Compliance Scanner", desc: "Paste any marketing content and receive an instant FDA/FTC compliance score with every flagged phrase identified and explained." },
  { icon: Pencil, title: "One-Click AI Rewriter", desc: "Flagged content is automatically rewritten to meet compliance standards while preserving your clinic's voice and messaging." },
  { icon: BookOpen, title: "300+ Compliance Rules", desc: "A living, searchable database of every FDA/FTC-flagged phrase in regenerative medicine with compliant alternatives." },
  { icon: Bell, title: "Daily Rule Updates", desc: "Automated monitoring of FDA warning letters and FTC enforcement actions. New violations are added to your ruleset within 24 hours." },
  { icon: Clock, title: "Audit Trail + PDF Export", desc: "Every scan is permanently logged. Export compliance reports as PDF for legal review or internal documentation." },
  { icon: Users, title: "3 Team Seats Included", desc: "Extend access to your marketing coordinator, content writer, and front desk. Shared scan history under one account." },
]

const libraryExamples = [
  { banned: "heals", alternative: "may support the body's natural healing processes", risk: "HIGH", source: "FDA Warning Letter, 2024" },
  { banned: "FDA-approved stem cells", alternative: "performed in an FDA-registered facility", risk: "HIGH", source: "FDA CBER Guidance, 2024" },
  { banned: "cures arthritis", alternative: "some patients report reduced joint discomfort", risk: "MEDIUM", source: "FTC Enforcement Action, 2024" },
  { banned: "proven to reverse aging", alternative: "patients report feeling more youthful and energetic", risk: "HIGH", source: "FTC Press Release, 2024" },
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
  { q: "Is this actual legal advice?", a: "No. RegenCompliance is an educational compliance tool. It identifies content that may conflict with FDA/FTC guidelines and suggests alternatives. We strongly recommend having all final content reviewed by qualified healthcare marketing counsel before publishing." },
  { q: "Does this access any patient data?", a: "Never. RegenCompliance analyzes marketing text only. No PHI, no patient records, no clinical data enters our system. There are zero HIPAA implications because we never touch protected health information." },
  { q: "How are compliance rules updated?", a: "Daily. Our automated system monitors FDA warning letter publications and FTC press releases every morning. When new enforcement actions target regenerative medicine marketing claims, the flagged phrases are extracted and added to your ruleset automatically." },
  { q: "What types of clinics is this built for?", a: "Regenerative medicine clinics offering PRP, stem cell therapy, exosomes, BMAC, Wharton's jelly, prolotherapy, and peptide therapy. If your clinic markets any regenerative treatment, this tool was built specifically for your compliance needs." },
  { q: "What happens if I cancel?", a: "You retain full access through the end of your current billing period. No contracts, no cancellation fees, no data loss. Your scan history remains accessible until the period ends. You can resubscribe at any time." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060208]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#55E039]/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#89E3E4]/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#060208]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#55E039] to-[#3DBF2A] shadow-lg shadow-[#55E039]/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">RegenCompliance</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/demo" className="text-[13px] font-medium text-[#55E039] hover:text-[#6FF055] transition-colors">
              Try Demo
            </Link>
            <Link href="/login" className="text-[13px] font-medium text-slate-400 hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/login" className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3DBF2A] px-5 text-[13px] font-semibold text-white shadow-lg shadow-[#55E039]/25 hover:shadow-[#55E039]/40 transition-all">
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#55E039]/[0.04] rounded-full blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/15 bg-[#55E039]/[0.06] px-4 py-2 text-[13px] font-medium text-[#55E039] mb-10 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              FDA/FTC Compliance Engine for Regenerative Medicine
            </div>
            <h1 className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-extrabold tracking-[-0.02em] leading-[0.95] text-white">
              Scan before
              <br />
              <span className="bg-gradient-to-r from-[#55E039] via-[#89E3E4] to-[#55E039] bg-clip-text text-transparent">
                they scan you.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-[17px] leading-[1.7] text-slate-400">
              Your website copy, social posts, and ad content are being monitored by federal regulators.
              RegenCompliance checks every word against live FDA/FTC enforcement data — and rewrites violations automatically.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href="/login" className="group inline-flex h-[52px] items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3DBF2A] px-8 text-[15px] font-semibold text-white shadow-xl shadow-[#55E039]/25 hover:shadow-[#55E039]/40 transition-all duration-300">
                Start Scanning — $497/mo
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/demo" className="inline-flex h-[52px] items-center gap-2.5 rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.04] px-8 text-[15px] font-medium text-[#55E039] hover:bg-[#55E039]/[0.08] hover:border-[#55E039]/30 transition-all duration-300 backdrop-blur-sm">
                Try Free Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[13px] text-slate-500">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#55E039]/60" />
                Zero patient data
              </span>
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#55E039]/60" />
                Rules updated daily
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#55E039]/60" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Scanner Mockup */}
          <div className="mt-20 mx-auto max-w-5xl">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0C0814]/80 shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden ring-1 ring-white/[0.03] ring-inset">
              <div className="flex items-center gap-2.5 border-b border-white/[0.04] px-5 py-3.5">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="mx-auto flex h-7 items-center rounded-lg bg-white/[0.04] border border-white/[0.04] px-4 text-[11px] text-slate-500 font-mono">
                  compliance.regenportal.com/dashboard/scanner
                </div>
              </div>
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-3 p-8 border-r border-white/[0.04]">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#55E039]/10">
                      <Shield className="h-4 w-4 text-[#55E039]" />
                    </div>
                    <span className="font-semibold text-white text-[15px]">Compliance Scanner</span>
                  </div>
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-5 text-[13px] text-slate-400 leading-[1.8] font-mono">
                    <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-md border border-red-500/10">Our stem cell therapy cures arthritis</span>{" "}
                    and{" "}
                    <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-md border border-red-500/10">heals damaged tissue</span>{" "}
                    with{" "}
                    <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-md border border-amber-500/10">FDA-approved stem cells</span>.{" "}
                    Patients experience{" "}
                    <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-md border border-red-500/10">guaranteed results</span>{" "}
                    with{" "}
                    <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded-md border border-amber-500/10">no side effects</span>.
                  </div>
                  <div className="mt-5 h-11 w-full rounded-xl bg-gradient-to-r from-[#55E039]/10 to-[#3DBF2A]/10 border border-[#55E039]/15 flex items-center justify-center text-[13px] font-semibold text-[#55E039]">
                    Scan for Compliance Issues
                  </div>
                </div>
                <div className="md:col-span-2 p-8">
                  <div className="flex flex-col items-center mb-5">
                    <div className="relative">
                      <svg className="w-[100px] h-[100px] -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/[0.04]" />
                        <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-red-500" strokeDasharray="264" strokeDashoffset="198" style={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,0.3))" }} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[28px] font-bold text-red-400">25</span>
                    </div>
                    <span className="mt-2 text-[11px] text-slate-500 uppercase tracking-wider font-medium">Compliance Score</span>
                  </div>
                  <div className="flex justify-center gap-4 text-[11px] mb-5">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" /> 3 high risk</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" /> 2 medium</span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { phrase: "cures arthritis", level: "HIGH", color: "red" },
                      { phrase: "heals damaged tissue", level: "HIGH", color: "red" },
                      { phrase: "FDA-approved stem cells", level: "MED", color: "amber" },
                    ].map((flag) => (
                      <div key={flag.phrase} className={`rounded-lg border p-3 ${flag.color === "red" ? "border-red-500/10 bg-red-500/[0.03]" : "border-amber-500/10 bg-amber-500/[0.03]"}`}>
                        <div className="flex items-center justify-between">
                          <code className={`text-[11px] ${flag.color === "red" ? "text-red-400" : "text-amber-400"}`}>&quot;{flag.phrase}&quot;</code>
                          <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full ${flag.color === "red" ? "text-red-400 bg-red-500/10" : "text-amber-400 bg-amber-500/10"}`}>{flag.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Glow under mockup */}
            <div className="mx-auto -mt-8 h-16 w-3/4 bg-[#55E039]/[0.04] blur-[60px] rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-28 border-y border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0814] via-[#0C0814] to-[#060208]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/[0.06] border border-red-500/10 px-4 py-2 text-[13px] font-medium text-red-400 mb-6">
              <FileWarning className="h-4 w-4" />
              Enforcement is at an all-time high
            </div>
            <h2 className="text-[2.5rem] sm:text-[3rem] font-bold tracking-[-0.02em] text-white leading-tight">
              The FDA and FTC are actively<br className="hidden sm:block" /> targeting regen clinics.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 max-w-5xl mx-auto">
            {[
              { stat: "200+", label: "FDA enforcement letters", desc: "issued in 2024 alone — a 25-year high targeting regenerative medicine marketing claims" },
              { stat: "$5.15M", label: "FTC settlement", desc: "what one clinic group paid for deceptive stem cell marketing. A single Instagram post triggered the investigation." },
              { stat: "Permanent Ban", label: "marketing prohibition", desc: "the FTC's penalty for repeat offenders. Not a fine — a permanent, legally-enforced ban on all advertising.", small: true },
            ].map((item) => (
              <div key={item.stat} className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-8 backdrop-blur-sm hover:border-red-500/10 transition-colors duration-500">
                <p className={`font-extrabold text-red-400 ${item.small ? "text-[2rem]" : "text-[3rem]"} tracking-tight leading-none`}>
                  {item.stat}
                </p>
                <p className="mt-3 text-[13px] font-semibold text-white/80 uppercase tracking-wider">{item.label}</p>
                <p className="mt-3 text-[13px] leading-[1.7] text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-[17px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
            One word on your website. One claim in a social post. One line in a patient email.
            <span className="text-white font-medium"> That&apos;s the threshold for an FDA warning letter.</span>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-28 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-[13px] font-semibold text-[#55E039] uppercase tracking-wider mb-4">How it works</p>
            <h2 className="text-[2.5rem] sm:text-[3rem] font-bold tracking-[-0.02em] text-white">Three steps. Under 30 seconds.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Paste Your Content", desc: "Copy any marketing text into the scanner. Website copy, social captions, ad text, patient emails, call scripts — any content that represents your clinic publicly." },
              { step: "02", title: "Review Your Score", desc: "Receive an instant 0–100 compliance score. Every flagged phrase is highlighted by risk level with a clear explanation of which FDA/FTC rule it violates." },
              { step: "03", title: "Rewrite Automatically", desc: "One click rewrites your entire content to meet FDA/FTC guidelines. The AI preserves your clinic's voice while replacing every violation with a compliant alternative." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-8 backdrop-blur-sm hover:border-[#55E039]/10 transition-colors duration-500">
                <span className="text-[13px] font-mono font-bold text-[#55E039]/40">{item.step}</span>
                <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-[13px] leading-[1.7] text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 border-y border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0814] to-[#060208]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-[13px] font-semibold text-[#55E039] uppercase tracking-wider mb-4">Platform</p>
            <h2 className="text-[2.5rem] sm:text-[3rem] font-bold tracking-[-0.02em] text-white">
              Everything you need to<br className="hidden sm:block" /> stay compliant.
            </h2>
            <p className="mt-4 text-[15px] text-slate-500 max-w-xl mx-auto">
              One platform to scan, fix, and monitor all your clinic&apos;s marketing content.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-white/[0.04] bg-white/[0.015] p-7 transition-all duration-500 hover:border-[#55E039]/15 hover:bg-[#55E039]/[0.02]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#55E039]/[0.06] border border-[#55E039]/10 text-[#55E039] mb-5 group-hover:bg-[#55E039] group-hover:text-white group-hover:border-[#55E039] group-hover:shadow-lg group-hover:shadow-[#55E039]/20 transition-all duration-500">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-white">{f.title}</h3>
                <p className="mt-2.5 text-[13px] leading-[1.7] text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Library Preview */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-[13px] font-semibold text-[#89E3E4] uppercase tracking-wider mb-4">Compliance library</p>
            <h2 className="text-[2.5rem] sm:text-[3rem] font-bold tracking-[-0.02em] text-white">
              Real violations. Real alternatives.
            </h2>
            <p className="mt-4 text-[15px] text-slate-500 max-w-xl mx-auto">
              Every rule is sourced from actual FDA warning letters and FTC enforcement actions.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-4xl mx-auto">
            {libraryExamples.map((ex) => (
              <div key={ex.banned} className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-6 hover:border-white/[0.08] transition-colors duration-500">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase ${ex.risk === "HIGH" ? "text-red-400 bg-red-500/[0.08] border border-red-500/10" : "text-amber-400 bg-amber-500/[0.08] border border-amber-500/10"}`}>
                    {ex.risk} risk
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">{ex.source}</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-1 h-5 w-5 rounded-full bg-red-500/[0.08] border border-red-500/10 flex items-center justify-center">
                      <span className="text-red-400 text-[10px]">✕</span>
                    </span>
                    <div>
                      <span className="text-[11px] text-slate-600 uppercase tracking-wider font-medium">Violation</span>
                      <p className="text-[14px] font-medium text-red-400 mt-0.5">&quot;{ex.banned}&quot;</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-1 h-5 w-5 rounded-full bg-[#55E039]/[0.08] border border-[#55E039]/10 flex items-center justify-center">
                      <CheckCircle2 className="text-[#55E039] h-3 w-3" />
                    </span>
                    <div>
                      <span className="text-[11px] text-slate-600 uppercase tracking-wider font-medium">Compliant</span>
                      <p className="text-[14px] text-[#55E039]/90 mt-0.5">&quot;{ex.alternative}&quot;</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-[13px] text-slate-600">
            300+ rules in the full library. Updated daily from live enforcement data.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-28 border-y border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-[#55E039] uppercase tracking-wider mb-4">Pricing</p>
            <h2 className="text-[2.5rem] sm:text-[3rem] font-bold tracking-[-0.02em] text-white">One plan. Everything included.</h2>
            <p className="mt-4 text-[15px] text-slate-500">No tiers. No hidden fees. No contracts.</p>
          </div>
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl border border-[#55E039]/15 bg-gradient-to-b from-[#55E039]/[0.03] to-transparent p-10 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-[#55E039]/40 to-transparent" />
              <div className="text-center mb-10">
                <p className="text-[4rem] font-extrabold tracking-tight text-white leading-none">
                  $497
                </p>
                <p className="mt-2 text-[15px] text-slate-500">per month. Cancel anytime.</p>
              </div>
              <ul className="space-y-4 mb-10">
                {checklist.map((item) => (
                  <li key={item} className="flex items-center gap-3.5">
                    <CheckCircle2 className="h-[18px] w-[18px] text-[#55E039] shrink-0" />
                    <span className="text-[14px] text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="group flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3DBF2A] text-[15px] font-semibold text-white shadow-xl shadow-[#55E039]/25 hover:shadow-[#55E039]/40 transition-all duration-300">
                Get Started Now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <p className="mt-6 text-center text-[12px] text-slate-600 leading-relaxed">
                A single FDA warning letter costs more in legal fees<br />than years of RegenCompliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-[#55E039] uppercase tracking-wider mb-4">FAQ</p>
            <h2 className="text-[2.5rem] font-bold tracking-[-0.02em] text-white">Common questions</h2>
          </div>
          <Accordion className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-white/[0.04] bg-white/[0.015] px-6 backdrop-blur-sm data-[state=open]:border-white/[0.08]">
                <AccordionTrigger className="text-left text-[15px] font-medium text-white py-5">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-[14px] text-slate-500 leading-[1.7] pb-5">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-28 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#55E039]/[0.02] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#55E039]/[0.03] rounded-full blur-[100px]" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-[2.5rem] sm:text-[3rem] font-bold tracking-[-0.02em] text-white leading-tight">
            Your next post could trigger<br className="hidden sm:block" /> a federal investigation.
          </h2>
          <p className="mt-6 text-[17px] text-slate-400 leading-relaxed max-w-xl mx-auto">
            Every day you publish without scanning is a day you&apos;re exposed. RegenCompliance takes 30 seconds.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/login" className="group inline-flex h-[52px] items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3DBF2A] px-8 text-[15px] font-semibold text-white shadow-xl shadow-[#55E039]/25 hover:shadow-[#55E039]/40 transition-all duration-300">
              Get Started — $497/mo
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/demo" className="inline-flex h-[52px] items-center gap-2.5 rounded-xl border border-white/[0.08] px-8 text-[15px] font-medium text-slate-300 hover:bg-white/[0.03] transition-all duration-300">
              Try Demo First
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#55E039] to-[#3DBF2A]">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-[15px] font-bold text-white">RegenCompliance</span>
            </div>
            <div className="flex gap-8 text-[13px] text-slate-600">
              <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/[0.03]">
            <p className="text-center text-[11px] text-slate-700 leading-relaxed">
              RegenCompliance is an educational compliance tool and does not constitute legal or regulatory advice.
              Not affiliated with the FDA or FTC. &copy; 2026 RegenCompliance. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
