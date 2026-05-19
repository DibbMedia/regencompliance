import * as cheerio from "cheerio"
import { anthropic } from "@/lib/anthropic"
import type { SupabaseClient } from "@supabase/supabase-js"
import { assertSafeUrl } from "@/lib/ssrf"
import { pinnedFetch } from "@/lib/safe-fetch"

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
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024
const MAX_REDIRECT_HOPS = 5

/**
 * Structured result for fetch paths that need to surface the HTTP status
 * (e.g., F-06 retire-on-404 in the site-crawl loop). Successful responses
 * carry the body; failures carry the last-seen status (or null if the call
 * never reached an HTTP response) plus a short reason string for logging.
 */
export type SafeFetchHtmlResult =
  | { ok: true; html: string }
  | { ok: false; httpStatus: number | null; reason: string }

export async function safeFetchHtmlWithStatus(
  url: string,
  timeoutMs: number,
): Promise<SafeFetchHtmlResult> {
  let current = url
  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop++) {
    const gate = await assertSafeUrl(current)
    if (!gate.ok || !gate.resolvedIps?.length) {
      console.error("[safeFetchHtml] assertSafeUrl blocked: " + current + " reason=" + (gate.reason ?? "no-ips"))
      return { ok: false, httpStatus: null, reason: "assertSafeUrl blocked: " + (gate.reason ?? "no-ips") }
    }

    // pinnedFetch connects to the IP we just validated, so a hostile DNS
    // server can't swap in a private IP between assertSafeUrl and fetch.
    const res = await pinnedFetch(current, gate.resolvedIps, {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    })

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location")
      if (!loc) {
        console.error("[safeFetchHtml] redirect without location: " + current)
        return { ok: false, httpStatus: res.status, reason: "redirect without location" }
      }
      try { current = new URL(loc, current).toString() } catch {
        console.error("[safeFetchHtml] malformed redirect location: " + loc + " from " + current)
        return { ok: false, httpStatus: res.status, reason: "malformed redirect location" }
      }
      continue
    }

    if (!res.ok) {
      console.error("[safeFetchHtml] non-OK status: " + res.status + " " + current)
      return { ok: false, httpStatus: res.status, reason: "HTTP " + res.status }
    }

    // Reject non-HTML responses. Without this guard a target server can
    // serve any binary as text/html and we burn the 2 MB cap parsing it.
    // Combined with the per-user crawl cap this is a defensive cost ceiling
    // - cheerio handles malformed HTML gracefully but a 2 MB binary still
    // eats CPU.
    // Restrict to HTML/XHTML. Earlier code also accepted text/plain as
    // defensive coverage; dropped because it just lets attackers serve
    // arbitrary text content (config files, source) through the scraper
    // pipeline, and no real enforcement source serves text/plain.
    // XML variants (application/xml, text/xml, application/rss+xml) are
    // also accepted so sitemap.xml discovery in lib/site-crawler.ts can
    // share this fetch path.
    const ct = (res.headers.get("content-type") || "").toLowerCase()
    if (
      ct &&
      !ct.includes("text/html") &&
      !ct.includes("application/xhtml") &&
      !ct.includes("application/xml") &&
      !ct.includes("text/xml") &&
      !ct.includes("application/rss+xml")
    ) {
      console.error("[safeFetchHtml] non-html content-type: " + ct + " " + current)
      return { ok: false, httpStatus: res.status, reason: "non-html content-type: " + ct }
    }

    const declared = res.headers.get("content-length")
    if (declared && Number(declared) > MAX_RESPONSE_BYTES) {
      console.error("[safeFetchHtml] declared content-length exceeds cap: " + declared + " " + current)
      return { ok: false, httpStatus: res.status, reason: "declared content-length exceeds cap" }
    }

    const reader = res.body?.getReader()
    if (!reader) {
      const txt = await res.text()
      if (txt.length > MAX_RESPONSE_BYTES) {
        return { ok: false, httpStatus: res.status, reason: "body bytes exceed cap" }
      }
      return { ok: true, html: txt }
    }
    const decoder = new TextDecoder()
    let out = ""
    let bytes = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_RESPONSE_BYTES) {
        try { await reader.cancel() } catch { /* ignore */ }
        console.error("[safeFetchHtml] body bytes exceed cap at " + bytes + " " + current)
        return { ok: false, httpStatus: res.status, reason: "body bytes exceed cap at " + bytes }
      }
      out += decoder.decode(value, { stream: true })
    }
    out += decoder.decode()
    return { ok: true, html: out }
  }
  console.error("[safeFetchHtml] max redirects exhausted: " + current)
  return { ok: false, httpStatus: null, reason: "max redirects exhausted" }
}

