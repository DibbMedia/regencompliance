"use client"

import { useState } from "react"
import { Search, ChevronDown, Rocket, BarChart3, Shield, Wrench, CreditCard } from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

interface FaqSection {
  title: string
  icon: React.ElementType
  items: FaqItem[]
}

const FAQ_DATA: FaqSection[] = [
  {
    title: "Getting Started",
    icon: Rocket,
    items: [
      {
        question: "How do I run my first scan?",
        answer:
          "RegenCompliance offers three ways to scan your content. Paste mode lets you copy and paste text directly into the scanner. URL mode lets you enter any webpage URL and we will extract and scan the content automatically. File upload mode accepts .docx, .pdf, and .txt files up to 10MB. Choose your content type, hit Scan, and your compliance report will be ready in seconds.",
      },
      {
        question: "What do compliance scores mean?",
        answer:
          "Your compliance score is a 0-100 rating of how safe your content is to publish. 90-100 means excellent with minimal compliance risk. 80-89 is good with only minor issues to review. 60-79 means the content needs attention due to medium-risk violations. 40-59 indicates high risk with significant compliance issues. 0-39 is critical, meaning multiple serious violations that require immediate action before publishing.",
      },
      {
        question: "How does the AI rewrite work?",
        answer:
          "When our scanner flags non-compliant phrases, the AI rewrite engine generates a compliant alternative that preserves your original voice and intent. It removes or restructures cure claims, unsupported guarantees, and misleading language while keeping the persuasive tone your marketing needs. You can copy the rewrite with one click and use it directly in your content.",
      },
      {
        question: "How do I add my website for monitoring?",
        answer:
          "Navigate to the Sites section from the sidebar. Enter your domain name and we will automatically discover your pages. Once added, your site receives automatic weekly compliance scans. You will get notifications whenever new issues are detected so you can fix them before they become a problem.",
      },
      {
        question: "How do I invite team members?",
        answer:
          "Go to Account, then Team from the sidebar. Enter your team member's email address and they will receive an invitation to join your workspace. Every plan includes 3 team seats so your compliance manager, content writer, and marketing lead can all stay in the loop.",
      },
    ],
  },
  {
    title: "Understanding Your Results",
    icon: BarChart3,
    items: [
      {
        question: "What are RED LIGHT violations?",
        answer:
          "Red light violations are the most serious compliance issues. These include cure claims (like saying a treatment \"cures\" or \"reverses\" a disease), guaranteed outcomes, FDA misrepresentation, and unsubstantiated health claims. Red light content should NEVER appear in your marketing materials. These are the types of claims that trigger FDA warning letters and FTC enforcement actions.",
      },
      {
        question: "What are YELLOW LIGHT warnings?",
        answer:
          "Yellow light warnings flag phrases that are acceptable when paired with proper disclaimers but risky without them. Common examples include research references that need \"results may vary\" language, off-label treatment mentions that need clarification about FDA status, and patient outcome descriptions that need typicality disclosures. Review each yellow flag and add the recommended disclaimer language.",
      },
      {
        question: "What are GREEN LIGHT patterns?",
        answer:
          "Green light patterns are approved language frameworks that are safe to use in your marketing. These include educational overviews that explain how treatments work without making claims, consultation framing that invites patients to discuss options with a provider, process descriptions that explain what happens during a procedure, and general wellness language. Our compliance library has hundreds of green light examples you can model your content after.",
      },
      {
        question: "Why did my score change between scans?",
        answer:
          "Our compliance rules are updated daily based on new FDA warning letters, FTC enforcement actions, and regulatory guidance. When new enforcement patterns emerge, we add rules to catch similar language. This means content that was clean last month may get flagged today if the regulatory landscape has shifted. This is a feature, not a bug. It keeps you ahead of enforcement trends rather than reacting to them.",
      },
      {
        question: "What does 'off-label' mean?",
        answer:
          "Off-label refers to using an FDA-cleared product or treatment for a purpose that has not been specifically approved by the FDA. For example, PRP (platelet-rich plasma) is widely used in orthopedic and aesthetic medicine, but the FDA has not approved it for many of those specific applications. You can discuss off-label treatments in your marketing, but you must be transparent about FDA status and avoid implying FDA endorsement for unapproved uses.",
      },
    ],
  },
  {
    title: "Compliance Basics",
    icon: Shield,
    items: [
      {
        question: "What is the FDA's role in healthcare marketing?",
        answer:
          "The FDA regulates marketing claims across all healthcare specialties. In regenerative medicine, it regulates products under Section 361 HCT/Ps and Section 351 biologics. For med spas, it oversees device and injectable marketing. For dental, dermatology, weight loss, and other practices, it enforces rules on drug and device claims. Any time you market a treatment that claims to diagnose, cure, mitigate, treat, or prevent a disease, the FDA has jurisdiction. This applies equally to regenerative medicine clinics, med spas, dental practices, plastic surgery, dermatology, weight loss clinics, chiropractic offices, and wellness centers.",
      },
      {
        question: "What is the FTC's role?",
        answer:
          "The Federal Trade Commission enforces truth-in-advertising laws for health claims. Under FTC rules, any health claim you make in marketing must be substantiated by competent and reliable scientific evidence. The FTC also enforces endorsement and testimonial guidelines, requiring that patient testimonials reflect typical results and that any material connections are disclosed. FTC penalties can include significant fines and mandatory corrective advertising.",
      },
      {
        question: "Can I say 'FDA approved'?",
        answer:
          "Only if the specific treatment for the specific indication you are describing is genuinely FDA-approved. Many popular treatments across healthcare — stem cell therapies, PRP, exosomes, many med spa injectables, off-label weight loss drugs, and certain dental products — are NOT FDA-approved for their commonly marketed uses. Saying \"FDA approved\" when a treatment is not approved for that use is one of the fastest ways to trigger an FDA warning letter. Instead, use accurate language like \"FDA-cleared device\" when applicable, or describe the treatment without referencing FDA status.",
      },
      {
        question: "Can I use patient testimonials?",
        answer:
          "Yes, but with important safeguards. You need a signed HIPAA release from the patient. The testimonial must include a typicality disclosure explaining that results are not guaranteed and individual outcomes vary. The testimonial itself cannot contain cure claims or guaranteed outcomes. And you should never compensate patients for testimonials without disclosing that relationship. When done right, testimonials are powerful. When done wrong, they are an enforcement magnet.",
      },
      {
        question: "What about before/after photos?",
        answer:
          "Before and after photos are allowed but require careful handling. You need a signed release from the patient. Photos must be taken under consistent conditions (same lighting, angle, distance). The timeframe between photos must be disclosed. You should include a \"results may vary\" disclaimer. And the photos should accurately represent what happened without digital enhancement that exaggerates the outcome. Misleading before/after photos are a common FTC enforcement target.",
      },
      {
        question: "Do these rules apply to social media?",
        answer:
          "Yes, absolutely. The same FDA and FTC compliance standards apply to all marketing channels including Instagram, Facebook, TikTok, YouTube, X (Twitter), LinkedIn, and any other platform. Social media posts, stories, reels, live streams, and even comments from your official account are all subject to the same rules. In fact, the FTC has been increasingly active in monitoring and enforcing compliance on social media platforms.",
      },
    ],
  },
  {
    title: "Scanner & Features",
    icon: Wrench,
    items: [
      {
        question: "What file types can I upload?",
        answer:
          "The scanner accepts .docx (Microsoft Word), .pdf (Adobe PDF), and .txt (plain text) files up to 10MB in size. We extract the text content from these files and run the same comprehensive compliance analysis as our paste and URL scanning modes. For best results with PDFs, use text-based PDFs rather than scanned images.",
      },
      {
        question: "How often are compliance rules updated?",
        answer:
          "Our rule engine runs automated daily scans of FDA warning letters, FTC enforcement actions, state attorney general actions, and regulatory guidance documents. When new enforcement patterns are identified, rules are added or updated automatically. We also conduct monthly deep reviews with compliance experts to refine rule accuracy and add emerging risk patterns. This means you are always scanning against the latest enforcement landscape.",
      },
      {
        question: "Can I scan competitor websites?",
        answer:
          "Yes. Enter any publicly accessible URL in the URL scanner and we will extract and analyze the content. This is useful for benchmarking your compliance posture against competitors, identifying industry-wide compliance risks, and finding compliant language patterns you can adapt for your own marketing. All scans are private to your account.",
      },
      {
        question: "How does site monitoring work?",
        answer:
          "When you add a site to the Sites section, we crawl and discover all pages on your domain. Every week, we automatically re-scan every page and update compliance scores. If any page drops below your threshold or new violations are detected, you receive a notification. Each page gets its own score so you can pinpoint exactly which pages need attention without reviewing your entire site manually.",
      },
      {
        question: "What is the compliance library?",
        answer:
          "The compliance library is a searchable database of 300+ compliance rules sourced from real FDA warning letters, FTC enforcement actions, and regulatory guidance. Each rule includes the violation pattern, why it is non-compliant, a compliant alternative, and the source enforcement action. Use it to educate your team, audit your own content, and build a compliant content framework from the start.",
      },
      {
        question: "How do I export a compliance report?",
        answer:
          "Open any scan from the Scan History page. Click the \"Export PDF\" button in the header. The PDF report includes the compliance score, all flagged content with explanations, AI-suggested rewrites, and a timestamp. These reports are useful for sharing with legal counsel, compliance officers, or content teams who may not have access to the platform.",
      },
    ],
  },
  {
    title: "Billing & Account",
    icon: CreditCard,
    items: [
      {
        question: "How do I update my payment method?",
        answer:
          "Go to Account & Billing from the sidebar, then click \"Manage Billing.\" This opens the Stripe customer portal where you can update your credit card, change your billing address, and download past invoices. Changes take effect immediately for your next billing cycle.",
      },
      {
        question: "How do I cancel?",
        answer:
          "Navigate to Account & Billing from the sidebar and scroll down to the Danger Zone section. Click \"Cancel Subscription\" and confirm. Your access continues through the end of your current billing period. No partial refunds are issued for unused time within a billing cycle.",
      },
      {
        question: "What happens when I cancel?",
        answer:
          "When you cancel, you retain full access to all features through the end of your current billing period. After that, your account enters a read-only state where you can view past scans but cannot run new ones. Your data is retained for 30 days after your subscription ends. You can reactivate at any time during that window to restore full access and your complete scan history.",
      },
      {
        question: "How do I export my data?",
        answer:
          "Go to Account & Billing and click \"Export My Data.\" This generates a downloadable archive containing all your scan history, flagged content, rewrites, and site monitoring data. This feature ensures GDPR compliance and gives you full ownership of your data regardless of your subscription status.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Navigate to Account & Billing and click \"Delete My Account\" in the Danger Zone. You will be asked to type a confirmation phrase to prevent accidental deletion. This action is permanent and irreversible. All your data, scan history, team members, and site monitoring configurations will be permanently deleted. We recommend exporting your data first.",
      },
    ],
  },
]

