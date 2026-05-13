import type { Metadata } from "next"
import { MARKETING_URL } from "@/lib/site-url"
import { JsonLd, buildBreadcrumbSchema } from "@/lib/schema"

const canonical = `${MARKETING_URL}/waitlist`

export const metadata: Metadata = {
  title: "Waitlist - RegenCompliance",
  description:
    "Join the standard-pricing waitlist. We email when the standard tier opens after the founder beta closes.",
  alternates: { canonical },
}

const SCHEMAS = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Waitlist - RegenCompliance",
    description:
      "Join the standard-pricing waitlist. We email when the standard tier opens after the founder beta closes.",
    url: canonical,
  },
  buildBreadcrumbSchema([{ name: "Waitlist", url: canonical }]),
]

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <JsonLd schema={SCHEMAS} />
      {children}
    </>
  )
}
