/**
 * BreadcrumbList builder. Positions are always 1-indexed and continuous per
 * Google's BreadcrumbList guidelines. The Home crumb is auto-prepended unless
 * the caller passes `includeHome: false`. URLs must be absolute.
 */
import { MARKETING_URL } from "@/lib/site-url"

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface BreadcrumbListSchema extends Record<string, unknown> {
  "@context": "https://schema.org"
  "@type": "BreadcrumbList"
  itemListElement: Array<{
    "@type": "ListItem"
    position: number
    name: string
    item: string
  }>
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
  options: { includeHome?: boolean } = {},
): BreadcrumbListSchema {
  const { includeHome = true } = options
  const fullList: BreadcrumbItem[] = includeHome
    ? [{ name: "Home", url: MARKETING_URL }, ...items]
    : items

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fullList.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
