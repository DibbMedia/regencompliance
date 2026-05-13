/**
 * WebSite schema for the marketing apex. We deliberately omit
 * `potentialAction` (SearchAction) because the marketing site does not expose
 * a site-search endpoint - emitting a SearchAction pointing at a non-existent
 * /search URL would be fabricated structured data.
 */
import { MARKETING_URL } from "@/lib/site-url"

export interface WebSiteSchema extends Record<string, unknown> {
  "@context": "https://schema.org"
  "@type": "WebSite"
  name: string
  url: string
  description: string
  inLanguage: string
  publisher: {
    "@type": "Organization"
    name: string
    url: string
  }
}

export function buildWebSiteSchema(): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RegenCompliance",
    url: MARKETING_URL,
    description: "FDA/FTC compliance scanning for healthcare marketing.",
    inLanguage: "en-US",
    publisher: {
      "@type": "Organization",
      name: "RegenCompliance",
      url: MARKETING_URL,
    },
  }
}