/**
 * Back-compat wrapper around safeFetchHtmlWithStatus. Returns the HTML body
 * on success or null on any failure. Use safeFetchHtmlWithStatus when the
 * caller needs the HTTP status code (e.g., to distinguish 404 for retire-
 * on-404 logic).
 */
export async function safeFetchHtml(url: string, timeoutMs: number): Promise<string | null> {
  const result = await safeFetchHtmlWithStatus(url, timeoutMs)
  return result.ok ? result.html : null
}

export type FetchPageResult =
  | { ok: true; $: cheerio.CheerioAPI }
  | { ok: false; httpStatus: number | null; reason: string }

export async function fetchPageWithStatus(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<FetchPageResult> {
  try {
    const result = await safeFetchHtmlWithStatus(url, timeoutMs)
    if (!result.ok) return result
    return { ok: true, $: cheerio.load(result.html) }
  } catch (err) {
    console.error("[fetchPage] threw:", url, err instanceof Error ? err.message : String(err))
    return {
      ok: false,
      httpStatus: null,
      reason: err instanceof Error ? err.message : String(err),
    }
  }
}

export async function fetchPage(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<cheerio.CheerioAPI | null> {
  const result = await fetchPageWithStatus(url, timeoutMs)
  return result.ok ? result.$ : null
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
You use the following risk classification system:

RED LIGHT (high risk) - phrases/claims that are NEVER allowed:
- Cure/treatment claims for unapproved therapies
- Guaranteed outcomes or absolute safety claims
- FDA approval misrepresentation
- Unapproved efficacy claims (exosomes, stem cells, peptides)
- Comparative superiority without substantiation
- Misleading credentials, PHI in marketing, fake reviews

YELLOW LIGHT (medium risk) - phrases that are RESTRICTED and need disclaimers:
- Research citations without links or FDA disclaimers
- Off-label use mentions without off-label disclaimer
- Patient experience language without typicality disclosure
- PRP/PRF benefit claims without off-label status clarification
- Stem cell/exosome educational content without regulatory status disclaimers

GREEN LIGHT (low risk / approved) - safe patterns:
- Educational overviews, consultation framing, process descriptions
- Balanced risk language, clear regulatory status
- General wellness claims, real credentials, proper disclaimers

Analyze this enforcement document and extract every specific marketing phrase or claim that was cited as a violation.

For each violation found, output a JSON object with these fields:
- "banned_phrase": the exact or closely paraphrased violating claim
- "banned_phrase_variants": 3-5 natural language ways someone might phrase the same claim
- "compliant_alternative": a rewritten GREEN LIGHT version that would be legally compliant
- "risk_level": "high" if it matches a RED LIGHT pattern (direct enforcement action, cure/efficacy/safety claims), "medium" if YELLOW LIGHT (warning, missing disclaimers), "low" if guidance/suggestion
- "category": one of "health_claims", "fda_approval", "efficacy", "safety"
- "applies_to": array of treatment types this applies to, from: stem_cell, prp, exosomes, bmac, whartons_jelly, prolotherapy, peptide, iv_therapy, hormone_therapy, bhrt, hbot, svf_adipose
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

    // Parse JSON - handle possible markdown fencing
    let jsonStr = content.text.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed)) return []

    return parsed as ExtractedRule[]
  } catch (e) {
    console.error("[extractRulesFromText] failed for", sourceName, e)
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

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "in", "on", "at", "to", "for",
  "with", "by", "from", "as", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "this", "that", "these",
  "those", "i", "you", "he", "she", "it", "we", "they", "what", "which",
])

function tokenize(phrase: string): Set<string> {
  return new Set(
    phrase
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t)),
  )
}

/** Jaccard similarity over content-bearing tokens (drops stop-words + 1-2 char tokens). */
function tokenOverlap(aTokens: Set<string>, b: string): number {
  const bTokens = tokenize(b)
  if (aTokens.size === 0 || bTokens.size === 0) return 0
  let intersection = 0
  for (const t of aTokens) if (bTokens.has(t)) intersection++
  const union = aTokens.size + bTokens.size - intersection
  return union > 0 ? intersection / union : 0
}

/**
 * Check if a new rule is semantically duplicate of any existing rules.
 *
 * Cost-control redesign (post-2026-05-05): pre-filter candidates by Jaccard
 * token overlap before falling back to Claude. Most "obviously different"
 * pairs share <0.2 of content-bearing tokens, so the model only sees the
 * ambiguous middle. Drops per-cron-run Claude cost from ~150 calls to ~5-15.
 */
