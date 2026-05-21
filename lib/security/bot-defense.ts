/**
 * Bot-defense classifier for the Edge middleware (`proxy.ts`).
 *
 * Single synchronous entry point `classifyRequest(request)` returns a verdict
 * that proxy.ts uses to decide allow / deny / rate-limit posture.
 *
 * Edge-runtime safe: no `node:*` imports, no Buffer, no async lookups,
 * no DB calls. All decisions come from pattern matching against in-module
 * constants.
 *
 * Order of precedence (first match wins):
 *   1. AI crawler allowlist (welcome unconditionally, even on weird paths)
 *   2. Vuln-scanner UA (hard deny)
 *   3. Bad-scraper UA (hard deny)
 *   4. Attacker-probe path (hard deny - wp-admin / .env / phpmyadmin / etc)
 *   5. Injection pattern (hard deny - SQLi / XSS / Log4Shell / traversal)
 *   6. Missing UA on POST/PUT/PATCH/DELETE (hard deny)
 *   7. Unknown bot UA heuristic (rate-limit-strict)
 *   8. Default normal pass-through
 *
 * IMPORTANT: literal `/admin/` and `/api/admin/` are NOT in the probe list -
 * those are this app's own admin surface (gated separately by SEC-F IP
 * allowlist + verifyAdmin). The probe list only catches paths the app does
 * NOT own (wp-admin, phpmyadmin, .env, .git, etc).
 */

export type BotClassification =
  | { verdict: "allow"; reason: "ai-crawler"; matchedSignature: string }
  | {
      verdict: "deny"
      reason:
        | "vuln-scanner-ua"
        | "bad-scraper-ua"
        | "attacker-probe-path"
        | "injection-pattern"
        | "missing-ua-on-post"
      matchedSignature: string
    }
  | { verdict: "rate-limit-strict"; reason: "unknown-bot-ua"; matchedSignature: string }
  | { verdict: "normal"; reason: "no-match"; matchedSignature: "" }

// ---------------------------------------------------------------------------
// AI_CRAWLER_ALLOWLIST
//
// These crawlers are welcomed unconditionally - UA match wins, no rate limit,
// no probe-path tarpit. The matching is case-insensitive substring.
// ---------------------------------------------------------------------------

export const AI_CRAWLER_ALLOWLIST: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  // OpenAI
  { name: "GPTBot", pattern: /GPTBot/i },
  { name: "ChatGPT-User", pattern: /ChatGPT-User/i },
  { name: "OAI-SearchBot", pattern: /OAI-SearchBot/i },
  // Perplexity
  { name: "PerplexityBot", pattern: /PerplexityBot/i },
  { name: "Perplexity-User", pattern: /Perplexity-User/i },
  // Anthropic
  { name: "ClaudeBot", pattern: /ClaudeBot/i },
  { name: "Claude-Web", pattern: /Claude-Web/i },
  { name: "anthropic-ai", pattern: /anthropic-ai/i },
  // Traditional search
  { name: "Googlebot", pattern: /Googlebot/i },
  { name: "Bingbot", pattern: /Bingbot/i },
  { name: "DuckDuckBot", pattern: /DuckDuckBot/i },
  { name: "Applebot", pattern: /Applebot/i },
  { name: "Amazonbot", pattern: /Amazonbot/i },
  // Social / link unfurling (needed for OG cards)
  { name: "facebookexternalhit", pattern: /facebookexternalhit/i },
  { name: "Twitterbot", pattern: /Twitterbot/i },
  { name: "LinkedInBot", pattern: /LinkedInBot/i },
  { name: "Slackbot", pattern: /Slackbot/i },
  { name: "Discordbot", pattern: /Discordbot/i },
]

// ---------------------------------------------------------------------------
// VULN_SCANNER_DENYLIST
//
// Anything in here is a security-tool UA and should never reach the app.
// Hard 403 + log. Case-insensitive substring.
//
// NOTE: `burpsuite` is sometimes a legitimate pentester (an operator running
// an authorised scan), but it should never appear unannounced against prod -
// we deny it and let the operator coordinate test windows out-of-band.
// ---------------------------------------------------------------------------

