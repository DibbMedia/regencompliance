/**
 * SoftwareApplication schema for the RegenCompliance platform.
 *
 * IMPORTANT - NO aggregateRating / NO review:
 * The product is in founder-beta with no public review corpus. Google's
 * structured-data guidelines specifically prohibit fabricated reviews and
 * ratings, and ship-time policy is to omit any field we cannot verify. When
 * real reviews ship (e.g. G2, Capterra, or first-party reviews with a public
 * source URL), add aggregateRating + review here - never before.
 *
 * Offers reflect the actual published prices on /pricing:
 *   - $297/mo founder beta (locked-for-life), Subscription
 *   - $497/mo standard, marked PreOrder until the beta ends
 *
 * applicationCategory uses Google's recommended values; operatingSystem is
 * "Any (web-based)" to match Google's docs example for SaaS web apps.
 */
import { MARKETING_URL } from "@/lib/site-url"

export interface Offer {
  "@type": "Offer"
  name: string
  price: string
  priceCurrency: "USD"
  description: string
  availability?: string
  url?: string
}

export interface SoftwareApplicationSchema extends Record<string, unknown> {
  "@context": "https://schema.org"
  "@type": "SoftwareApplication"
  name: string
  description: string
  applicationCategory: string
  applicationSubCategory: string
  operatingSystem: string
  url: string
  offers: Offer[]
  publisher: {
    "@type": "Organization"
    name: string
    url: string
  }
}

const SOFTWARE_DESCRIPTION =
  "FDA/FTC compliance scanning software purpose-built for healthcare practices. Scanner, AI compliant rewriter, audit trail with PDF export, 300+ rule library, and real-time enforcement alerts."

export function buildSoftwareApplicationSchema(options?: {
  /** Optional URL override (e.g. tool-specific page). Defaults to MARKETING_URL. */
  url?: string
  /** Optional name override for per-tool flavor. Defaults to "RegenCompliance". */
  name?: string
  /** Optional description override. Defaults to the platform description. */
  description?: string
}): SoftwareApplicationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: options?.name ?? "RegenCompliance",
    description: options?.description ?? SOFTWARE_DESCRIPTION,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "ComplianceManagement",
    operatingSystem: "Any (web-based)",
    url: options?.url ?? MARKETING_URL,
    offers: [
      {
        "@type": "Offer",
        name: "Founding member",
        price: "297",
        priceCurrency: "USD",
        description:
          "Founder beta - $297/mo locked for life. Capped at 25 seats.",
        url: `${MARKETING_URL}/apply`,
      },
      {
        "@type": "Offer",
        name: "Standard",
        price: "497",
        priceCurrency: "USD",
        description: "Standard pricing after the founder beta closes.",
        availability: "https://schema.org/PreOrder",
        url: `${MARKETING_URL}/pricing`,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "RegenCompliance",
      url: MARKETING_URL,
    },
  }
}
