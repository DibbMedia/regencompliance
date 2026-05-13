/**
 * Canonical Organization schema for RegenCompliance.
 *
 * Strict no-fabrication policy: every field below must trace to verifiable
 * copy elsewhere on the site (about page, layout metadata, llms.txt, footer).
 * Do NOT add Person founders, telephone numbers, street addresses, sameAs
 * social profiles, foundingDate, or numEmployees unless those facts are
 * already published in user-facing pages and confirmed by the operator.
 *
 * See docs/seo/structured-data-coverage.md for the rationale on omitted
 * fields (especially the empty sameAs[] - Google prefers omitting the array
 * over including fabricated profile URLs).
 */
import { MARKETING_URL } from "@/lib/site-url"

export interface OrganizationSchema extends Record<string, unknown> {
  "@context": "https://schema.org"
  "@type": "Organization"
  name: string
  legalName: string
  url: string
  logo: string
  description: string
  knowsAbout: readonly string[]
  contactPoint: {
    "@type": "ContactPoint"
    email: string
    contactType: string
    availableLanguage: readonly string[]
  }
}

const DESCRIPTION =
  "FDA/FTC compliance scanning software purpose-built for healthcare practices - regenerative medicine, med spas, weight loss, dental, aesthetic, and IV therapy clinics."

const KNOWS_ABOUT = [
  "FDA warning letters",
  "FTC Endorsement Guides",
  "healthcare marketing compliance",
  "structure-function claims",
  "HCT/P regulation",
  "state medical board advertising rules",
] as const

export function buildOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RegenCompliance",
    legalName: "Regen Portal LLC",
    url: MARKETING_URL,
    logo: `${MARKETING_URL}/icon.png`,
    description: DESCRIPTION,
    knowsAbout: KNOWS_ABOUT,
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@regencompliance.ai",
      contactType: "customer support",
      availableLanguage: ["English"],
    },
  }
}

/**
 * Organization reference for nested use (e.g. Article.publisher, Service.provider).
 * Lighter than the full Organization to keep JSON-LD payloads small.
 */
export function organizationRef() {
  return {
    "@type": "Organization" as const,
    name: "RegenCompliance",
    url: MARKETING_URL,
    logo: {
      "@type": "ImageObject" as const,
      url: `${MARKETING_URL}/icon.png`,
    },
  }
}
