import * as cheerio from "cheerio"
import { fetchPage, safeFetchHtml } from "@/lib/compliance-scraper"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiscoveredPage {
  url: string
  title: string
}

export interface PageContent {
  url: string
  title: string
  text: string
  metaDescription?: string
}

// ---------------------------------------------------------------------------
// Skip patterns - non-content paths to ignore during crawl
// ---------------------------------------------------------------------------

const SKIP_PATHS = [
  "/wp-admin",
  "/wp-json",
  "/wp-login",
  "/wp-content/uploads",
  "/api",
  "/cdn-cgi",
  "/cart",
  "/checkout",
  "/my-account",
  "/feed",
  "/xmlrpc",
  "/wp-includes",
  "/.well-known",
  "/tag/",
  "/author/",
]

const SKIP_EXTENSIONS = [
  ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp",
  ".mp4", ".mp3", ".wav", ".avi", ".mov",
  ".zip", ".gz", ".tar", ".rar",
  ".css", ".js", ".xml", ".json",
  ".woff", ".woff2", ".ttf", ".eot",
]

// ---------------------------------------------------------------------------
// discoverPages - sitemap-first discovery with BFS fallback
// ---------------------------------------------------------------------------

const SITEMAP_FETCH_TIMEOUT_MS = 15_000
const MAX_CHILD_SITEMAPS = 5

export async function discoverPages(
  domain: string,
  maxPages: number = 50,
): Promise<DiscoveredPage[]> {
  const limit = Math.min(maxPages, 100)
  const normalizedDomain = domain.replace(/^(https?:\/\/)/, "").replace(/\/$/, "")
  const startUrl = `https://${normalizedDomain}`

  // 1. Try sitemap.xml first.
  const sitemapPages = await discoverFromSitemap(normalizedDomain, limit)
  if (sitemapPages.length > 0) {
    return sitemapPages
  }

  // 2. Fall back to BFS crawl.
  console.info("[discoverPages] sitemap not usable, falling back to BFS for " + normalizedDomain)

  const visited = new Set<string>()
  const queue: string[] = [startUrl]
  const pages: DiscoveredPage[] = []

  while (queue.length > 0 && pages.length < limit) {
    const url = queue.shift()!
    const normalized = normalizeUrl(url)

    if (visited.has(normalized)) continue
    visited.add(normalized)

    // Skip non-content paths
    if (shouldSkipUrl(normalized)) continue

    const $ = await fetchPage(url)
    if (!$) continue

    const title = $("title").first().text().trim() || normalized
    pages.push({ url: normalized, title })

    // Extract internal links for BFS
    $("a[href]").each((_i, el) => {
      if (pages.length + queue.length >= limit * 2) return false // stop collecting early

      const href = $(el).attr("href")
      if (!href) return

      const resolved = resolveLink(href, startUrl, normalizedDomain)
      if (!resolved) return

      const normalizedResolved = normalizeUrl(resolved)
      if (!visited.has(normalizedResolved) && !shouldSkipUrl(normalizedResolved)) {
        queue.push(normalizedResolved)
      }
    })
  }

  return pages
}

// ---------------------------------------------------------------------------
// discoverFromSitemap - fetch sitemap.xml (handles sitemap-index), filter, dedup
// ---------------------------------------------------------------------------

