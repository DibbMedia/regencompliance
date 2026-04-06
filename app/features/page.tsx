"use client"

import Link from "next/link"
import { CheckoutButton } from "@/components/checkout-button"
import {
  ArrowRight,
  CheckCircle2,
  Scan,
  Pencil,
  BookOpen,
  Bell,
  Clock,
  Users,
  Lock,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Database,
  RefreshCw,
  Eye,
  Zap,
  Target,
  BarChart3,
  Globe,
  Mail,
  FileSearch,
  Settings,
  Download,
} from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"

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

const scannerCapabilities = [
  "Website copy and landing pages",
  "Social media posts and captions",
  "Google and Meta ad copy",
  "Patient email campaigns",
  "Sales scripts and phone scripts",
  "Blog posts and educational content",
  "Brochure and print material text",
  "Video scripts and podcast talking points",
]

const rewriterBenefits = [
  "Preserves your clinic's unique voice and tone",
  "Maintains medical accuracy while removing risk",
  "Offers multiple compliant alternatives per violation",
  "Explains why each change was made",
  "One-click accept or manual editing",
  "Bulk rewrite mode for entire pages",
]

const libraryStats = [
  { label: "Active compliance rules", value: "300+" },
  { label: "FDA warning letters analyzed", value: "1,200+" },
  { label: "FTC enforcement actions tracked", value: "450+" },
  { label: "New rules added monthly", value: "15-30" },
]

