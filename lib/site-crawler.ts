import * as cheerio from "cheerio"
import { fetchPage } from "@/lib/compliance-scraper"

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
// Skip patterns — non-content paths to ignore during crawl
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
// discoverPages — BFS crawl to find all internal URLs
// ---------------------------------------------------------------------------

export async function discoverPages(
  domain: string,
  maxPages: number = 50,
): Promise<DiscoveredPage[]> {
  const limit = Math.min(maxPages, 100)
  const normalizedDomain = domain.replace(/^(https?:\/\/)/, "").replace(/\/$/, "")
  const startUrl = `https://${normalizedDomain}`

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
// extractPageContent — fetch and extract visible text from a URL
// ---------------------------------------------------------------------------

export async function extractPageContent(url: string): Promise<PageContent | null> {
  try {
    const $ = await fetchPage(url)
    if (!$) return null

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

    if (text.length < 50) return null // not enough content

    return { url, title, text, metaDescription }
  } catch {
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
    let path = u.pathname.replace(/\/+$/, "") || "/"
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