export async function isDuplicateRule(
  newPhrase: string,
  existingPhrases: string[],
): Promise<boolean> {
  // Quick string check first - covers exact + substring overlap.
  for (const existing of existingPhrases) {
    if (isSimpleDuplicate(newPhrase, existing)) return true
  }

  if (existingPhrases.length === 0) return false

  // Token-overlap pre-filter. Only phrases sharing significant content-
  // bearing token overlap make it to the Claude call.
  const newTokens = tokenize(newPhrase)
  if (newTokens.size === 0) return false

  const SIMILARITY_THRESHOLD = 0.4
  const MAX_CANDIDATES = 10
  const ranked = existingPhrases
    .map((p) => ({ phrase: p, score: tokenOverlap(newTokens, p) }))
    .filter((c) => c.score >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CANDIDATES)

  if (ranked.length === 0) return false

  try {
    const ruleList = ranked.map((c, i) => `${i + 1}. ${c.phrase}`).join("\n")

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
  } catch (e) {
    console.error("[isDuplicateRule] failed:", e)
    return false
  }
}

// ---------------------------------------------------------------------------
// 5b. Enforcement Action Metadata Extraction
// ---------------------------------------------------------------------------

export interface ExtractedActionMetadata {
  company_name: string | null
  product_or_treatment: string | null
  summary: string
}

const ACTION_METADATA_PROMPT = `You are summarizing a regulatory enforcement document for a public-facing
compliance library. Read the document and return STRICT JSON with these fields:

- "company_name": the primary company, clinic, or person being cited. If the
  document is general guidance with no specific target, use null. Never invent.
- "product_or_treatment": short phrase naming the product or treatment at issue
  (e.g., "stem cell injections for arthritis", "exosome IV therapy"). Use null
  if not applicable.
- "summary": exactly 1-3 sentences in plain English explaining what happened -
  who was cited, what they were marketing, and what the agency said. No quotes,
  no markdown, no bullet points. Maximum 350 characters.

Return ONLY a JSON object. No markdown fencing, no preamble.`

/**
 * Extract enforcement-action metadata (company, product, summary) from article text
 * using Claude Haiku. One call per article.
 */
export async function extractActionMetadata(
  text: string,
  sourceName: string,
): Promise<ExtractedActionMetadata | null> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Source: ${sourceName}\n\nDocument text:\n${text.slice(0, 12_000)}`,
        },
      ],
      system: ACTION_METADATA_PROMPT,
    })

    const content = response.content[0]
    if (content.type !== "text") return null

    let jsonStr = content.text.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const parsed = JSON.parse(jsonStr) as ExtractedActionMetadata
    if (!parsed || typeof parsed.summary !== "string") return null

    return {
      company_name: parsed.company_name ?? null,
      product_or_treatment: parsed.product_or_treatment ?? null,
      summary: parsed.summary,
    }
  } catch (e) {
    console.error("[extractActionMetadata] failed for", sourceName, e)
    return null
  }
}

// ---------------------------------------------------------------------------
// 5b-2. Rule-based Summary Fallback
// ---------------------------------------------------------------------------

export interface RuleDigestInput {
  banned_phrase: string
  compliant_alternative: string
  category: string
  risk_level: string
  applies_to: string[]
}

const RULE_SUMMARY_PROMPT = `You are writing a 1-2 sentence summary for a public compliance library.
You will receive a source agency/name plus the banned marketing phrases that were flagged.
Based on those phrases, write a short plain-English summary of what the enforcement action appears to be about.

Rules:
- Exactly 1-2 sentences, maximum 280 characters total.
- Third person, past tense (e.g., "Prime Sciences was cited for marketing...").
- If no company name is known, refer to "the company" generically.
- Describe the nature of the violation based on the phrases (e.g., unapproved treatment claims,
  misleading efficacy statements, illegal sales of research-use products).
- No quotation marks. No markdown. No bullet points. No "The FDA" boilerplate preamble.

