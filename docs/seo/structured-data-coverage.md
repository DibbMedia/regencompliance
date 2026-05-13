# Structured Data Coverage

This document maps every route on the marketing site to the JSON-LD schemas
it emits, the key fields included, and (where applicable) the fields we
deliberately omit. Helpers live in `lib/schema/`.

## Anti-fabrication policy

Google's structured-data guidelines explicitly prohibit fabricated values
(fake `aggregateRating`, invented social profiles, made-up phone numbers,
synthetic reviews). When a field would require data we cannot trace to
verifiable copy on the site, we OMIT it. The most load-bearing omissions:

- **NO `aggregateRating` anywhere.** RegenCompliance is in founder beta with
  no public review corpus. The `buildSoftwareApplicationSchema` helper
  carries an inline comment to keep future contributors from adding fake
  ratings. When real reviews ship (G2, Capterra, first-party with a public
  source URL), the rating goes there, not on individual product/pricing
  pages.
- **NO `review`** for the same reason.
- **NO `sameAs[]`** on Organization. The site does not link to any
  authoritative social profiles in the footer or contact page. Per Google,
  emitting an empty `sameAs` array is acceptable over inventing URLs.
- **NO `telephone`** on Organization or ContactPage. The published contact
  channel is email only.
- **NO `address`, `founder`, `foundingDate`, `numEmployees`** on
  Organization. None are surfaced in user-visible copy.
- **NO `potentialAction` (SearchAction)** on WebSite. The marketing site
  has no `/search` endpoint.

## Shared helpers

| Helper | Type emitted | Notes |
|---|---|---|
| `buildOrganizationSchema()` | `Organization` | Emitted from `app/layout.tsx` so every page inherits the brand entity. |
| `buildWebSiteSchema()` | `WebSite` | Emitted from `app/layout.tsx`. No SearchAction. |
| `buildSoftwareApplicationSchema(options?)` | `SoftwareApplication` | Two `Offer` entries: $297 founder-beta + $497 PreOrder. No `aggregateRating`. |
| `buildBreadcrumbSchema(items, opts?)` | `BreadcrumbList` | 1-indexed positions; Home auto-prepended. |
| `buildFaqSchema(items)` | `FAQPage` | Each entry maps `{q, a}` to `Question` + `acceptedAnswer`. |
| `buildArticleSchema(input)` | `BlogPosting` | Author defaults to Organization when `name === "RegenCompliance Editorial"`. Image points to the per-post OG image route. |
| `buildItemListSchema(items)` | `ItemList` | 1-indexed positions. |
| `<JsonLd schema={…} nonce?>` | wraps `<script type="application/ld+json">` | Only file in the codebase that should use `dangerouslySetInnerHTML` for structured data. |

## Page coverage

