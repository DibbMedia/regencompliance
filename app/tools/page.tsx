import type { Metadata } from "next"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { TOOLS } from "@/lib/tools/registry"
import { SITE_URL } from "@/lib/site-url"
import { ToolsHubClient } from "./tools-hub-client"
import { HUB_FAQS } from "./hub-faqs"

const canonical = `${SITE_URL}/tools`

export const metadata: Metadata = {
  title: "RegenCompliance Tools - Scanner, AI Rewriter, Audit Trail, Library, Alerts",
  description:
    "Deep dives on every RegenCompliance tool - the compliance scanner, AI compliant rewriter, audit trail with PDF export, 300+ rule library, and real-time enforcement alerts.",
  keywords: [
    "RegenCompliance tools",
    "healthcare compliance tools",
    "FDA compliance software features",
    "healthcare marketing tools",
  ],
  alternates: { canonical },
  openGraph: {
    title: "RegenCompliance Tools",
    description:
      "Every tool inside RegenCompliance - scanner, rewriter, audit trail, rule library, enforcement alerts.",
    url: canonical,
    type: "website",
  },
}

export default function ToolsIndexPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools",
        item: canonical,
      },
    ],
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/tools/${t.slug}`,
      name: t.name,
    })),
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HUB_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MarketingBg />
      <MarketingHeader />
      <ToolsHubClient />
      <MarketingFooter />
    </div>
  )
}
