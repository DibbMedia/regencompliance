import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Globe,
  Mail,
  MessageSquare,
  Music,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { MARKETING_URL } from "@/lib/site-url"
import { JsonLd, buildBreadcrumbSchema } from "@/lib/schema"
import { COMPLIANCE_BIBLE } from "@/lib/compliance-bible"

const canonical = `${MARKETING_URL}/coverage`

export const metadata: Metadata = {
  title: "Compliance Coverage - What the Scanner Checks Against | RegenCompliance",
  description:
    "Full list of the regenerative-medicine and aesthetic modalities our scanner checks against, the marketing channels we cover, and the regulations we cite.",
  alternates: { canonical },
  openGraph: {
    title: "Compliance Coverage - What the Scanner Checks Against",
    description:
      "Full list of modalities, channels, and regulations covered by RegenCompliance.",
    url: canonical,
    type: "website",
  },
}

// Friendly display metadata for each modality key in COMPLIANCE_BIBLE.modalityRules.
// Keys must match the bible's modalityRules keys exactly. The regression test
// at tests/lib/compliance-bible.test.ts asserts parity so a future bible
// expansion cannot silently render raw underscored keys on this page.
export const MODALITY_DISPLAY: Record<string, { name: string; description: string }> = {
  stem_cell: {
    name: "Stem cell therapy",
    description: "Cord blood, MSC, and adult stem cell offerings for orthopedic, cosmetic, and wellness use.",
  },
  exosomes: {
    name: "Exosomes",
    description: "Exosome injections marketed for orthopedic, aesthetic, and wellness applications.",
  },
  prp: {
    name: "PRP / PRF (autologous)",
    description: "Platelet-rich plasma and fibrin for joints, hair restoration, aesthetics, and dental use.",
  },
  peptides: {
    name: "Peptide therapy",
    description: "Compounded peptides used in regenerative, recovery, and longevity protocols.",
  },
  iv_therapy: {
    name: "IV therapy",
    description: "Vitamin, mineral, and amino acid IV drips marketed for wellness, recovery, or immunity.",
  },
  bhrt: {
    name: "BHRT",
    description: "Bioidentical hormone replacement for perimenopause, andropause, and longevity programs.",
  },
  svf_adipose: {
    name: "SVF / adipose stem cells",
    description: "Stromal vascular fraction and adipose-derived cell therapies.",
  },
  hbot: {
    name: "Hyperbaric oxygen (HBOT)",
    description: "Hyperbaric chambers marketed for wound care, recovery, neurological, or anti-aging use.",
  },
  glp_1_compounded: {
    name: "Compounded GLP-1",
    description: "Compounded semaglutide and tirzepatide programs run by 503A/503B pharmacies for medically supervised weight loss.",
  },
  ketamine: {
    name: "Ketamine therapy",
    description: "IV, IM, intranasal, and Spravato ketamine programs for mood and pain.",
  },
  nad_iv: {
    name: "NAD+ IV therapy",
    description: "NAD+ IVs and injectables marketed for wellness, longevity, and recovery.",
  },
  ozone_therapy: {
    name: "Ozone therapy",
    description: "Major autohemotherapy, insufflation, and prolozone offerings.",
  },
  bpc_157: {
    name: "BPC-157 peptide",
    description: "BPC-157 marketed for tendon, gut, and recovery support.",
  },
  trt_men: {
    name: "TRT / men's hormone optimization",
    description: "Testosterone replacement and men's hormone programs.",
  },
  sermorelin: {
    name: "Sermorelin",
    description: "Growth hormone-releasing hormone analogue compounded for anti-aging and recovery protocols.",
  },
  ipamorelin: {
    name: "Ipamorelin",
    description: "Selective GHRP marketed for sleep, recovery, and body composition.",
  },
  cjc_1295: {
    name: "CJC-1295",
    description: "Long-acting GHRH analogue often paired with ipamorelin for growth hormone stacks.",
  },
  tesamorelin: {
    name: "Tesamorelin (Egrifta)",
    description: "FDA-approved for HIV-associated lipodystrophy; widely marketed off-label for weight loss.",
  },
  tb_500: {
    name: "TB-500 / thymosin beta-4",
    description: "Peptide marketed for soft-tissue and tendon recovery.",
  },
  ghk_cu: {
    name: "GHK-Cu copper peptide",
    description: "Copper-binding tripeptide promoted for skin repair, hair regrowth, and wound healing.",
  },
  pt_141: {
    name: "PT-141 (bremelanotide)",
    description: "Melanocortin receptor agonist marketed for sexual function.",
  },
  tirzepatide: {
    name: "Tirzepatide (Mounjaro / Zepbound)",
    description: "Dual GIP/GLP-1 receptor agonist for type 2 diabetes and chronic weight management.",
  },
  retatrutide: {
    name: "Retatrutide (investigational)",
    description: "Investigational triple agonist; not FDA approved and widely flagged in compounder warning letters.",
  },
  hcg_weight_loss: {
    name: "HCG weight loss",
    description: "Human chorionic gonadotropin marketed for weight loss despite FDA's unapproved-use determination.",
  },
  whartons_jelly: {
    name: "Wharton's jelly",
    description: "Umbilical-cord-derived product marketed for orthopedic and regenerative use; FDA enforcement target.",
  },
  bmac: {
    name: "Bone marrow aspirate concentrate (BMAC)",
    description: "Autologous bone marrow concentrate for orthopedic and wound applications.",
  },
  shockwave_ed: {
    name: "Shockwave ED therapy",
    description: "Low-intensity extracorporeal shockwave devices marketed for erectile dysfunction.",
  },
  botulinum_toxin: {
    name: "Botulinum toxin (Botox / Dysport / Xeomin / Jeuveau)",
    description: "Neuromodulator injections for aesthetic and therapeutic use.",
  },
  hyaluronic_acid_filler: {
    name: "HA dermal fillers",
    description: "Hyaluronic acid filler injections for facial volumization and contouring.",
  },
  prp_birth_tissue: {
    name: "Birth-tissue 'PRP' (cord blood / placenta)",
    description: "Non-autologous birth-tissue products marketed as 'PRP'; flagged by FDA as misbranded HCT/Ps.",
  },
}