const auditFeatures = [
  "Timestamped record of every scan",
  "Before and after content comparison",
  "Compliance score history over time",
  "PDF export for legal review",
  "CSV export for spreadsheet analysis",
  "Permanent cloud storage of all records",
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#55E039]/[0.06] rounded-full blur-[150px]" />
          <GridPattern />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#55E039]/10 border border-[#55E039]/20 px-4 py-2 text-xs font-semibold text-[#55E039] mb-8">
              <ShieldCheck className="h-3.5 w-3.5" />
              Platform Features
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1]">
              Every tool you need to
              <br />
              <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">stay compliant.</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
              RegenCompliance combines real-time scanning, AI-powered rewrites, and a living compliance library into a single platform built exclusively for regenerative medicine clinics.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FEATURE 1: SCANNER ============ */}
      <section className="py-20 ">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/20 flex items-center justify-center">
                  <Scan className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.15em]">Core Feature</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Live Compliance Scanner</h2>
                </div>
              </div>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                The compliance scanner is the heart of RegenCompliance. Paste any marketing content into the scanner and receive an instant compliance score with line-by-line analysis of every potential FDA or FTC violation. The scanner cross-references your content against our database of over 300 active compliance rules derived from real enforcement actions, warning letters, and regulatory guidance documents.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Unlike generic grammar tools or basic keyword checkers, our scanner understands context. It knows the difference between a patient testimonial that crosses the line into an implied health claim and one that stays within compliant boundaries. It flags phrases like &quot;FDA-approved stem cells&quot; (there are no FDA-approved stem cell products for most orthopedic or aesthetic uses), &quot;cures arthritis,&quot; and &quot;reverses aging&quot; while explaining exactly why each phrase creates regulatory risk.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-8">
                Each scan produces a detailed compliance report with a numeric score from 0 to 100, a severity breakdown of all flagged items (high, medium, low risk), and specific citations to the FDA warning letter or FTC enforcement action that makes each phrase problematic. You see exactly what regulators would see, before they see it.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8">
              <h3 className="text-lg font-bold mb-6">What You Can Scan</h3>
              <div className="space-y-3">
                {scannerCapabilities.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5" />
                    <span className="text-[15px] text-white/70">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-xl bg-white/[0.03] border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-[#55E039]" />
                  <span className="text-sm font-semibold">Scan Coverage</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  The scanner analyzes content at the sentence level, checking each statement against FDA 21 CFR Part 1271 guidance, FTC Section 5 requirements, state medical board advertising rules, and our proprietary database of phrases flagged in real enforcement actions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE 2: AI REWRITER ============ */}
      <section className="py-20 ">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8 order-2 lg:order-1">
              <h3 className="text-lg font-bold mb-6">How the Rewriter Works</h3>
              <div className="space-y-3">
                {rewriterBenefits.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5" />
                    <span className="text-[15px] text-white/70">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-xl bg-white/[0.03] border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-[#55E039]" />
                  <span className="text-sm font-semibold">Before &amp; After Example</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <p className="text-xs font-bold text-red-400 mb-1">FLAGGED</p>
                    <p className="text-sm text-white/70">&quot;Our stem cell therapy cures knee arthritis and eliminates the need for surgery.&quot;</p>
                  </div>
                  <div className="rounded-lg bg-[#55E039]/10 border border-[#55E039]/20 px-4 py-3">
                    <p className="text-xs font-bold text-[#55E039] mb-1">REWRITTEN</p>
                    <p className="text-sm text-white/70">&quot;Many of our patients report reduced joint discomfort and improved mobility following our regenerative protocols. Individual results vary.&quot;</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/20 flex items-center justify-center">
                  <Pencil className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.15em]">AI-Powered</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Compliant Rewriter</h2>
                </div>
              </div>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Finding compliance violations is only half the problem. The real challenge is rewriting flagged content so it remains persuasive and on-brand while meeting regulatory standards. That is exactly what the AI Rewriter does. When the scanner flags a violation, the rewriter generates compliant alternative language with a single click.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                The rewriter is not a generic AI text generator. It has been specifically trained on FDA and FTC enforcement language, compliant marketing examples from leading regenerative medicine practices, and the nuanced difference between a health claim, a structure/function claim, and a patient experience statement. It understands that &quot;heals damaged tissue&quot; is a drug claim that requires FDA approval, while &quot;may support the body&apos;s natural healing processes&quot; is a structure/function claim that carries significantly less regulatory risk.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-8">
                Every rewrite comes with an explanation of why the original language was problematic and what specific regulatory principle the new language satisfies. This means your marketing team does not just get compliant copy — they learn the compliance reasoning behind each change. Over time, your team writes fewer violations because they understand the underlying rules, not just the individual corrections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE 3: COMPLIANCE LIBRARY ============ */}
      <section className="py-20 ">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.15em]">Knowledge Base</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Compliance Library</h2>
                </div>
              </div>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                The Compliance Library is a searchable, categorized database of over 300 active compliance rules specific to regenerative medicine marketing. Each rule includes the banned or risky phrase, a compliant alternative, a risk severity rating, and the original source — whether that is an FDA warning letter, FTC press release, CBER guidance document, or state medical board ruling.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                The library is organized by treatment type (PRP, stem cells, exosomes, peptides, prolotherapy, BMAC, Wharton&apos;s jelly), by claim type (efficacy claims, cure claims, FDA status claims, testimonial claims, comparative claims), and by risk level. You can browse it like a reference manual or search for specific phrases to check before you publish.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-8">
                Think of it as a living compliance manual written specifically for your industry. Healthcare attorneys charge $500 to $1,000 per hour to review marketing content. The compliance library gives your team the same reference knowledge that those attorneys use, accessible instantly and updated automatically as new enforcement actions are published.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8">
              <h3 className="text-lg font-bold mb-6">Library by the Numbers</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {libraryStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-center">
                    <p className="text-2xl font-extrabold text-[#55E039]">{stat.value}</p>
                    <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-4 w-4 text-[#55E039]" />
                  <span className="text-sm font-semibold">Rule Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Stem Cells", "PRP", "Exosomes", "Peptides", "Prolotherapy", "BMAC", "Efficacy Claims", "Cure Claims", "Testimonials", "FDA Status"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-xs text-white/60">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE 4: DAILY UPDATES ============ */}
      <section className="py-20 ">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8 order-2 lg:order-1">
              <h3 className="text-lg font-bold mb-6">How Updates Work</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Eye className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Monitor</p>
                    <p className="text-sm text-white/60">Our system monitors FDA.gov, FTC.gov, and state medical board websites every morning for new enforcement actions, warning letters, and guidance updates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FileSearch className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Analyze</p>
                    <p className="text-sm text-white/60">New enforcement actions are analyzed to extract specific language violations, banned claims, and compliance requirements relevant to regenerative medicine.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <RefreshCw className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Update</p>
                    <p className="text-sm text-white/60">New rules are added to the compliance database within 24 hours. Your next scan automatically includes the updated ruleset.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Alert</p>
                    <p className="text-sm text-white/60">Significant new enforcement actions trigger in-app alerts so your team knows immediately when the compliance landscape shifts.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/20 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.15em]">Always Current</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Daily Rule Updates</h2>
                </div>
              </div>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Compliance is not static. The FDA issues new warning letters to regenerative medicine clinics every month. The FTC regularly updates its enforcement guidance on health claims. State medical boards modify advertising rules. A compliance tool that uses a fixed ruleset from six months ago is already dangerously outdated.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                RegenCompliance solves this with automated daily monitoring. Every morning, our system checks FDA.gov for new warning letters, FTC.gov for new enforcement actions and press releases, and state medical board websites for updated advertising guidance. When a new enforcement action is relevant to regenerative medicine marketing, we extract the specific language violations and add them to the compliance database within 24 hours.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-8">
                This means the language that got a clinic in Florida a warning letter on Monday is already in your scanner&apos;s ruleset by Tuesday. You do not have to track enforcement actions yourself. You do not have to wait for your attorney to email you about new developments. The system handles it automatically, and every scan you run always uses the most current compliance data available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE 5: AUDIT TRAIL ============ */}
      <section className="py-20 ">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.15em]">Documentation</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Audit Trail &amp; Export</h2>
                </div>
              </div>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Every scan you run is permanently logged in your account with a full audit trail. This includes the original content scanned, the compliance score, every violation flagged, every rewrite generated, and the timestamp. This is not just a feature — it is your evidence that you took compliance seriously.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                If the FDA or FTC ever contacts your clinic about marketing content, the first thing your attorney will ask for is documentation showing that you had a compliance review process. RegenCompliance provides that documentation automatically. Every scan generates a compliance report that can be exported as a PDF for legal review or as a CSV for internal record-keeping.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-8">
                The audit trail also tracks your compliance score over time, giving you a clear picture of whether your marketing content is improving or degrading. This is valuable for clinic owners who delegate marketing to staff or agencies — you can verify that content is being checked before it goes live, and you can identify patterns in the types of violations your team tends to make.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8">
              <h3 className="text-lg font-bold mb-6">Audit Trail Includes</h3>
              <div className="space-y-3">
                {auditFeatures.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#55E039] shrink-0 mt-0.5" />
                    <span className="text-[15px] text-white/70">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/10 p-4 text-center">
                  <FileText className="h-5 w-5 text-[#55E039] mx-auto mb-2" />
                  <p className="text-xs text-white/60">PDF Export</p>
                </div>
                <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/10 p-4 text-center">
                  <Download className="h-5 w-5 text-[#55E039] mx-auto mb-2" />
                  <p className="text-xs text-white/60">CSV Export</p>
                </div>
                <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/10 p-4 text-center">
                  <BarChart3 className="h-5 w-5 text-[#55E039] mx-auto mb-2" />
                  <p className="text-xs text-white/60">Score Trends</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE 6: TEAM SEATS ============ */}
      <section className="py-20 ">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8 order-2 lg:order-1">
              <h3 className="text-lg font-bold mb-6">Team Access Use Cases</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Marketing Manager</p>
                    <p className="text-sm text-white/60">Scans all website copy, ad creative, and social media posts before they go live. Uses the compliance library as a reference when briefing freelance writers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Content Writer</p>
                    <p className="text-sm text-white/60">Runs every blog post and email campaign through the scanner during the drafting process. Learns compliance patterns over time through the rewriter explanations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Settings className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Clinic Owner</p>
                    <p className="text-sm text-white/60">Reviews audit trail to verify all marketing content was scanned before publishing. Monitors compliance score trends across the practice.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.15em]">Collaboration</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">3 Team Seats</h2>
                </div>
              </div>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Compliance is not a one-person job. Your clinic owner, marketing manager, and content writer all touch marketing content at different stages. RegenCompliance includes three team seats with every subscription so the people who create, review, and approve content all have direct access to the scanner and compliance library.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Each team member gets their own login with full access to the compliance scanner, AI rewriter, and compliance library. All scan history is shared across the account, so the clinic owner can see what content has been scanned by the marketing team without asking for reports. This creates accountability and ensures that compliance scanning is part of your content workflow, not an afterthought.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-8">
                Team seats eliminate the bottleneck of having a single person responsible for compliance checks. When your content writer can scan their own drafts before submitting them for review, violations get caught earlier in the process. When your front desk staff can check their patient communication templates, you reduce risk at every touchpoint. Compliance becomes embedded in your operations rather than bolted on at the end.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative py-24  overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#55E039]/[0.03] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#55E039]/[0.06] rounded-full blur-[120px]" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Built for regen clinics.<br />Nothing else.
          </h2>
          <p className="mt-5 text-base text-white/60 max-w-md mx-auto leading-relaxed">
            Every feature, every rule, every rewrite is designed specifically for regenerative medicine marketing compliance. No generic tools. No guesswork.
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

      <MarketingFooter />
    </div>
  )
}