Return ONLY the summary text. No JSON, no extra commentary.`

/**
 * Synthesize a short summary from the company name + cited rules, for cases where
 * we can't fetch the original letter (e.g., source_url is a generic listing page).
 */
export async function synthesizeSummaryFromRules(
  companyName: string | null,
  productOrTreatment: string | null,
  agency: string | null,
  sourceName: string,
  rules: RuleDigestInput[],
): Promise<string | null> {
  if (rules.length === 0) return null

  try {
    const ruleLines = rules
      .slice(0, 10)
      .map((r, i) => `${i + 1}. [${r.risk_level}/${r.category}] "${r.banned_phrase}" → "${r.compliant_alternative}"`)
      .join("\n")

    const treatments = Array.from(
      new Set(rules.flatMap((r) => r.applies_to).filter(Boolean)),
    ).slice(0, 6)

    const context = [
      `Source: ${sourceName}${agency ? ` (${agency})` : ""}`,
      companyName ? `Company: ${companyName}` : "Company: unknown",
      productOrTreatment ? `Product/treatment: ${productOrTreatment}` : null,
      treatments.length > 0 ? `Treatment types: ${treatments.join(", ")}` : null,
      "",
      "Cited phrases:",
      ruleLines,
    ]
      .filter(Boolean)
      .join("\n")

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: context }],
      system: RULE_SUMMARY_PROMPT,
    })

    const content = response.content[0]
    if (content.type !== "text") return null

    const summary = content.text.trim().replace(/^["']|["']$/g, "")
    if (summary.length < 20) return null
    return summary
  } catch (e) {
    console.error("[synthesizeSummaryFromRules] failed:", e)
    return null
  }
}

// ---------------------------------------------------------------------------
// 5c. Source Type → Agency Mapping
// ---------------------------------------------------------------------------

export function agencyForSourceType(type: ComplianceSource["type"]): string | null {
  switch (type) {
    case "fda_warning":
    case "fda_483":
      return "FDA"
    case "ftc_press":
    case "ftc_guidance":
      return "FTC"
    case "doj_fraud":
      return "DOJ"
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// 6. Enforcement Action Upsert
// ---------------------------------------------------------------------------

/**
 * Look up an enforcement action by source_url. If missing, generate metadata
 * from the article text and insert it. Returns the action id, or null on failure.
 */
export async function upsertEnforcementAction(
  source: ComplianceSource,
  url: string,
  articleText: string,
  articleDate: string,
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("enforcement_actions")
    .select("id")
    .eq("source_url", url)
    .maybeSingle()

  if (existing?.id) return existing.id

  const metadata = await extractActionMetadata(articleText, source.name)

  const { data: inserted, error } = await supabase
    .from("enforcement_actions")
    .insert({
      source_url: url,
      source_type: source.type,
      source_name: source.name,
      source_date: articleDate,
      agency: agencyForSourceType(source.type),
      company_name: metadata?.company_name ?? null,
      product_or_treatment: metadata?.product_or_treatment ?? null,
      summary: metadata?.summary ?? null,
      violation_categories: [],
      rule_count: 0,
    })
    .select("id")
    .single()

  if (error || !inserted) {
    console.error(`Failed to insert enforcement_action for ${url}:`, error)
    return null
  }

  return inserted.id
}

/**
 * Recompute violation_categories and rule_count for an enforcement action
 * after its child rules have been inserted. If the action is still missing a
 * summary (e.g., source URL was a generic listing page), synthesize one from
 * the newly-linked rules so the library UI always has readable text.
 */
export async function refreshActionRollup(
  actionId: string,
  supabase: SupabaseClient,
): Promise<void> {
  const { data: rules } = await supabase
    .from("compliance_rules")
    .select("banned_phrase, compliant_alternative, category, risk_level, applies_to")
    .eq("enforcement_action_id", actionId)
    .eq("is_active", true)

  const categories = Array.from(
    new Set((rules ?? []).map((r: { category: string }) => r.category)),
  )

  const update: Record<string, unknown> = {
    rule_count: rules?.length ?? 0,
    violation_categories: categories,
  }

  // Fill in a synthesized summary if this action still has none and has rules
  const { data: action } = await supabase
    .from("enforcement_actions")
    .select("summary, company_name, product_or_treatment, agency, source_name")
    .eq("id", actionId)
    .maybeSingle()

  if (action && !action.summary && rules && rules.length > 0) {
    const summary = await synthesizeSummaryFromRules(
      action.company_name as string | null,
      action.product_or_treatment as string | null,
      action.agency as string | null,
      action.source_name as string,
      rules,
    )
    if (summary) update.summary = summary
  }

  await supabase
    .from("enforcement_actions")
    .update(update)
    .eq("id", actionId)
}

// ---------------------------------------------------------------------------
// 7. Rule Insertion with Dedup
// ---------------------------------------------------------------------------

/**
 * Insert rules into Supabase, skipping duplicates. Each rule is linked to the
 * provided enforcement_action_id (nullable for manual entries).
 * Returns the count of newly inserted rules.
 */
export async function insertRulesWithDedup(
  rules: ExtractedRule[],
  sourceUrl: string,
  sourceName: string,
  sourceDate: string,
  supabase: SupabaseClient,
  enforcementActionId: string | null = null,
): Promise<number> {
  if (rules.length === 0) return 0

  // Fetch existing banned phrases. Bounded to last 5000 rules ordered by
  // created_at so this stays O(1) regardless of total rule count - older
  // rules are unlikely to be the target of new-rule semantic dedup.
  const { data: existing } = await supabase
    .from("compliance_rules")
    .select("banned_phrase")
    .order("created_at", { ascending: false })
    .limit(5000)

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
      enforcement_action_id: enforcementActionId,
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
