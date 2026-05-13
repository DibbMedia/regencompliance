/**
 * Shape tests for the site-wide JSON-LD schema builders.
 *
 * These verify the contract that Google Rich Results / schema.org validator
 * relies on: @context is set, @type is right, required fields are present,
 * breadcrumb positions are 1-indexed and contiguous, and the
 * SoftwareApplication carries NO aggregateRating (anti-fabrication policy).
 */
import { describe, it, expect } from "vitest"
import { MARKETING_URL } from "@/lib/site-url"
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildSoftwareApplicationSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildArticleSchema,
  buildItemListSchema,
} from "@/lib/schema"

describe("buildOrganizationSchema", () => {
  it("emits required Organization fields with no fabricated extras", () => {
    const org = buildOrganizationSchema()
    expect(org["@context"]).toBe("https://schema.org")
    expect(org["@type"]).toBe("Organization")
    expect(org.name).toBe("RegenCompliance")
    expect(org.legalName).toBe("Regen Portal LLC")
    expect(org.url).toBe(MARKETING_URL)
    expect(org.logo).toBe(`${MARKETING_URL}/icon.png`)
    expect(org.contactPoint.email).toMatch(/@regencompliance\.ai$/)
  })

  it("does not include fabricated fields (sameAs, founder, telephone, address)", () => {
    const org = buildOrganizationSchema() as Record<string, unknown>
    expect(org.sameAs).toBeUndefined()
    expect(org.founder).toBeUndefined()
    expect(org.telephone).toBeUndefined()
    expect(org.address).toBeUndefined()
    expect(org.foundingDate).toBeUndefined()
  })
})

describe("buildWebSiteSchema", () => {
  it("emits WebSite without potentialAction (no site search endpoint exists)", () => {
    const site = buildWebSiteSchema() as Record<string, unknown>
    expect(site["@type"]).toBe("WebSite")
    expect(site.url).toBe(MARKETING_URL)
    expect(site.potentialAction).toBeUndefined()
  })
})

describe("buildSoftwareApplicationSchema", () => {
  it("never emits aggregateRating or review (no real review corpus)", () => {
    const app = buildSoftwareApplicationSchema() as Record<string, unknown>
    expect(app.aggregateRating).toBeUndefined()
    expect(app.review).toBeUndefined()
  })

  it("emits both founder and standard Offer tiers with real prices", () => {
    const app = buildSoftwareApplicationSchema()
    expect(app.offers).toHaveLength(2)
    expect(app.offers[0].price).toBe("297")
    expect(app.offers[1].price).toBe("497")
    expect(app.offers[1].availability).toBe("https://schema.org/PreOrder")
  })

  it("honors per-tool overrides", () => {
    const app = buildSoftwareApplicationSchema({
      url: `${MARKETING_URL}/tools/scanner`,
      name: "RegenCompliance Scanner",
    })
    expect(app.url).toBe(`${MARKETING_URL}/tools/scanner`)
    expect(app.name).toBe("RegenCompliance Scanner")
  })
})

describe("buildBreadcrumbSchema", () => {
  it("prepends Home automatically and 1-indexes positions", () => {
    const bc = buildBreadcrumbSchema([
      { name: "Blog", url: `${MARKETING_URL}/blog` },
      { name: "Post", url: `${MARKETING_URL}/blog/post` },
    ])
    expect(bc["@type"]).toBe("BreadcrumbList")
    expect(bc.itemListElement).toHaveLength(3)
    expect(bc.itemListElement[0].position).toBe(1)
    expect(bc.itemListElement[0].name).toBe("Home")
    expect(bc.itemListElement[0].item).toBe(MARKETING_URL)
    expect(bc.itemListElement[1].position).toBe(2)
    expect(bc.itemListElement[2].position).toBe(3)
  })

  it("emits contiguous positions starting at 1", () => {
    const bc = buildBreadcrumbSchema([
      { name: "A", url: `${MARKETING_URL}/a` },
      { name: "B", url: `${MARKETING_URL}/b` },
      { name: "C", url: `${MARKETING_URL}/c` },
    ])
    const positions = bc.itemListElement.map((i) => i.position)
    expect(positions).toEqual([1, 2, 3, 4])
  })

  it("omits Home when includeHome is false", () => {
    const bc = buildBreadcrumbSchema([{ name: "About", url: `${MARKETING_URL}/about` }], { includeHome: false })
    expect(bc.itemListElement).toHaveLength(1)
    expect(bc.itemListElement[0].name).toBe("About")
    expect(bc.itemListElement[0].position).toBe(1)
  })
})

