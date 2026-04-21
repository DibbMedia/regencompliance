"use client"

import Link from "next/link"
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
import { MarketingBg } from "@/components/marketing-bg"
import { CheckoutButton } from "@/components/checkout-button"
import { IS_LAUNCHED } from "@/lib/env"

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
      <MarketingBg />
      <MarketingHeader />

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">PLATFORM FEATURES</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1]">
              Every tool you need to
              <br />
              <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">stay compliant.</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
              RegenCompliance combines real-time scanning, AI-powered rewrites, and a living compliance library into a single platform purpose-built for healthcare marketing compliance — from regenerative medicine and med spas to dental, dermatology, weight loss, and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FEATURE 1: SCANNER ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center">
                  <Scan className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-1">CORE FEATURE</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Live Compliance Scanner</h2>
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
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:bg-white/[0.06] transition-all duration-300">
              <h3 className="text-lg font-extrabold text-white mb-6">What You Can Scan</h3>
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
                  <span className="text-sm font-extrabold text-white">Scan Coverage</span>
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
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:bg-white/[0.06] transition-all duration-300 order-2 lg:order-1">
              <h3 className="text-lg font-extrabold text-white mb-6">How the Rewriter Works</h3>
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
                  <span className="text-sm font-extrabold text-white">Before &amp; After Example</span>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <p className="text-xs font-bold text-red-400 mb-1">FLAGGED</p>
                    <p className="text-sm text-white/70">&quot;Our stem cell therapy cures knee arthritis and eliminates the need for surgery.&quot;</p>
                  </div>
                  <div className="rounded-lg bg-[#55E039]/10 border border-[#55E039]/15 px-4 py-3">
                    <p className="text-xs font-bold text-[#55E039] mb-1">REWRITTEN</p>
                    <p className="text-sm text-white/70">&quot;Many of our patients report reduced joint discomfort and improved mobility following our regenerative protocols. Individual results vary.&quot;</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center">
                  <Pencil className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-1">AI-POWERED</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Compliant Rewriter</h2>
                </div>
              </div>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Finding compliance violations is only half the problem. The real challenge is rewriting flagged content so it remains persuasive and on-brand while meeting regulatory standards. That is exactly what the AI Rewriter does. When the scanner flags a violation, the rewriter generates compliant alternative language with a single click.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                The rewriter is not a generic AI text generator. It has been specifically trained on FDA and FTC enforcement language, compliant marketing examples from leading healthcare practices across all specialties, and the nuanced difference between a health claim, a structure/function claim, and a patient experience statement. It understands that &quot;heals damaged tissue&quot; is a drug claim that requires FDA approval, while &quot;may support the body&apos;s natural healing processes&quot; is a structure/function claim that carries significantly less regulatory risk.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-8">
                Every rewrite comes with an explanation of why the original language was problematic and what specific regulatory principle the new language satisfies. This means your marketing team does not just get compliant copy — they learn the compliance reasoning behind each change. Over time, your team writes fewer violations because they understand the underlying rules, not just the individual corrections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE 3: COMPLIANCE LIBRARY ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-1">KNOWLEDGE BASE</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Compliance Library</h2>
                </div>
              </div>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                The Compliance Library is a searchable, categorized database of over 300 active compliance rules covering healthcare marketing across all practice types. Each rule includes the banned or risky phrase, a compliant alternative, a risk severity rating, and the original source — whether that is an FDA warning letter, FTC press release, CBER guidance document, or state medical board ruling.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                The library is organized by treatment type (PRP, stem cells, exosomes, peptides, prolotherapy, BMAC, Wharton&apos;s jelly, dermal fillers, weight loss treatments, dental implants, chiropractic, IV therapy), by claim type (efficacy claims, cure claims, FDA status claims, testimonial claims, comparative claims), and by risk level. You can browse it like a reference manual or search for specific phrases to check before you publish.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-8">
                Think of it as a living compliance manual written specifically for your industry. Healthcare attorneys charge $500 to $1,000 per hour to review marketing content. The compliance library gives your team the same reference knowledge that those attorneys use, accessible instantly and updated automatically as new enforcement actions are published.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:bg-white/[0.06] transition-all duration-300">
              <h3 className="text-lg font-extrabold text-white mb-6">Library by the Numbers</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {libraryStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-center">
                    <p className="text-2xl font-extrabold text-[#55E039]">{stat.value}</p>
                    <p className="text-xs text-white/65 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-4 w-4 text-[#55E039]" />
                  <span className="text-sm font-extrabold text-white">Rule Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Stem Cells", "PRP", "Exosomes", "Peptides", "Prolotherapy", "BMAC", "Dermal Fillers", "Weight Loss", "Dental", "IV Therapy", "Efficacy Claims", "Cure Claims", "Testimonials", "FDA Status"].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-xs text-white/60">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE 4: DAILY UPDATES ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:bg-white/[0.06] transition-all duration-300 order-2 lg:order-1">
              <h3 className="text-lg font-extrabold text-white mb-6">How Updates Work</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Eye className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white mb-1">Monitor</p>
                    <p className="text-sm text-white/60">Our system monitors FDA.gov, FTC.gov, and state medical board websites every morning for new enforcement actions, warning letters, and guidance updates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FileSearch className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white mb-1">Analyze</p>
                    <p className="text-sm text-white/60">New enforcement actions are analyzed to extract specific language violations, banned claims, and compliance requirements relevant to healthcare marketing — including regenerative medicine, aesthetics, dental, weight loss, and more.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <RefreshCw className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white mb-1">Update</p>
                    <p className="text-sm text-white/60">New rules are added to the compliance database within 24 hours. Your next scan automatically includes the updated ruleset.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white mb-1">Alert</p>
                    <p className="text-sm text-white/60">Significant new enforcement actions trigger in-app alerts so your team knows immediately when the compliance landscape shifts.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-1">ALWAYS CURRENT</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Daily Rule Updates</h2>
                </div>
              </div>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                Compliance is not static. The FDA issues new warning letters to healthcare practices every month. The FTC regularly updates its enforcement guidance on health claims. State medical boards modify advertising rules. A compliance tool that uses a fixed ruleset from six months ago is already dangerously outdated.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-6">
                RegenCompliance solves this with automated daily monitoring. Every morning, our system checks FDA.gov for new warning letters, FTC.gov for new enforcement actions and press releases, and state medical board websites for updated advertising guidance. When a new enforcement action is relevant to healthcare marketing, we extract the specific language violations and add them to the compliance database within 24 hours.
              </p>
              <p className="text-base text-white/70 leading-relaxed mb-8">
                This means the language that got a clinic in Florida a warning letter on Monday is already in your scanner&apos;s ruleset by Tuesday. You do not have to track enforcement actions yourself. You do not have to wait for your attorney to email you about new developments. The system handles it automatically, and every scan you run always uses the most current compliance data available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURE 5: AUDIT TRAIL ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-1">DOCUMENTATION</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Audit Trail &amp; Export</h2>
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
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:bg-white/[0.06] transition-all duration-300">
              <h3 className="text-lg font-extrabold text-white mb-6">Audit Trail Includes</h3>
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
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-7 hover:bg-white/[0.06] transition-all duration-300 order-2 lg:order-1">
              <h3 className="text-lg font-extrabold text-white mb-6">Team Access Use Cases</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white mb-1">Marketing Manager</p>
                    <p className="text-sm text-white/60">Scans all website copy, ad creative, and social media posts before they go live. Uses the compliance library as a reference when briefing freelance writers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white mb-1">Content Writer</p>
                    <p className="text-sm text-white/60">Runs every blog post and email campaign through the scanner during the drafting process. Learns compliance patterns over time through the rewriter explanations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#55E039]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Settings className="h-4 w-4 text-[#55E039]" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white mb-1">Clinic Owner</p>
                    <p className="text-sm text-white/60">Reviews audit trail to verify all marketing content was scanned before publishing. Monitors compliance score trends across the practice.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center">
                  <Users className="h-6 w-6 text-[#55E039]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-1">COLLABORATION</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">3 Team Seats</h2>
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

      {/* ============ UNDER THE HOOD ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">Under the hood</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How the scan actually works.
            </h2>
            <p className="mt-4 text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
              Every scan runs through a five-stage pipeline. Nothing about this is magic &mdash; it&rsquo;s deterministic pattern matching layered with contextual AI analysis, all backed by a ruleset sourced directly from enforcement actions.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-5 sm:grid-cols-2">
            {[
              {
                n: "01",
                title: "Normalize + segment",
                desc: "Your input (text / URL / file) is cleaned, de-duplicated, and split into analyzable units — sentences for paste mode, DOM elements for URL mode, text blocks for files.",
              },
              {
                n: "02",
                title: "Rule-set lookup",
                desc: "Each unit is checked against 300+ phrase-level rules from FDA warning letters, FTC press releases, state medical board guidance, and DOJ healthcare fraud filings. Rule matches are surfaced with severity and source citation.",
              },
              {
                n: "03",
                title: "Contextual AI pass",
                desc: "An Anthropic Claude model runs over flagged content to catch claims that rule-matching alone can't — implied disease claims, structure/function line-crossings, and testimonial-embedded violations. No-training setting enabled on every request.",
              },
              {
                n: "04",
                title: "Severity + score",
                desc: "Violations are classified as High / Medium / Low risk based on the original enforcement source and contextual severity. A 0–100 compliance score rolls up all flags, weighted by risk level and content length.",
              },
              {
                n: "05",
                title: "One-click rewrite",
                desc: "If you ask for a rewrite, Claude Sonnet regenerates the content under a compliance-aware prompt tuned on compliant healthcare-marketing examples. Your voice is preserved, violations removed, individual-variation disclosures added where appropriate.",
              },
            ].map((stage) => (
              <div
                key={stage.n}
                className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:border-[#55E039]/20 hover:bg-white/[0.06] transition-all duration-300"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 text-[#55E039] text-sm font-bold font-mono">
                  {stage.n}
                </span>
                <h3 className="mt-5 text-base font-extrabold text-white">{stage.title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3 max-w-5xl mx-auto">
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
              <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.15em] mb-3">
                Privacy
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                Your content is processed, scored, and stored only in your account. Nothing feeds into model training &mdash; Anthropic&rsquo;s no-training flag is set on every request. Scans run over TLS and are encrypted at rest with AES-256.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
              <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.15em] mb-3">
                Freshness
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                The ruleset updates daily from automated monitoring of FDA.gov, FTC.gov, and state medical board sites. New enforcement actions land in your scanner within 24 hours &mdash; no manual update cycle, no quarterly rule refresh.
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
              <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.15em] mb-3">
                Honest limits
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                This is an educational compliance tool. It is not a law firm, and it does not replace qualified healthcare marketing counsel. What it does is catch the pattern-matchable violations cheaply so your attorney&rsquo;s time is spent on judgment calls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">GET STARTED</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Built for healthcare practices.<br />Every specialty covered.
          </h2>
          <p className="mt-5 text-base text-white/60 max-w-md mx-auto leading-relaxed">
            Every feature, every rule, every rewrite is designed specifically for healthcare marketing compliance — regenerative medicine, med spas, dental, plastic surgery, dermatology, weight loss, and more. No generic tools. No guesswork.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {IS_LAUNCHED ? (
              <CheckoutButton className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:brightness-110 transition-all cursor-pointer disabled:opacity-70">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </CheckoutButton>
            ) : (
              <Link href="/waitlist" className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#55E039] to-[#3BB82A] px-8 text-[15px] font-bold text-[#0a0a0a] shadow-[0_4px_20px_rgba(85,224,57,0.3)] hover:brightness-110 transition-all cursor-pointer">
                Join the Waitlist
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link href="/demo" className="inline-flex h-12 items-center rounded-xl border border-[#55E039]/20 bg-[#55E039]/[0.04] px-8 text-[15px] font-bold text-[#55E039] shadow-[0_0_20px_rgba(85,224,57,0.08)] hover:bg-[#55E039]/[0.08] transition-all">
              Try Demo First
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
