import * as cheerio from "cheerio"
import { anthropic } from "@/lib/anthropic"
import { createServiceClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

// ---------------------------------------------------------------------------
// 1. Source Configuration
// ---------------------------------------------------------------------------

export interface ComplianceSource {
  id: string
  name: string
  type: "fda_warning" | "fda_483" | "ftc_press" | "ftc_guidance" | "doj_fraud"
  listUrl: string
  linkSelector: string
  contentSelector: string
  category: "health_claims" | "fda_approval" | "efficacy" | "safety"
}

export const COMPLIANCE_SOURCES: ComplianceSource[] = [
  {
    id: "fda_warning_letters",
    name: "FDA Warning Letters",
    type: "fda_warning",
    listUrl:
      "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/compliance-actions-and-activities/warning-letters",
    linkSelector: "a[href*='warning-letters/']",
    contentSelector: ".field--name-body, .content-current, main",
    category: "health_claims",
  },
  {
    id: "fda_483_observations",
    name: "FDA 483 Observations",
    type: "fda_483",
    listUrl:
      "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/inspection-observations/inspections-observations",
    linkSelector: "a[href*='inspection']",
    contentSelector: ".field--name-body, main",
    category: "fda_approval",
  },
  {
    id: "ftc_press_releases",
    name: "FTC Press Releases",
    type: "ftc_press",
    listUrl: "https://www.ftc.gov/news-events/news/press-releases",
    linkSelector: "a",
    contentSelector: "article, .field--name-body, main",
    category: "health_claims",
  },
  {
    id: "ftc_health_claims",
    name: "FTC Health Claims",
    type: "ftc_guidance",
    listUrl: "https://www.ftc.gov/news-events/topics/health-claims",
    linkSelector: "a",
    contentSelector: "article, .field--name-body, main",
    category: "health_claims",
  },
  {
    id: "doj_healthcare_fraud",
    name: "DOJ Healthcare Fraud",
    type: "doj_fraud",
    listUrl:
      "https://www.justice.gov/criminal/criminal-fraud/health-care-fraud",
    linkSelector: "a[href*='/pr/']",
    contentSelector: ".field-content, article, main",
    category: "safety",
  },
]

// ---------------------------------------------------------------------------
// 2. Keyword Filtering
// ---------------------------------------------------------------------------

export const REGEN_KEYWORDS = [
  "stem cell",
  "regenerative",
  "exosome",
  "PRP",
  "platelet",
  "biologic",
  "wharton",
  "BMAC",
  "prolotherapy",
  "peptide",
  "growth factor",
  "amniotic",
  "umbilical",
  "mesenchymal",
  "autologous",
  "allogeneic",
  "tissue product",
  "cell therapy",
]

export function isRegenRelated(text: string): boolean {
  const lower = text.toLowerCase()
  return REGEN_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))
}

// ---------------------------------------------------------------------------
// 3. Page Scraping
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 15_000

/**
 * Fetch a URL with timeout and return a cheerio instance, or null on failure.
 */
export async function fetchPage(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<cheerio.CheerioAPI | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    })
    if (!res.ok) return null
    const html = await res.text()
    return cheerio.load(html)
  } catch {
    return null
  }
}

/**
 * Extract links from a listing page that match regen keywords.
 */
export async function extractRegenLinks(
  source: ComplianceSource,
  maxLinks: number = 20,
): Promise<string[]> {
  const $ = await fetchPage(source.listUrl)
  if (!$) return []

  const links: string[] = []
  const seen = new Set<string>()

  $(source.linkSelector).each((_i, el) => {
    if (links.length >= maxLinks) return false

    const href = $(el).attr("href")
    const text = $(el).text()
    if (!href) return

    // Build absolute URL
    let absolute: string
    try {
      absolute = new URL(href, source.listUrl).toString()
    } catch {
      return
    }

    // Skip duplicates
    if (seen.has(absolute)) return
    seen.add(absolute)

    // For sources with generic "a" selectors (FTC), filter by keywords
    if (source.linkSelector === "a") {
      if (!isRegenRelated(text) && !isRegenRelated(href)) return
    }

    links.push(absolute)
  })

  return links
}

/**
 * Extract article body text from a detail page.
 */