async function discoverFromSitemap(
  normalizedDomain: string,
  limit: number,
): Promise<DiscoveredPage[]> {
  const sitemapUrl = `https://${normalizedDomain}/sitemap.xml`

  try {
    const xml = await safeFetchHtml(sitemapUrl, SITEMAP_FETCH_TIMEOUT_MS)
    if (!xml) return []

    const $ = cheerio.load(xml, { xmlMode: true })

    // Collect candidate URLs. If this is a sitemap index, fetch up to
    // MAX_CHILD_SITEMAPS child sitemaps and merge their <loc> entries.
    const locUrls: string[] = []
    const rootName = ($.root().children().first()[0] as { name?: string } | undefined)?.name?.toLowerCase()

    if (rootName === "sitemapindex") {
      const childUrls: string[] = []
      $("sitemap > loc").each((_i, el) => {
        const u = $(el).text().trim()
        if (u) childUrls.push(u)
      })

      for (const childUrl of childUrls.slice(0, MAX_CHILD_SITEMAPS)) {
        try {
          const childXml = await safeFetchHtml(childUrl, SITEMAP_FETCH_TIMEOUT_MS)
          if (!childXml) continue
          const $child = cheerio.load(childXml, { xmlMode: true })
          $child("url > loc").each((_i, el) => {
            const u = $child(el).text().trim()
            if (u) locUrls.push(u)
          })
        } catch {
          // Ignore child-sitemap failures; we'll fall back if the total
          // usable count ends up at zero.
          continue
        }
      }
    } else {
      $("url > loc").each((_i, el) => {
        const u = $(el).text().trim()
        if (u) locUrls.push(u)
      })
    }

    // Filter to same-origin, drop skip patterns, dedup via normalizeUrl.
    const seen = new Set<string>()
    const pages: DiscoveredPage[] = []
    for (const raw of locUrls) {
      if (pages.length >= limit) break

      let href: URL
      try {
        href = new URL(raw)
      } catch {
        continue
      }

      const hrefHost = href.hostname.replace(/^www\./, "")
      const domainHost = normalizedDomain.replace(/^www\./, "")
      if (hrefHost !== domainHost) continue

      if (!href.protocol.startsWith("http")) continue

      const normalized = normalizeUrl(href.toString())
      if (seen.has(normalized)) continue
      if (shouldSkipUrl(normalized)) continue

      seen.add(normalized)
      pages.push({ url: normalized, title: normalized })
    }

    if (pages.length === 0) return []

    console.info("[discoverPages] sitemap used:", sitemapUrl, "urls=" + pages.length)
    return pages
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// extractPageContent - fetch and extract visible text from a URL
// ---------------------------------------------------------------------------

export async function extractPageContent(url: string): Promise<PageContent | null> {
  try {
    const $ = await fetchPage(url)
    if (!$) {
      console.error("[extractPageContent] fetchPage returned null:", url)
      return null
    }

    const title = $("title").first().text().trim() || url
    const metaDescription = $('meta[name="description"]').attr("content")?.trim()

    // Remove non-content elements
    $("script, style, noscript, iframe, svg, nav, header, footer").remove()
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove()
    $(".nav, .navbar, .header, .footer, .sidebar, .menu, .cookie-banner").remove()

    // Get visible text
    let text = $("body").text()

    // Clean whitespace: collapse runs of whitespace to single space
    text = text.replace(/\s+/g, " ").trim()

    // Limit to 10000 chars
    if (text.length > 10000) {
      text = text.slice(0, 10000)
    }

    if (text.length < 50) {
      console.error("[extractPageContent] insufficient body text:", url, "chars=", text.length)
      return null // not enough content
    }

    return { url, title, text, metaDescription }
  } catch (err) {
    console.error("[extractPageContent] threw:", url, err instanceof Error ? err.message : String(err))
    return null
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    // Remove trailing slash, hash, common tracking params
    u.hash = ""
    u.searchParams.delete("utm_source")
    u.searchParams.delete("utm_medium")
    u.searchParams.delete("utm_campaign")
    u.searchParams.delete("utm_content")
    u.searchParams.delete("utm_term")
    u.searchParams.delete("fbclid")
    u.searchParams.delete("gclid")
    const path = u.pathname.replace(/\/+$/, "") || "/"
    return `${u.origin}${path}${u.search}`
  } catch {
    return url
  }
}

function shouldSkipUrl(url: string): boolean {
  try {
    const u = new URL(url)
    const path = u.pathname.toLowerCase()

    // Skip known non-content paths
    for (const skip of SKIP_PATHS) {
      if (path.startsWith(skip)) return true
    }

    // Skip file extensions
    for (const ext of SKIP_EXTENSIONS) {
      if (path.endsWith(ext)) return true
    }

    // Skip anchors-only, mailto, tel
    if (url.startsWith("mailto:") || url.startsWith("tel:")) return true

    return false
  } catch {
    return true
  }
}

function resolveLink(href: string, baseUrl: string, domain: string): string | null {
  // Skip non-http links
  if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
    return null
  }

  // Skip anchors
  if (href.startsWith("#")) return null

  try {
    const resolved = new URL(href, baseUrl)

    // Only follow same-domain links
    const resolvedHost = resolved.hostname.replace(/^www\./, "")
    const domainHost = domain.replace(/^www\./, "")
    if (resolvedHost !== domainHost) return null

    // Only http/https
    if (!resolved.protocol.startsWith("http")) return null

    return resolved.toString()
  } catch {
    return null
  }
}