const CHANNEL_DISPLAY: Record<
  string,
  { name: string; icon: typeof Globe; description: string }
> = {
  website: {
    name: "Website copy",
    icon: Globe,
    description: "Home pages, service pages, landing pages, and blog posts.",
  },
  google_ads: {
    name: "Google Ads",
    icon: Search,
    description: "Search, display, and YouTube ad creative subject to Google healthcare policy.",
  },
  meta_instagram: {
    name: "Meta and Instagram",
    icon: Sparkles,
    description: "Facebook and Instagram organic posts, reels, and paid creative.",
  },
  tiktok: {
    name: "TikTok",
    icon: Music,
    description: "TikTok organic and paid creative under platform health certification.",
  },
  email: {
    name: "Email",
    icon: Mail,
    description: "Patient newsletters, drip campaigns, and one-off blasts under CAN-SPAM.",
  },
  sms: {
    name: "SMS",
    icon: MessageSquare,
    description: "Patient text messaging under TCPA.",
  },
}

const CITATIONS: { authority: string; description: string }[] = [
  {
    authority: "21 CFR Part 1271",
    description: "FDA's framework for human cells, tissues, and cellular and tissue-based products (HCT/Ps).",
  },
  {
    authority: "21 USC 321 (FDCA)",
    description: "Federal Food, Drug, and Cosmetic Act - definition of drug, device, and disease claims.",
  },
  {
    authority: "FTC Act Section 5",
    description: "Prohibits unfair or deceptive acts or practices, including unsubstantiated health claims.",
  },
  {
    authority: "16 CFR Part 255",
    description: "FTC Endorsement Guides for testimonials, influencers, and patient reviews.",
  },
  {
    authority: "DSHEA",
    description: "Dietary Supplement Health and Education Act - structure/function claims and required disclaimers.",
  },
  {
    authority: "FDA 503A bulks list",
    description: "Governs which substances may be compounded by pharmacies (relevant to peptides, BPC-157, compounded GLP-1s).",
  },
  {
    authority: "HIPAA Privacy Rule",
    description: "Restricts use of patient information in marketing, including testimonials and before/after photos.",
  },
  {
    authority: "TCPA",
    description: "Telephone Consumer Protection Act - written consent requirements for marketing SMS and calls.",
  },
  {
    authority: "CAN-SPAM",
    description: "Sender identification, unsubscribe, and physical-address requirements for commercial email.",
  },
  {
    authority: "State medical board rulings",
    description: "State-specific informed consent and scope-of-practice notices (FL, UT, NV stem cell statutes, etc.).",
  },
]

