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
  ArrowDown,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

const features = [
  { icon: Scan, title: "Live Compliance Scanner", desc: "Paste any marketing content — website copy, social posts, ad text, emails — and get an instant FDA/FTC compliance score with flagged phrases." },
  { icon: Pencil, title: "One-Click AI Rewriter", desc: "Flagged content gets rewritten by AI to be fully compliant while keeping your original tone and message intact." },
  { icon: BookOpen, title: "300+ Compliance Rules", desc: "A living database of every FDA/FTC-flagged phrase in regenerative medicine, with compliant alternatives for each." },
  { icon: Bell, title: "Daily Rule Updates", desc: "Our scraper checks FDA warning letters and FTC press releases every morning. New enforcement = new rules, automatically." },
  { icon: Clock, title: "Scan History + PDF Export", desc: "Every scan is saved. Review past results, track your compliance over time, and export reports as PDF." },
  { icon: Users, title: "3 Team Seats Included", desc: "Invite your marketing team and front desk staff. Everyone scans independently under your clinic account." },
]

const libraryExamples = [
  { banned: "heals", alternative: "may support healing in some patients", risk: "HIGH" },
  { banned: "FDA-approved stem cells", alternative: "performed in an FDA-registered facility", risk: "HIGH" },
  { banned: "cures arthritis", alternative: "some patients report reduced joint discomfort", risk: "MEDIUM" },
  { banned: "proven to reverse aging", alternative: "patients report feeling more youthful and energetic", risk: "HIGH" },
]

const checklist = [
  "Unlimited compliance scans",
  "AI-powered compliant rewrites",
  "Full compliance library (300+ rules)",
  "Daily FDA/FTC rule updates",
  "Complete scan history + PDF export",
  "In-app enforcement action alerts",
  "3 team seats included",
  "Light & dark mode",
]

