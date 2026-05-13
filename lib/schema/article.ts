/**
 * BlogPosting / Article builder for blog content.
 *
 * Author handling: blog posts ship `author.name` as either an Organization
 * ("RegenCompliance Editorial") or a Person. We map "RegenCompliance
 * Editorial" -> Organization since there's no individual author bio page to
 * back a Person.url; any other author name is emitted as Person without a
 * url (Google accepts Person.name alone, and we have no real author pages
 * to link to).
 *
 * Image handling: Each blog post has a dynamic OpenGraph image at
 * /blog/<slug>/opengraph-image. We use that as the Article.image so every
 * post has a valid image URL without fabricating asset paths.
 */
import { MARKETING_URL } from "@/lib/site-url"
import { organizationRef } from "./organization"

export interface ArticleSchemaInput {
  title: string
  description: string
  slug: string
  datePublished: string
  dateModified?: string
  authorName: string
  /** Comma-joined keywords for the keywords field (optional). */
  keywords?: string[]
}

export interface ArticleSchema extends Record<string, unknown> {
  "@context": "https://schema.org"
  "@type": "BlogPosting"
  headline: string
  description: string
  image: string[]
  datePublished: string
  dateModified: string
  author: Record<string, unknown>
  publisher: Record<string, unknown>
  mainEntityOfPage: {
    "@type": "WebPage"
    "@id": string
  }
  url: string
  keywords?: string
}

const EDITORIAL_NAME = "RegenCompliance Editorial"

export function buildArticleSchema(input: ArticleSchemaInput): ArticleSchema {
  const canonical = `${MARKETING_URL}/blog/${input.slug}`
  const image = `${canonical}/opengraph-image`

  const author =
    input.authorName === EDITORIAL_NAME
      ? {
          "@type": "Organization",
          name: EDITORIAL_NAME,
          url: MARKETING_URL,
        }
      : {
          "@type": "Person",
          name: input.authorName,
        }

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    image: [image],
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author,
    publisher: organizationRef(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    url: canonical,
    ...(input.keywords && input.keywords.length
      ? { keywords: input.keywords.join(", ") }
      : {}),
  }
}