export default function CoveragePage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Coverage", url: canonical },
  ])
  const webPageSchema = {
    "@context": "https://schema.org" as const,
    "@type": "WebPage" as const,
    name: "RegenCompliance Coverage",
    description:
      "Modalities, channels, and regulations covered by the RegenCompliance scanner.",
    url: canonical,
  }

  const modalityKeys = Object.keys(COMPLIANCE_BIBLE.modalityRules)
  const channelKeys = Object.keys(COMPLIANCE_BIBLE.channelRules)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <JsonLd schema={[webPageSchema, breadcrumbSchema]} />
      <MarketingBg />
      <MarketingHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-12">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-4">COMPLIANCE COVERAGE</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.1]">
              What the scanner
              <br />
              <span className="bg-gradient-to-r from-[#55E039] to-[#89E3E4] bg-clip-text text-transparent">checks against.</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl">
              Every modality, channel, and regulation in our active rule set. The scanner reads your marketing copy and matches it against the same compliance bible our team maintains for FDA warning letters and FTC enforcement actions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/apply"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#55E039] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#6FF055] transition-colors"
              >
                Apply for Beta
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/[0.05] transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MODALITIES */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">MODALITIES</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{modalityKeys.length}+ regenerative and wellness modalities</h2>
              <p className="mt-3 text-white/65 max-w-2xl">
                Each modality has its own regulatory status, the things you can say, and the things that trigger a HIGH-severity flag.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/70">
              <ShieldCheck className="h-4 w-4 text-[#55E039]" />
              Pulled live from compliance-bible.ts
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modalityKeys.map((key) => {
              const rule = COMPLIANCE_BIBLE.modalityRules[key]
              const display = MODALITY_DISPLAY[key] ?? {
                name: key,
                description: "Covered by the scanner rule set.",
              }
              return (
                <div
                  key={key}
                  className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <h3 className="text-base font-extrabold text-white mb-2">{display.name}</h3>
                  <p className="text-sm text-white/65 mb-3 leading-relaxed">{display.description}</p>
                  <p className="text-xs text-white/55 leading-relaxed border-t border-white/10 pt-3">
                    <span className="font-semibold text-[#55E039]">Status:</span> {rule.regulatoryStatus}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CHANNELS */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">CHANNELS</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{channelKeys.length} marketing surfaces</h2>
            <p className="mt-3 text-white/65 max-w-2xl">
              Each surface has its own platform and statutory rules. Scans flag channel-specific issues alongside content-level violations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {channelKeys.map((key) => {
              const rule = COMPLIANCE_BIBLE.channelRules[key]
              const display =
                CHANNEL_DISPLAY[key] ?? {
                  name: key,
                  icon: Globe,
                  description: "Covered channel.",
                }
              const Icon = display.icon
              return (
                <div
                  key={key}
                  className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-xl bg-[#55E039]/10 border border-[#55E039]/15 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#55E039]" />
                    </div>
                    <h3 className="text-base font-extrabold text-white">{display.name}</h3>
                  </div>
                  <p className="text-sm text-white/65 mb-3 leading-relaxed">{display.description}</p>
                  <ul className="space-y-1.5 text-xs text-white/55 leading-relaxed border-t border-white/10 pt-3">
                    {rule.restrictions.slice(0, 3).map((r) => (
                      <li key={r} className="flex gap-2">
                        <span className="text-[#55E039] mt-0.5">-</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CITATIONS */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <p className="text-xs font-bold text-[#55E039] uppercase tracking-[0.2em] mb-2">REGULATIONS CITED</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">The statutes and rules behind each flag</h2>
            <p className="mt-3 text-white/65 max-w-2xl">
              Every flag the scanner produces traces back to a specific statute, FDA guidance, FTC rule, or state board ruling.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {CITATIONS.map((c) => (
              <div
                key={c.authority}
                className="rounded-xl bg-white/[0.03] border border-white/10 p-4"
              >
                <p className="text-sm font-extrabold text-white">{c.authority}</p>
                <p className="mt-1 text-xs text-white/60 leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Run your marketing against the full bible.
          </h2>
          <p className="mt-4 text-white/65 max-w-2xl mx-auto">
            Founders get a $297/mo seat locked for life. Scan unlimited content against every modality and channel above.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/apply"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#55E039] px-6 py-3 text-sm font-semibold text-black hover:bg-[#6FF055] transition-colors"
            >
              Apply for Beta
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/free-audit"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/[0.05] transition-colors"
            >
              Try a free audit
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