const faqs = [
  {
    q: "Is this actual legal advice?",
    a: "No. RegenCompliance is an educational tool only. We strongly recommend having all final content reviewed by a qualified healthcare marketing attorney before publishing.",
  },
  {
    q: "Does this access patient data?",
    a: "Never. RegenCompliance is a text analysis tool only. No PHI, no patient records, no clinical data. There are zero HIPAA requirements because we never touch patient information.",
  },
  {
    q: "How often are rules updated?",
    a: "Daily. Our automated scraper checks FDA warning letter pages and FTC press releases every morning at 9am UTC and adds any new flagged phrases automatically.",
  },
  {
    q: "Who is this for?",
    a: "Regenerative medicine clinics offering PRP, stem cell therapy, exosomes, BMAC, Wharton's jelly, prolotherapy, and peptide therapy. If you market regen treatments, this is built for you.",
  },
  {
    q: "What happens if I cancel?",
    a: "You keep full access until the end of your current billing period. No contracts, no cancellation fees, no penalties. You can resubscribe anytime.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0515] text-slate-100">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0515]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#55E039]">
              <Shield className="h-5 w-5 text-[#0B0515]" />
            </div>
            <span className="text-xl font-bold tracking-tight">RegenCompliance</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/login" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#55E039] px-6 text-sm font-semibold text-[#0B0515] hover:bg-[#4BCC33] transition-colors">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(85,224,57,0.08)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(137,227,228,0.05)_0%,_transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pt-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#55E039]/20 bg-[#55E039]/5 px-4 py-1.5 text-sm font-medium text-[#55E039] mb-8">
              <Shield className="h-3.5 w-3.5" />
              Built exclusively for regenerative medicine clinics
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
              One compliance violation
              <br />
              <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                can shut down your clinic.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              RegenCompliance scans your marketing content against live FDA/FTC guidelines — <strong className="text-white">before you publish.</strong> Instant scoring, flagged phrases, and AI-powered compliant rewrites.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/login" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#55E039] px-8 text-base font-semibold text-[#0B0515] shadow-lg shadow-[#55E039]/20 hover:bg-[#4BCC33] transition-all hover:shadow-[#55E039]/30">
                Start for $497/month
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 px-8 text-base font-medium text-slate-300 hover:bg-white/5 hover:border-white/20 transition-all">
                See How It Works
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#55E039]" />
                No HIPAA data ever
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#EB8622]" />
                Rules updated daily
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#89E3E4]" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Scanner Mockup */}
          <div className="mt-16 mx-auto max-w-4xl">
            <div className="rounded-2xl border border-white/10 bg-[#120B1E] shadow-2xl shadow-black/40 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3 bg-[#1a1225]">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                </div>
                <div className="mx-auto flex h-6 items-center rounded-md bg-white/5 px-3 text-xs text-slate-500">
                  compliance.regenportal.com/dashboard/scanner
                </div>
              </div>
              <div className="grid md:grid-cols-5 divide-x divide-white/5">
                <div className="md:col-span-3 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#55E039]" />
                    <span className="font-semibold text-white">Compliance Scanner</span>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-400 leading-relaxed">
                    <span className="bg-red-500/15 text-red-400 px-1 rounded font-medium">Our stem cell therapy cures arthritis</span> and <span className="bg-red-500/15 text-red-400 px-1 rounded font-medium">heals damaged tissue</span> with <span className="bg-yellow-500/15 text-yellow-400 px-1 rounded font-medium">FDA-approved stem cells</span>. Patients experience <span className="bg-red-500/15 text-red-400 px-1 rounded font-medium">guaranteed results</span> with <span className="bg-yellow-500/15 text-yellow-400 px-1 rounded font-medium">no side effects</span>.
                  </div>
                  <div className="h-10 w-full rounded-lg bg-[#55E039]/10 border border-[#55E039]/20 flex items-center justify-center text-sm font-medium text-[#55E039]">
                    Scan for Compliance Issues
                  </div>
                </div>
                <div className="md:col-span-2 p-6 space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                        <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round" className="stroke-red-500" strokeDasharray="264" strokeDashoffset="198" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-red-400">25</span>
                    </div>
                    <span className="mt-2 text-xs text-slate-500">Compliance Score</span>
                  </div>
                  <div className="flex justify-center gap-3 text-xs">
                    <span className="text-red-400 font-medium">3 high</span>
                    <span className="text-yellow-400 font-medium">2 medium</span>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-md border border-red-500/20 bg-red-500/5 p-2.5">
                      <div className="flex items-center justify-between">
                        <code className="text-xs text-red-400">&quot;cures arthritis&quot;</code>
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">HIGH</span>
                      </div>
                    </div>
                    <div className="rounded-md border border-red-500/20 bg-red-500/5 p-2.5">
                      <div className="flex items-center justify-between">
                        <code className="text-xs text-red-400">&quot;heals damaged tissue&quot;</code>
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">HIGH</span>
                      </div>
                    </div>
                    <div className="rounded-md border border-yellow-500/20 bg-yellow-500/5 p-2.5">
                      <div className="flex items-center justify-between">
                        <code className="text-xs text-yellow-400">&quot;FDA-approved&quot;</code>
                        <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">MED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Stats */}
      <section className="border-y border-white/5 bg-[#120B1E] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1.5 text-sm font-medium text-red-400 mb-4">
              <AlertTriangle className="h-3.5 w-3.5" />
              The risk is real
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">The FDA and FTC are watching.</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
              Regenerative medicine clinics are the #1 target for enforcement in 2025.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { stat: "200+", desc: "FDA enforcement letters issued in 2024 — the highest in nearly 25 years" },
              { stat: "$5.15M", desc: "What deceptive stem cell marketing cost one clinic group in a single FTC settlement" },
              { stat: "Permanent Ban", desc: "The FTC's punishment for repeat offenders — a permanent marketing ban", small: true },
            ].map((item) => (
              <div key={item.stat} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-red-500/[0.03] to-transparent p-8 text-center">
                <p className={`font-extrabold text-red-400 ${item.small ? "text-3xl leading-tight" : "text-5xl"}`}>
                  {item.stat}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-lg text-slate-400">
            One wrong word on your website. One Instagram caption. One email to your list.<br className="hidden sm:block" />
            <strong className="text-white">That&apos;s all it takes.</strong>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">How It Works</h2>
            <p className="mt-3 text-slate-400">Three steps. Under 30 seconds.</p>
          </div>
          <div className="grid gap-12 sm:grid-cols-3">
            {[
              { step: "1", title: "Paste Your Content", desc: "Copy any marketing text into the scanner — website copy, social posts, ad text, emails, patient scripts." },
              { step: "2", title: "Get Your Compliance Score", desc: "Instantly see your 0-100 score, every flagged phrase highlighted by risk level, and clear explanations." },
              { step: "3", title: "Rewrite in One Click", desc: "AI rewrites your entire content to be fully FDA/FTC compliant while keeping your original voice and tone." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#55E039]/10 border border-[#55E039]/20 text-[#55E039] text-2xl font-bold mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-white/5 bg-[#120B1E] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">Everything You Need to Stay Compliant</h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
              One tool to scan, fix, and monitor all your marketing content.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-white/5 bg-[#0B0515] p-6 transition-all hover:border-[#55E039]/20 hover:bg-[#55E039]/[0.02]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#55E039]/10 text-[#55E039] mb-4 group-hover:bg-[#55E039] group-hover:text-[#0B0515] transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Library Preview */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#89E3E4]/20 bg-[#89E3E4]/5 px-4 py-1.5 text-sm font-medium text-[#89E3E4] mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              Live compliance database
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">From the Compliance Library</h2>
            <p className="mt-3 text-slate-400">
              Real FDA/FTC-flagged phrases with safe, compliant alternatives
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-4xl mx-auto">
            {libraryExamples.map((ex) => (
              <div key={ex.banned} className="rounded-2xl border border-white/5 bg-[#120B1E] p-5 space-y-3 hover:border-[#55E039]/10 transition-colors">
                <span className="inline-block text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase">{ex.risk} risk</span>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-red-500/10 flex items-center justify-center">
                      <span className="text-red-400 text-xs">✕</span>
                    </span>
                    <span className="text-sm font-medium text-red-400">
                      &quot;{ex.banned}&quot;
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-[#55E039]/10 flex items-center justify-center">
                      <CheckCircle2 className="text-[#55E039] h-3 w-3" />
                    </span>
                    <span className="text-sm text-[#55E039]">
                      &quot;{ex.alternative}&quot;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            300+ rules in the full library — updated daily from live FDA/FTC enforcement actions.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y border-white/5 bg-[#120B1E] py-24">
        <div className="mx-auto max-w-lg px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">Simple, Transparent Pricing</h2>
          <p className="mt-3 text-slate-400">One plan. Everything included. Cancel anytime.</p>
          <div className="mt-10 rounded-2xl border-2 border-[#55E039]/20 bg-[#0B0515] p-8 shadow-xl shadow-[#55E039]/5">
            <div className="mb-8">
              <p className="text-6xl font-extrabold tracking-tight text-white">
                $497
                <span className="text-xl font-normal text-slate-500">/mo</span>
              </p>
              <p className="mt-2 text-sm text-slate-500">Cancel anytime. No contracts.</p>
            </div>
            <ul className="space-y-3 text-left mb-8">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#55E039] text-base font-semibold text-[#0B0515] shadow-lg shadow-[#55E039]/20 hover:bg-[#4BCC33] transition-all">
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-5 text-xs text-slate-500">
              One violation costs more than years of RegenCompliance.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">Frequently Asked Questions</h2>
          </div>
          <Accordion className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-white/5 bg-[#120B1E] px-5">
                <AccordionTrigger className="text-left font-medium text-white">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/5 bg-gradient-to-b from-[#55E039]/[0.03] to-[#0B0515] py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Stop guessing. Start scanning.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Your next Instagram post, website update, or email blast could trigger an FDA warning letter. Check it first.
          </p>
          <div className="mt-8">
            <Link href="/login" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#55E039] px-10 text-base font-semibold text-[#0B0515] shadow-lg shadow-[#55E039]/20 hover:bg-[#4BCC33] transition-all">
              Get Started — $497/month
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 bg-[#120B1E]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#55E039]">
                <Shield className="h-4 w-4 text-[#0B0515]" />
              </div>
              <span className="text-lg font-bold text-white">RegenCompliance</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-600 leading-relaxed">
            RegenCompliance is an educational compliance tool and does not constitute legal or regulatory advice.
            Not affiliated with the FDA or FTC. &copy; 2026 RegenCompliance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