export const VULN_SCANNER_DENYLIST: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: "nikto", pattern: /nikto/i },
  { name: "sqlmap", pattern: /sqlmap/i },
  { name: "nuclei", pattern: /nuclei/i },
  { name: "dirbuster", pattern: /dirbuster/i },
  { name: "dirb", pattern: /\bdirb\b/i },
  { name: "gobuster", pattern: /gobuster/i },
  { name: "wfuzz", pattern: /wfuzz/i },
  { name: "ffuf", pattern: /\bffuf\b/i },
  { name: "hydra", pattern: /\bhydra\b/i },
  { name: "masscan", pattern: /masscan/i },
  { name: "zgrab", pattern: /zgrab/i },
  { name: "nmap", pattern: /\bnmap\b/i },
  { name: "acunetix", pattern: /acunetix/i },
  { name: "qualys", pattern: /qualys/i },
  { name: "nessus", pattern: /nessus/i },
  { name: "w3af", pattern: /w3af/i },
  { name: "wpscan", pattern: /wpscan/i },
  { name: "skipfish", pattern: /skipfish/i },
  { name: "arachni", pattern: /arachni/i },
  { name: "openvas", pattern: /openvas/i },
  { name: "burpsuite", pattern: /burpsuite/i },
]

// ---------------------------------------------------------------------------
// BAD_SCRAPER_DENYLIST
//
// Aggressive scrapers / SEO miners / training crawlers we explicitly don't
// want. Hard 403. Case-insensitive substring.
//
// NOTE on CCBot (Common Crawl): the user opted to block "shit AI" crawlers,
// and Common Crawl is upstream of many model training pipelines. Including
// it here is a deliberate choice - it also blocks any downstream models
// that pull from CC, which is the intent. Operator can comment this line
// out to permit Common Crawl if needed.
// ---------------------------------------------------------------------------

export const BAD_SCRAPER_DENYLIST: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  // ByteDance / TikTok - aggressive, ignores robots.txt
  { name: "Bytespider", pattern: /bytespider/i },
  { name: "Diffbot", pattern: /Diffbot/i },
  { name: "MJ12bot", pattern: /MJ12bot/i },
  { name: "AhrefsBot", pattern: /AhrefsBot/i },
  { name: "SemrushBot", pattern: /SemrushBot/i },
  { name: "DotBot", pattern: /\bdotbot\b/i },
  { name: "DataForSeoBot", pattern: /DataForSeoBot/i },
  { name: "PetalBot", pattern: /PetalBot/i },
  { name: "SeznamBot", pattern: /SeznamBot/i },
  { name: "BLEXBot", pattern: /BLEXBot/i },
  { name: "ZoomBot", pattern: /ZoomBot/i },
  { name: "mediatoolkitbot", pattern: /mediatoolkitbot/i },
  { name: "magpie-crawler", pattern: /magpie-crawler/i },
  { name: "meanpathbot", pattern: /meanpathbot/i },
  { name: "WeViKaBot", pattern: /WeViKaBot/i },
  { name: "Sogou", pattern: /Sogou/i },
  { name: "spaziodati", pattern: /spaziodati/i },
  // Common Crawl - blocks upstream training data source. Comment to allow.
  { name: "CCBot", pattern: /CCBot/i },
]

// ---------------------------------------------------------------------------
// ATTACKER_PROBE_PATHS
//
// Paths that THIS app does not own. If a request hits one of these, the
// client is fingerprinting for a vulnerable WordPress / phpMyAdmin / Git
// repo / leaked env file. Hard 403 + log.
//
// IMPORTANT: literal `/admin/` and `/api/admin/` are NOT here - those are
// this app's legit admin surface, gated by SEC-F IP allowlist + verifyAdmin().
// Only paths the app DOESN'T own are listed.
// ---------------------------------------------------------------------------