function AccordionItem({
  item,
  isOpen,
  onToggle,
  isSearchMatch,
}: {
  item: FaqItem
  isOpen: boolean
  onToggle: () => void
  isSearchMatch: boolean
}) {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isOpen
          ? "border-white/15 bg-white/[0.04]"
          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
      } ${isSearchMatch ? "ring-1 ring-[#55E039]/20" : ""}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <span className="text-sm font-bold text-white leading-relaxed">
          {item.question}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
          <p className="text-sm text-white/70 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpCenterPage() {
  const [search, setSearch] = useState("")
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const query = search.toLowerCase().trim()

  function toggleItem(key: string) {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function matchesSearch(item: FaqItem): boolean {
    if (!query) return true
    return (
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)
    )
  }

  const filteredSections = FAQ_DATA.map((section) => ({
    ...section,
    items: section.items.filter(matchesSearch),
  })).filter((section) => section.items.length > 0)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">
            Knowledge Base
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Help Center</h1>
          <p className="text-sm text-white/50 mt-1">
            Everything you need to know about compliance scanning and staying FDA/FTC safe.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#55E039]/30 focus:ring-1 focus:ring-[#55E039]/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* FAQ Sections */}
      {filteredSections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-8 w-8 text-white/15 mb-4" />
          <p className="text-white/50 font-medium">No results found</p>
          <p className="text-sm text-white/30 mt-1">
            Try a different search term or browse the sections below.
          </p>
        </div>
      ) : (
        filteredSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#55E039]/10">
                <section.icon className="h-3.5 w-3.5 text-[#55E039]" />
              </div>
              <h2 className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em]">
                {section.title}
              </h2>
            </div>

            <div className="space-y-2">
              {section.items.map((item) => {
                const key = `${section.title}-${item.question}`
                return (
                  <AccordionItem
                    key={key}
                    item={item}
                    isOpen={openItems.has(key)}
                    onToggle={() => toggleItem(key)}
                    isSearchMatch={!!query && matchesSearch(item)}
                  />
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Footer note */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
        <p className="text-sm text-white/40">
          Still have questions?{" "}
          <a
            href="/dashboard/support"
            className="text-[#55E039] hover:text-[#55E039]/80 font-medium transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}
