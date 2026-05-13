import type { Metadata } from "next"
import SecurityClient from "./security-client"
import { MARKETING_URL } from "@/lib/site-url"
import { JsonLd, buildBreadcrumbSchema } from "@/lib/schema"

const canonical = `${MARKETING_URL}/security`

export const metadata: Metadata = {
  title: "Security &amp; Data Handling - RegenCompliance",
  description:
    "How RegenCompliance handles your data - zero patient data, no AI training on customer content, encryption, access controls, audit trails, and the full infrastructure stack.",
  keywords: [
    "RegenCompliance security",
    "healthcare compliance software security",
    "HIPAA healthcare compliance tool",
    "AI no training customer data",
    "compliance software data handling",
  ],
  alternates: { canonical },
  openGraph: {
    title: "Security &amp; Data Handling - RegenCompliance",
    description:
      "Six commitments, full policy detail, infrastructure stack, and a FAQ. Healthcare practices ask about data handling first; here are the answers.",
    url: canonical,
    type: "website",
  },
}

const webPageSchema = {
  "@context": "https://schema.org" as const,
  "@type": "WebPage" as const,
  name: "Security & Data Handling - RegenCompliance",
  description:
    "How RegenCompliance handles your data - zero patient data, no AI training on customer content, encryption, access controls, audit trails, and the full infrastructure stack.",
  url: canonical,
}
const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Security", url: canonical },
])

export default function SecurityPage() {
  return (
    <>
      <JsonLd schema={[webPageSchema, breadcrumbSchema]} />
      <SecurityClient />
    </>
  )
}
