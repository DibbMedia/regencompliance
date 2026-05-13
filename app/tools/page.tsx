import type { Metadata } from "next"
import { MarketingHeader } from "@/components/marketing-header"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingBg } from "@/components/marketing-bg"
import { TOOLS } from "@/lib/tools/registry"
import { MARKETING_URL } from "@/lib/site-url"
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildItemListSchema,
  buildSoftwareApplicationSchema,
} from "@/lib/schema"
import { ToolsHubClient } from "./tools-hub-client"
import { HUB_FAQS } from "./hub-faqs"

const canonical = `${MARKETING_URL}/tools`

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
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Tools", url: canonical },
  ])
  const itemListSchema = buildItemListSchema(
    TOOLS.map((t) => ({
      name: t.name,
      url: `${MARKETING_URL}/tools/${t.slug}`,
    })),
  )
  const faqSchema = buildFaqSchema(HUB_FAQS)
  const softwareSchema = buildSoftwareApplicationSchema({ url: canonical })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <JsonLd
        schema={[
          softwareSchema,
          breadcrumbSchema,
          itemListSchema,
          faqSchema,
        ]}
      />
      <MarketingBg />
      <MarketingHeader />
      <ToolsHubClient />
      <MarketingFooter />
    </div>
  )
}