| Route | Schemas | Notes |
|---|---|---|
| `app/layout.tsx` (root) | `Organization`, `WebSite` | Inherited by every page. |
| `app/page.tsx` (home) | `SoftwareApplication`, `FAQPage` | Org/WebSite inherited from layout. |
| `app/about/page.tsx` | `AboutPage`, `BreadcrumbList` | AboutPage references Org by name + legalName (matches page copy). |
| `app/apply/page.tsx` | `WebPage`, `BreadcrumbList` | DONE |
| `app/blog/page.tsx` (hub) | `Blog`, `BreadcrumbList`, `ItemList` (10 latest posts) | DONE |
| `app/blog/page/[page]/page.tsx` | `BreadcrumbList` | Pagination crumb. |
| `app/blog/[slug]/page.tsx` | `BlogPosting`, `BreadcrumbList`, plus any `extraSchemas` per post | Author maps to Org for editorial posts. Image uses the per-post `opengraph-image` route. |
| `app/compare/page.tsx` | `BreadcrumbList`, `ItemList` (competitors), `FAQPage` | DONE |
| `app/vs/[competitor]/page.tsx` | `WebPage`, `BreadcrumbList`, `FAQPage` (when present) | DONE |
| `app/contact/page.tsx` | `ContactPage`, `BreadcrumbList` | No telephone (none published). |
| `app/cookies/page.tsx` | `WebPage`, `BreadcrumbList` | Lightweight placeholder. |
| `app/privacy/page.tsx` | `WebPage`, `BreadcrumbList` | Lightweight placeholder. |
| `app/terms/page.tsx` | `WebPage`, `BreadcrumbList` | Lightweight placeholder. |
| `app/accessibility/page.tsx` | `WebPage`, `BreadcrumbList` | Lightweight placeholder. |
| `app/demo/page.tsx` | `WebPage`, `BreadcrumbList` | Emitted from `app/demo/layout.tsx`. |
| `app/faq/page.tsx` | `FAQPage`, `BreadcrumbList` | All categories flattened. |
| `app/features/page.tsx` | `WebPage`, `BreadcrumbList`, `ItemList` (5 tools) | DONE |
| `app/for/page.tsx` (specialty hub) | `BreadcrumbList`, `ItemList`, `FAQPage` | DONE |
| `app/for/[specialty]/page.tsx` | `Service`, `BreadcrumbList`, `FAQPage` (when meta.faqs present) | Provider is Org; areaServed = United States. |
| `app/free-audit/page.tsx` | `WebPage`, `BreadcrumbList` | DONE |
| `app/glossary/page.tsx` | `DefinedTermSet` (with `DefinedTerm[]`), `BreadcrumbList` | DONE |
| `app/how-it-works/page.tsx` | `HowTo` (6 steps), `BreadcrumbList` | Step list mirrors the headings actually rendered by the client component. |
| `app/pricing/page.tsx` | `SoftwareApplication` (with offers), `FAQPage`, `BreadcrumbList` | Replaces the previous `Product` schema; pricing FAQs intact. |
| `app/security/page.tsx` | `WebPage`, `BreadcrumbList` | DONE |
| `app/state/page.tsx` | `BreadcrumbList`, `ItemList` (states) | DONE |
| `app/state/[state]/page.tsx` | `WebPage` (with `about: Place`), `BreadcrumbList` | DONE |
| `app/tools/page.tsx` | `SoftwareApplication`, `BreadcrumbList`, `ItemList`, `FAQPage` | Platform-level SoftwareApplication added on the hub. |
| `app/tools/[tool]/page.tsx` | `SoftwareApplication` (per-tool name override), `BreadcrumbList`, `FAQPage` (when present) | DONE |
| `app/verify/[id]/page.tsx` | `WebPage`, `BreadcrumbList` | Public badge verification page. |
| `app/waitlist/page.tsx` | `WebPage`, `BreadcrumbList` | Emitted from `app/waitlist/layout.tsx`. |

## Field-level rationale for non-obvious choices

### Article author = Organization for editorial posts
Most blog posts ship `author.name === "RegenCompliance Editorial"`. There is
no individual author bio page on the site to back a `Person.url`, so we map
that name to an `Organization` author rather than a phantom Person.
`buildArticleSchema` does the mapping automatically. Posts that ship a
distinct person name emit `{"@type": "Person", "name": ...}` without a
`url` - acceptable per Google's docs.

### HowTo on /how-it-works
The page renders six numbered steps with clear titles and bodies. That
matches Google's HowTo guidance closely enough to emit. The step text was
mirrored from the existing client component; if those headings change, the
list in `app/how-it-works/page.tsx` must be updated to match.

### SoftwareApplication on /pricing (replaces Product)
The previous schema emitted a `Product` with `offers[]`. We switched to
`SoftwareApplication` because:
- It matches the actual product type (web SaaS).
- It carries the same offers without implying a physical product.
- It keeps everything funnelled through one helper.

### Service on /for/[specialty]
Each specialty page describes a service that we provide to a specific
audience type. Schema.org `Service` with `provider` (Org), `areaServed`
(United States), and `audience` (the specialty long name) captures that.
FAQ block is added when the specialty page has FAQs.

### DefinedTermSet on /glossary
The glossary index is a true `DefinedTermSet` per schema.org. Each entry
has a `@id` pointing at the in-page anchor so search engines can deep-link.
No per-term page exists yet; once individual term pages ship, each can emit
its own `DefinedTerm`.

## Validation checklist

After any change to `lib/schema/*` or to a page's structured data:

1. `npm run build` succeeds.
2. `npm test` includes `tests/lib/schema/schema.test.ts` - all green.
3. `npx tsc --noEmit` zero new errors.
4. `npm run check:plaintext-leaks` clean.
5. Spot-check a few rendered pages with Google's Rich Results Test or the
   schema.org validator. Confirm:
   - All `@context` are `https://schema.org`.
   - Required fields per Google docs are present (Article needs
     `headline`, `image`, `datePublished`; BreadcrumbList needs `position`,
     `name`, `item`).
   - No `aggregateRating` anywhere.
   - All URLs are absolute and use `MARKETING_URL`.
   - Breadcrumb positions are 1-indexed and contiguous.
