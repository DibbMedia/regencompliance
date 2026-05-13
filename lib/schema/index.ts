/**
 * Barrel module for site-wide JSON-LD structured-data helpers.
 *
 * Usage:
 *   import { JsonLd, buildBreadcrumbSchema, buildFaqSchema } from "@/lib/schema"
 *
 * See docs/seo/structured-data-coverage.md for the page-by-page schema map
 * and rationale for deliberately-omitted fields (especially aggregateRating).
 */
export { JsonLd } from "./JsonLd"
export {
  buildOrganizationSchema,
  organizationRef,
  type OrganizationSchema,
} from "./organization"
export { buildWebSiteSchema, type WebSiteSchema } from "./website"
export {
  buildSoftwareApplicationSchema,
  type SoftwareApplicationSchema,
  type Offer,
} from "./software-application"
export {
  buildBreadcrumbSchema,
  type BreadcrumbItem,
  type BreadcrumbListSchema,
} from "./breadcrumb"
export { buildFaqSchema, type FaqItem, type FaqPageSchema } from "./faq"
export {
  buildArticleSchema,
  type ArticleSchema,
  type ArticleSchemaInput,
} from "./article"
export {
  buildItemListSchema,
  type ItemListEntry,
  type ItemListSchema,
} from "./itemlist"