export const ATTACKER_PROBE_PATHS: ReadonlyArray<RegExp> = [
  // Leaked secrets / config files
  /\/\.env(\.[a-z]+)?(\/|$)/i, // .env, .env.local, .env.production, .env/anything
  /\/\.git(\/|$)/i, // .git/, .git/config, .git/HEAD
  /\/\.svn(\/|$)/i,
  /\/\.aws\//i,
  /\/\.htaccess/i,
  /\/\.htpasswd/i,
  /\/sftp-config\.json/i,
  /\/credentials\.json/i,
  /\/backup\.(sql|zip|tar|tar\.gz)/i,
  /\/web\.config/i,

  // WordPress fingerprinting
  /\/wp-admin(\/|$|\.php)/i,
  /\/wp-login\.php/i,
  /\/wp-content(\/|$)/i,
  /\/wp-includes(\/|$)/i,
  /\/xmlrpc\.php/i,

  // phpMyAdmin variants
  /\/phpmyadmin(\/|$)/i,
  /\/phpMyAdmin(\/|$)/, // explicit case (no /i) - the locked spec listed both
  /\/myadmin(\/|$)/i,

  // Generic admin PHP probes (NOT our /admin/ - these target file paths)
  /\/admin\.php/i,
  /\/administrator(\/|$)/i,

  // Server-status / health probes from outside
  /\/server-status/i,

  // PHPUnit RCE chain
  /\/vendor\/phpunit/i,

  // Jenkins fingerprint
  /\/jenkins(\/|$)/i,

  // Spring Boot Actuator leaks
  /\/actuator\/env/i,
  /\/actuator\/health/i,
]

// ---------------------------------------------------------------------------
// INJECTION_PATTERNS
//
// Tested against `url.pathname + "?" + url.search`. Hard 403 + log.
//
// We deliberately avoid testing url.hash because the hash never reaches the
// server, and we also keep the javascript: check narrow to avoid false
// positives on legitimate blog content that may quote "javascript:" inside
// query params for educational content.
// ---------------------------------------------------------------------------