describe("buildFaqSchema", () => {
  it("emits FAQPage with Question + Answer nodes", () => {
    const faq = buildFaqSchema([
      { q: "Is this legal advice?", a: "No - educational tool only." },
      { q: "Patient data?", a: "Never. Marketing text only." },
    ])
    expect(faq["@type"]).toBe("FAQPage")
    expect(faq.mainEntity).toHaveLength(2)
    expect(faq.mainEntity[0]["@type"]).toBe("Question")
    expect(faq.mainEntity[0].name).toBe("Is this legal advice?")
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe("No - educational tool only.")
  })
})

describe("buildArticleSchema", () => {
  it("maps RegenCompliance Editorial author to an Organization", () => {
    const article = buildArticleSchema({
      title: "Test Post",
      description: "Test description.",
      slug: "test-post",
      datePublished: "2026-01-01",
      authorName: "RegenCompliance Editorial",
    })
    expect(article["@type"]).toBe("BlogPosting")
    expect(article.headline).toBe("Test Post")
    expect(article.author).toMatchObject({
      "@type": "Organization",
      name: "RegenCompliance Editorial",
    })
    expect(article.image[0]).toMatch(/opengraph-image$/)
    expect(article.url).toBe(`${MARKETING_URL}/blog/test-post`)
  })

  it("defaults dateModified to datePublished when not provided", () => {
    const article = buildArticleSchema({
      title: "T",
      description: "d",
      slug: "s",
      datePublished: "2026-02-02",
      authorName: "RegenCompliance Editorial",
    })
    expect(article.dateModified).toBe("2026-02-02")
  })

  it("uses Person author when name is not RegenCompliance Editorial", () => {
    const article = buildArticleSchema({
      title: "T",
      description: "d",
      slug: "s",
      datePublished: "2026-02-02",
      authorName: "Jane Doe",
    })
    expect(article.author).toMatchObject({
      "@type": "Person",
      name: "Jane Doe",
    })
  })

  it("emits keywords as a comma-joined string when supplied", () => {
    const article = buildArticleSchema({
      title: "T",
      description: "d",
      slug: "s",
      datePublished: "2026-02-02",
      authorName: "RegenCompliance Editorial",
      keywords: ["a", "b", "c"],
    })
    expect(article.keywords).toBe("a, b, c")
  })
})

describe("buildItemListSchema", () => {
  it("emits 1-indexed ListItem entries", () => {
    const list = buildItemListSchema([
      { name: "A", url: `${MARKETING_URL}/a` },
      { name: "B", url: `${MARKETING_URL}/b` },
    ])
    expect(list["@type"]).toBe("ItemList")
    expect(list.itemListElement[0].position).toBe(1)
    expect(list.itemListElement[1].position).toBe(2)
    expect(list.itemListElement[0].url).toBe(`${MARKETING_URL}/a`)
  })
})

describe("global rules across all schema builders", () => {
  it("never includes aggregateRating anywhere", () => {
    const all = [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildSoftwareApplicationSchema(),
      buildBreadcrumbSchema([{ name: "X", url: `${MARKETING_URL}/x` }]),
      buildFaqSchema([{ q: "Q", a: "A" }]),
      buildArticleSchema({
        title: "T",
        description: "D",
        slug: "s",
        datePublished: "2026-01-01",
        authorName: "RegenCompliance Editorial",
      }),
      buildItemListSchema([{ name: "X", url: `${MARKETING_URL}/x` }]),
    ]
    for (const schema of all) {
      const json = JSON.stringify(schema)
      expect(json).not.toContain("aggregateRating")
      expect(json).not.toContain('"review"')
    }
  })

  it("uses absolute URLs (no relative paths)", () => {
    const all: Array<Record<string, unknown>> = [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      buildSoftwareApplicationSchema(),
    ]
    for (const schema of all) {
      const json = JSON.stringify(schema)
      // No bare `"url":"/`-style relative URLs.
      expect(json).not.toMatch(/"url":"\/[^/]/)
    }
  })
})