export async function extractArticleText(
  url: string,
  contentSelector: string,
  maxChars: number = 15_000,
): Promise<string | null> {
  const $ = await fetchPage(url)
  if (!$) return null

  // Try each selector in order; take the first that yields text
  const selectors = contentSelector.split(",").map((s) => s.trim())

  for (const sel of selectors) {
    const el = $(sel)
    if (el.length > 0) {
      const text = el.text().replace(/\s+/g, " ").trim()
      if (text.length > 100) {
        return text.slice(0, maxChars)
      }
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// 4. Claude-powered Rule Extraction
// ---------------------------------------------------------------------------

export interface ExtractedRule {
  banned_phrase: string
  banned_phrase_variants: string[]
  compliant_alternative: string
  risk_level: "high" | "medium" | "low"
  category: "health_claims" | "fda_approval" | "efficacy" | "safety"
  applies_to: string[]
  title: string
  description: string
}

const EXTRACTION_PROMPT = `You are a compliance analyst specializing in regenerative medicine marketing regulations.

Analyze this enforcement document and extract every specific marketing phrase or claim that was cited as a violation.

For each violation found, output a JSON object with these fields:
- "banned_phrase": the exact or closely paraphrased violating claim
- "banned_phrase_variants": 3-5 natural language ways someone might phrase the same claim
- "compliant_alternative": a rewritten version that would be legally compliant
- "risk_level": "high" if FDA/FTC took direct action, "medium" if warning, "low" if guidance
- "category": one of "health_claims", "fda_approval", "efficacy", "safety"
- "applies_to": array of treatment types this applies to, from: stem_cell, prp, exosomes, bmac, whartons_jelly, prolotherapy, peptide, iv_therapy, hormone_therapy
- "title": short title (under 80 chars) for a news feed
- "description": one sentence description for a news feed

Return ONLY a JSON array of these objects. No markdown, no explanation.
If no violations are found relevant to regenerative medicine, return an empty array [].`

/**
 * Extract banned phrases from article text using Claude Haiku.
 */
export async function extractRulesFromText(
  text: string,
  sourceName: string,
  sourceType: string,
): Promise<ExtractedRule[]> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Source: ${sourceName} (${sourceType})\n\nDocument text:\n${text.slice(0, 12_000)}`,
        },
      ],
      system: EXTRACTION_PROMPT,
    })

    const content = response.content[0]
    if (content.type !== "text") return []

    // Parse JSON — handle possible markdown fencing
    let jsonStr = content.text.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed)) return []

    return parsed as ExtractedRule[]
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// 5. Semantic Deduplication
// ---------------------------------------------------------------------------

/**
 * Simple string similarity: checks if one phrase contains the other (normalized).
 */
function isSimpleDuplicate(a: string, b: string): boolean {
  const na = a.toLowerCase().trim()
  const nb = b.toLowerCase().trim()
  if (na === nb) return true
  if (na.includes(nb) || nb.includes(na)) return true
  return false
}

/**
 * Check if a new rule is semantically duplicate of any existing rules.
 */
export async function isDuplicateRule(
  newPhrase: string,
  existingPhrases: string[],
): Promise<boolean> {
  // Quick string check first
  for (const existing of existingPhrases) {
    if (isSimpleDuplicate(newPhrase, existing)) return true
  }

  // No simple match found — batch check the closest candidates with Claude
  // Only check against a reasonable subset to avoid excessive API calls
  const candidates = existingPhrases.slice(0, 50)
  if (candidates.length === 0) return false

  try {
    const ruleList = candidates
      .map((p, i) => `${i + 1}. ${p}`)
      .join("\n")

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content: `Is this new compliance rule semantically the same as ANY of the existing rules below?\n\nNew rule: "${newPhrase}"\n\nExisting rules:\n${ruleList}\n\nAnswer YES or NO only.`,
        },
      ],
    })

    const answer = response.content[0]
    if (answer.type !== "text") return false
    return answer.text.trim().toUpperCase().startsWith("YES")
  } catch {
    // On error, assume not duplicate to avoid losing rules
    return false
  }
}

// ---------------------------------------------------------------------------
// 6. Rule Insertion with Dedup
// ---------------------------------------------------------------------------

/**
 * Insert rules into Supabase, skipping duplicates.
 * Returns the count of newly inserted rules.
 */
export async function insertRulesWithDedup(
  rules: ExtractedRule[],
  sourceUrl: string,
  sourceName: string,
  sourceDate: string,
  supabase: SupabaseClient,
): Promise<number> {
  if (rules.length === 0) return 0

  // Fetch all existing banned phrases
  const { data: existing } = await supabase
    .from("compliance_rules")
    .select("banned_phrase")

  const existingPhrases = (existing ?? []).map(
    (r: { banned_phrase: string }) => r.banned_phrase,
  )

  let inserted = 0

  for (const rule of rules) {
    const isDup = await isDuplicateRule(rule.banned_phrase, existingPhrases)
    if (isDup) continue

    const { error } = await supabase.from("compliance_rules").insert({
      banned_phrase: rule.banned_phrase,
      banned_phrase_variants: rule.banned_phrase_variants,
      compliant_alternative: rule.compliant_alternative,
      risk_level: rule.risk_level,
      category: rule.category,
      applies_to: rule.applies_to,
      source_url: sourceUrl,
      source_name: sourceName,
      source_date: sourceDate,
      is_active: true,
    })

    if (!error) {
      inserted++
      // Add to existing list so subsequent rules in same batch dedup against it
      existingPhrases.push(rule.banned_phrase)
    }
  }

  return inserted
}