export const INJECTION_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  { name: "SQLi-OR-1-1", pattern: /'\s*OR\s+'?1'?\s*=\s*'?1/i },
  { name: "SQLi-UNION", pattern: /\bUNION\s+(?:ALL\s+)?SELECT\b/i },
  { name: "XSS-script-tag", pattern: /<script[\s>]/i },
  { name: "XSS-javascript-uri", pattern: /javascript:/i },
  { name: "Log4Shell", pattern: /\$\{jndi:/i },
  { name: "path-traversal-encoded", pattern: /\.\.%2[fF]/ },
  { name: "path-traversal-raw", pattern: /\.\.\// },
  { name: "etc-passwd", pattern: /etc\/passwd/i },
  { name: "cmd-exe", pattern: /cmd\.exe/i },
  { name: "null-byte", pattern: /%00/i },
  { name: "php-stream-wrappers", pattern: /(?:php|data|file|expect):\/\//i },
]

// ---------------------------------------------------------------------------
// CLI tool UAs that should not be hitting POST/PUT/PATCH/DELETE on our
// public app without an explicit API key. These ARE sometimes legitimate
// API clients, but when they are, they go through a separate API-key gate
// at the route level, not the public proxy.
// ---------------------------------------------------------------------------

const SUSPICIOUS_CLI_UA = /^(curl|wget|python-requests|Python-urllib|Java\/|libwww-perl|Go-http-client)/i

// ---------------------------------------------------------------------------
// Heuristic substrings that suggest "this is a bot but I don't recognise it".
// Used to gate unknown crawlers down to a strict rate limit instead of a
// hard deny (they may be legitimate but unknown - hard deny would burn
// goodwill with newly-launched search/AI products).
// ---------------------------------------------------------------------------

const BOT_HINT_PATTERN = /(bot|crawl|spider|scraper|slurp|fetch|archive|monitor)/i

// ===========================================================================
// Matchers - exported for testing + reuse
// ===========================================================================

export function matchAllowedAiCrawler(ua: string): string | null {
  if (!ua) return null
  for (const entry of AI_CRAWLER_ALLOWLIST) {
    if (entry.pattern.test(ua)) return entry.name
  }
  return null
}

export function matchVulnScannerUa(ua: string): string | null {
  if (!ua) return null
  for (const entry of VULN_SCANNER_DENYLIST) {
    if (entry.pattern.test(ua)) return entry.name
  }
  return null
}

export function matchBadScraperUa(ua: string): string | null {
  if (!ua) return null
  for (const entry of BAD_SCRAPER_DENYLIST) {
    if (entry.pattern.test(ua)) return entry.name
  }
  return null
}

export function matchAttackerProbePath(pathname: string): string | null {
  if (!pathname) return null
  for (const pattern of ATTACKER_PROBE_PATHS) {
    if (pattern.test(pathname)) return pattern.source
  }
  return null
}

export function matchInjectionPattern(url: URL): string | null {
  // Compose the raw test string: pathname + "?" + search.
  const search = url.search.startsWith("?") ? url.search.slice(1) : url.search
  const raw = search.length > 0 ? `${url.pathname}?${search}` : url.pathname

  // Also produce a percent-decoded version. WHATWG `new URL()` re-encodes
  // characters in the query (so `<script>` -> `%3Cscript%3E`), and attackers
  // routinely double-encode payloads to bypass naive WAFs. We test BOTH
  // forms so a `?q=<script>` lands the same way `?q=%3Cscript%3E` does.
  //
  // decodeURIComponent throws on malformed sequences (e.g. lone `%` in a
  // query). Treat a throw as "no decode possible" and skip the second pass.
  let decoded = ""
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = ""
  }

  for (const entry of INJECTION_PATTERNS) {
    if (entry.pattern.test(raw)) return entry.name
    if (decoded && entry.pattern.test(decoded)) return entry.name
  }
  return null
}

export function isSuspiciousMissingUa(method: string, ua: string | null): boolean {
  const m = method.toUpperCase()
  if (m === "GET" || m === "HEAD") return false
  if (ua === null || ua === "" || ua === "-") return true
  if (SUSPICIOUS_CLI_UA.test(ua)) return true
  return false
}

export function isLikelyBotUa(ua: string): boolean {
  if (!ua) return false
  // Must look bot-ish AND must NOT be on the AI crawler allowlist
  if (!BOT_HINT_PATTERN.test(ua)) return false
  if (matchAllowedAiCrawler(ua)) return false
  return true
}

// ===========================================================================
// Entry point - first match wins, order matches the contract.
// ===========================================================================

export function classifyRequest(request: Request): BotClassification {
  const ua = request.headers.get("user-agent") || ""
  const url = new URL(request.url)
  const pathname = url.pathname
  const method = request.method

  // 1. AI crawler allowlist - takes precedence over everything (a legit
  //    Googlebot probing /wp-admin still gets through; we'd rather not
  //    accidentally block search indexing because of a fluke probe).
  const aiMatch = matchAllowedAiCrawler(ua)
  if (aiMatch) {
    return { verdict: "allow", reason: "ai-crawler", matchedSignature: aiMatch }
  }

  // 2. Vuln scanner UA - hard deny + log.
  const vulnMatch = matchVulnScannerUa(ua)
  if (vulnMatch) {
    return { verdict: "deny", reason: "vuln-scanner-ua", matchedSignature: vulnMatch }
  }

  // 3. Bad scraper UA - hard deny.
  const scraperMatch = matchBadScraperUa(ua)
  if (scraperMatch) {
    return { verdict: "deny", reason: "bad-scraper-ua", matchedSignature: scraperMatch }
  }

  // 4. Attacker probe path - hard deny + log.
  const probeMatch = matchAttackerProbePath(pathname)
  if (probeMatch) {
    return { verdict: "deny", reason: "attacker-probe-path", matchedSignature: probeMatch }
  }

  // 5. Injection pattern in URL - hard deny + log.
  const injectionMatch = matchInjectionPattern(url)
  if (injectionMatch) {
    return { verdict: "deny", reason: "injection-pattern", matchedSignature: injectionMatch }
  }

  // 6. Missing or CLI-tool UA on write methods - hard deny.
  if (isSuspiciousMissingUa(method, ua || null)) {
    return {
      verdict: "deny",
      reason: "missing-ua-on-post",
      matchedSignature: ua || "(empty)",
    }
  }

  // 7. Looks bot-ish but we don't recognise it - tighten rate limit but
  //    don't hard-deny (could be a brand-new legitimate crawler).
  if (isLikelyBotUa(ua)) {
    return {
      verdict: "rate-limit-strict",
      reason: "unknown-bot-ua",
      matchedSignature: ua.slice(0, 100),
    }
  }

  // 8. Default pass-through.
  return { verdict: "normal", reason: "no-match", matchedSignature: "" }
}
