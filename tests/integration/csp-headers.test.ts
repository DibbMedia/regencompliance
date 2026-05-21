// CSP regression lock.
//
// This file is a *static-analysis* regression test for the Content-Security-
// Policy posture set by `proxy.ts`. It reads `proxy.ts` as source text and
// asserts that the CSP template string still has the shape we shipped after
// the 2026-04-24 Tier-1 hardening pass:
//
//  - no `'unsafe-inline'` in `script-src` (style-src exception documented)
//  - no `'unsafe-eval'` anywhere
//  - no bare `*` or `https://*` origins outside the documented subdomain
//    wildcards (Supabase, Sentry, Vercel-Insights)
//  - mandatory hardening directives (`frame-ancestors 'none'`,
//    `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`,
//    `upgrade-insecure-requests`, `'strict-dynamic'`, nonce placeholder,
//    `report-uri` / `report-to`)
//
// In addition it scans every `.tsx` under `app/`, `components/`, and `lib/`
// for two contributor-error patterns:
//
//  1. An inline executable `<script>` tag without a `nonce={...}` attribute.
//     (JSON-LD `type="application/ld+json"` scripts are NOT executable and
//     are exempt; browsers don't run them.)
//
//  2. A `dangerouslySetInnerHTML` callsite that isn't either
//      (a) on the documented JSON-LD allowlist below, or
//      (b) preceded within 3 lines (or on the same line) by a
//          `// csp-allowed: <reason>` comment.
//
// Why a static test and not an HTTP integration test: `proxy.ts` runs inside
// the Next.js edge runtime which we don't have a stand-up harness for here.
// The CSP template is a deterministic string built from a single function
// (`buildCsp`); regex-asserting that source string catches the actual
// regressions we care about (someone adds `'unsafe-eval'`, drops
// `'strict-dynamic'`, slips in a wildcard).
//
// If a future refactor exports `buildCsp` from `proxy.ts`, this test could
// also call it directly. We deliberately do NOT modify `proxy.ts` here -
// another agent may be editing it in the same session, and the export isn't
// strictly necessary.
import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const REPO_ROOT = process.cwd()
const PROXY_PATH = join(REPO_ROOT, "proxy.ts")
const PROXY_SRC = readFileSync(PROXY_PATH, "utf8")

// Pull just the `buildCsp` function body so we don't accidentally match a
// directive that lives inside the Report-Only header block further down in
// the file (which intentionally uses different directives like
// `require-trusted-types-for`). If extraction fails, fall back to the whole
// file - the assertions still hold; we just lose some scoping precision.
function extractCspTemplate(src: string): string {
  const start = src.indexOf("function buildCsp")
  if (start === -1) return src
  // Find the matching closing brace of the function body.
  const openBrace = src.indexOf("{", start)
  if (openBrace === -1) return src
  let depth = 1
  let i = openBrace + 1
  while (i < src.length && depth > 0) {
    const ch = src[i]
    if (ch === "{") depth++
    else if (ch === "}") depth--
    i++
  }
  return src.slice(openBrace, i)
}

const CSP_TEMPLATE = extractCspTemplate(PROXY_SRC)

// Documented + allowed wildcard origins. Anything else flagged as a wildcard
// in `script-src`, `connect-src`, `frame-src`, or `object-src` fails the
// test. Keep this list in sync with `buildCsp` in `proxy.ts`.
const ALLOWED_WILDCARD_ORIGINS = [
  "https://*.supabase.co", // Supabase project subdomain (REST + storage)
  "wss://*.supabase.co", // Supabase realtime websocket
  "https://*.sentry.io", // Sentry ingest (env-gated; package not installed yet)
  "https://*.vercel-insights.com", // Vercel Web Analytics
]

// Documented allowlist of `dangerouslySetInnerHTML` callsites. These are all
// JSON-LD `<script type="application/ld+json">` blocks that emit structured
// data for SEO. JSON-LD is parsed by crawlers, not executed by the browser,
// so it does not require a CSP nonce and cannot be used as an XSS vector.
// Any NEW dangerouslySetInnerHTML usage must either land in `lib/schema/JsonLd.tsx`
// (the canonical wrapper) or carry a `// csp-allowed: <reason>` comment
// within 3 lines above the call.
const DANGEROUS_HTML_ALLOWLIST = new Set(
  [
    // Canonical JSON-LD wrapper. All new structured-data emission should
    // go through this component instead of inlining dangerouslySetInnerHTML.
    "lib/schema/JsonLd.tsx",
    // Pre-existing JSON-LD callsites that pre-date the wrapper. Migrating
    // them to <JsonLd /> is tracked as cleanup; the contents are server-built
    // typed schema objects, no user input flows in.
    "app/demo/page.tsx",
    "app/how-it-works/how-it-works-client.tsx",
    "app/security/security-client.tsx",
  ].map((p) => p.split("/").join(sep)),
)

describe("CSP header — proxy.ts buildCsp template", () => {
  it("contains default-src 'self'", () => {
    expect(CSP_TEMPLATE).toMatch(/default-src\s+'self'/)
  })

  it("contains frame-ancestors 'none' (clickjacking guard)", () => {
    expect(CSP_TEMPLATE).toMatch(/frame-ancestors\s+'none'/)
  })

  it("contains object-src 'none' (plugin/embed guard)", () => {
    expect(CSP_TEMPLATE).toMatch(/object-src\s+'none'/)
  })

  it("contains base-uri 'self' (base-tag injection guard)", () => {
    expect(CSP_TEMPLATE).toMatch(/base-uri\s+'self'/)
  })

  it("contains form-action 'self' (form-redirect guard)", () => {
    expect(CSP_TEMPLATE).toMatch(/form-action\s+'self'/)
  })

  it("contains upgrade-insecure-requests", () => {
    expect(CSP_TEMPLATE).toMatch(/upgrade-insecure-requests/)
  })

  it("script-src uses 'strict-dynamic'", () => {
    // strict-dynamic lets script-src 'nonce-...' propagate trust to scripts
    // loaded by Next.js's runtime chunks without needing each chunk URL on
    // an allowlist. Critical for App Router + Turbopack chunking.
    expect(CSP_TEMPLATE).toMatch(/'strict-dynamic'/)
  })

  it("script-src includes a nonce placeholder", () => {
    // The template interpolates the per-request nonce via `${nonce}`. We
    // assert against the unrendered template so a future refactor that
    // accidentally drops the nonce interpolation is caught.
    expect(CSP_TEMPLATE).toMatch(/'nonce-\$\{nonce\}'/)
  })

  it("does NOT contain 'unsafe-inline' in script-src", () => {
    // style-src 'unsafe-inline' is an allowed exception for Tailwind v4 +
    // shadcn variant compatibility. We assert specifically against the
    // script-src directive to avoid false-positiving on the style-src line.
    const scriptSrcMatch = CSP_TEMPLATE.match(/script-src[^;`,\n]+/g) ?? []
    for (const line of scriptSrcMatch) {
      expect(line).not.toMatch(/'unsafe-inline'/)
    }
  })

  it("does NOT contain 'unsafe-eval' anywhere in the CSP template", () => {
    expect(CSP_TEMPLATE).not.toMatch(/'unsafe-eval'/)
  })

  it("contains a report-uri OR report-to directive", () => {
    // Modern browsers prefer report-to (paired with the Reporting-Endpoints
    // header set elsewhere in proxy.ts). Legacy browsers still honor
    // report-uri. We require at least one.
    const hasReportUri = /report-uri\s+\/api\/csp-report/.test(CSP_TEMPLATE)
    const hasReportTo = /report-to\s+csp-endpoint/.test(CSP_TEMPLATE)
    expect(hasReportUri || hasReportTo).toBe(true)
  })

  it("does NOT contain bare wildcard origins outside the documented allowlist", () => {
    // Find every token in the CSP template that looks like an origin
    // containing a wildcard: `https?://*...`, `wss?://*...`, or a bare `*`
    // outside of a quoted CSP keyword.
    //
    // The CSP keywords `'self'`, `'none'`, `'strict-dynamic'`,
    // `'unsafe-inline'`, `'unsafe-eval'`, `'nonce-...'`, `'sha256-...'`,
    // `'wasm-unsafe-eval'` are all single-quoted and won't match the
    // origin pattern below.
    const wildcardOriginRegex = /(https?|wss?):\/\/\*[^\s"'`]+/g
    const matches = CSP_TEMPLATE.match(wildcardOriginRegex) ?? []
    for (const origin of matches) {
      expect(
        ALLOWED_WILDCARD_ORIGINS,
        `Wildcard origin "${origin}" is not on the documented CSP allowlist. ` +
          `If this is intentional, add it to ALLOWED_WILDCARD_ORIGINS in ` +
          `tests/integration/csp-headers.test.ts with a comment explaining why.`,
      ).toContain(origin)
    }
  })

  it("does NOT contain a bare '*' as a source in any directive", () => {
    // Match a standalone `*` token surrounded by whitespace or directive
    // delimiters. We deliberately do not flag `*.supabase.co` (covered by
    // the wildcard-origin test above) or `**/*` JSDoc-style content -
    // there is no such content in a CSP string.
    const bareStar = /(?:^|[\s;])\*(?:[\s;]|$)/m
    expect(CSP_TEMPLATE).not.toMatch(bareStar)
  })

  it("connect-src wildcards are limited to the documented set", () => {
    const connectSrcMatch = CSP_TEMPLATE.match(/connect-src[^;`,\n]+/)?.[0] ?? ""
    const wildcards = connectSrcMatch.match(/(https?|wss?):\/\/\*[^\s"'`]+/g) ?? []
    for (const w of wildcards) {
      expect(ALLOWED_WILDCARD_ORIGINS).toContain(w)
    }
  })
})

// -------- Source-tree scan: inline scripts without nonce -------------------

function walkTsx(dir: string, out: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    // Skip directories that obviously shouldn't be scanned. node_modules and
    // build output don't contain our source; .next and dist are derived.
    if (
      entry === "node_modules" ||
      entry === ".next" ||
      entry === "dist" ||
      entry === ".git" ||
      entry === ".claude" ||
      entry === "tests"
    ) {
      continue
    }
    const full = join(dir, entry)
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      walkTsx(full, out)
    } else if (st.isFile() && entry.endsWith(".tsx")) {
      out.push(full)
    }
  }
  return out
}

const TSX_FILES = walkTsx(REPO_ROOT)

// An inline executable <script> tag has either no `type=` attribute or a
// type that isn't `application/ld+json`. JSON-LD is data, not script, and is
// never executed by the browser, so a nonce isn't required (or honored).
//
// We look at each <script ...> opener and decide:
//   - If it has type="application/ld+json", exempt.
//   - Else require a `nonce={` (JSX expression for the runtime nonce) or
//     `nonce="...` (less likely but tolerated) attribute on the same tag.
const SCRIPT_OPEN_REGEX = /<script\b[^>]*>/g

interface InlineScriptViolation {
  file: string
  line: number
  excerpt: string
}

// Strip /* ... */ block comments and // line comments from a source file so
// that `<script>` mentioned in prose (e.g. a JSDoc that documents the
// component's purpose) doesn't get flagged as a real inline script.
// This is intentionally conservative - it doesn't try to handle strings or
// regexes - because .tsx source overwhelmingly uses comments only at line
// start or in JSDoc blocks, both of which this handles.
function stripComments(src: string): string {
  // Replace block-comment contents with newlines so line numbers stay aligned
  // for downstream consumers (we still report line numbers from the original
  // source, but stripping in-place keeps the byte offsets close enough that
  // the line-counter remains accurate).
  const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, (m) =>
    m.replace(/[^\n]/g, " "),
  )
  // Same for line comments.
  const noLine = noBlock.replace(/\/\/[^\n]*/g, (m) => m.replace(/./g, " "))
  return noLine
}

function scanFileForBareInlineScripts(file: string): InlineScriptViolation[] {
  const raw = readFileSync(file, "utf8")
  const src = stripComments(raw)
  const out: InlineScriptViolation[] = []
  let match: RegExpExecArray | null
  while ((match = SCRIPT_OPEN_REGEX.exec(src)) !== null) {
    const tag = match[0]
    if (/type\s*=\s*["']application\/ld\+json["']/.test(tag)) continue
    if (/\bnonce\s*=/.test(tag)) continue
    // Locate the line number from the original (unstripped) source so the
    // error message points at the actual JSX. Because stripComments preserves
    // newlines, offsets match between raw and stripped.
    const idx = match.index
    const line = raw.slice(0, idx).split("\n").length
    out.push({
      file: relative(REPO_ROOT, file),
      line,
      excerpt: tag.slice(0, 120),
    })
  }
  return out
}

describe("CSP regression — inline <script> tags must carry a nonce or be JSON-LD", () => {
  it("no .tsx file contains an inline <script> without nonce= or type=application/ld+json", () => {
    const violations: InlineScriptViolation[] = []
    for (const f of TSX_FILES) {
      violations.push(...scanFileForBareInlineScripts(f))
    }
    if (violations.length > 0) {
      const formatted = violations
        .map((v) => `  ${v.file}:${v.line}  ${v.excerpt}`)
        .join("\n")
      throw new Error(
        `Found inline <script> tag(s) without a nonce attribute and without ` +
          `type="application/ld+json". Inline scripts without a nonce will be ` +
          `blocked by the CSP. Either add a nonce={nonce} (read via headers() ` +
          `or the x-nonce request header) or, if this is structured data, set ` +
          `type="application/ld+json".\n\n${formatted}`,
      )
    }
  })
})

// -------- Source-tree scan: dangerouslySetInnerHTML allowlist ---------------

interface DangerHtmlCallsite {
  file: string // repo-relative, native sep
  line: number
  hasCspAllowedComment: boolean
}

function scanFileForDangerouslySetInnerHTML(file: string): DangerHtmlCallsite[] {
  const src = readFileSync(file, "utf8")
  const lines = src.split("\n")
  const out: DangerHtmlCallsite[] = []
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes("dangerouslySetInnerHTML")) continue
    // Look for `// csp-allowed:` on the same line OR within 3 lines above.
    let hasComment = false
    for (let j = Math.max(0, i - 3); j <= i; j++) {
      if (/\/\/\s*csp-allowed:/i.test(lines[j])) {
        hasComment = true
        break
      }
    }
    out.push({
      file: relative(REPO_ROOT, file),
      line: i + 1,
      hasCspAllowedComment: hasComment,
    })
  }
  return out
}

describe("CSP regression — dangerouslySetInnerHTML allowlist", () => {
  it("every dangerouslySetInnerHTML callsite is either documented in JsonLd.tsx, on the allowlist, or has a // csp-allowed: comment within 3 lines above", () => {
    const allCallsites: DangerHtmlCallsite[] = []
    for (const f of TSX_FILES) {
      allCallsites.push(...scanFileForDangerouslySetInnerHTML(f))
    }
    const violations: DangerHtmlCallsite[] = []
    for (const c of allCallsites) {
      if (DANGEROUS_HTML_ALLOWLIST.has(c.file)) continue
      if (c.hasCspAllowedComment) continue
      violations.push(c)
    }
    if (violations.length > 0) {
      const formatted = violations
        .map((v) => `  ${v.file}:${v.line}`)
        .join("\n")
      throw new Error(
        `Found dangerouslySetInnerHTML usage outside the documented allowlist ` +
          `and without a "// csp-allowed: <reason>" comment within 3 lines ` +
          `above the call.\n\n` +
          `Allowed paths:\n` +
          [...DANGEROUS_HTML_ALLOWLIST]
            .map((p) => `  - ${p.split(sep).join("/")}`)
            .join("\n") +
          `\n\n` +
          `New usages must either route through <JsonLd /> in lib/schema/JsonLd.tsx ` +
          `or add a "// csp-allowed: <why this HTML is safe>" comment.\n\n` +
          `Offending callsites:\n${formatted}`,
      )
    }
  })

  it("documents the four current dangerouslySetInnerHTML callsites for visibility", () => {
    // This isn't a real assertion - it's a snapshot of the surface area at
    // the time of writing so future readers can see what's in scope without
    // grepping. If the count changes, update this test to match.
    //
    // Current callsites (all JSON-LD scripts emitting typed schema objects):
    //   - lib/schema/JsonLd.tsx                       (canonical wrapper)
    //   - app/demo/page.tsx           (x2, WebPage + BreadcrumbList)
    //   - app/how-it-works/how-it-works-client.tsx     (FAQPage)
    //   - app/security/security-client.tsx             (FAQPage)
    const callsites: DangerHtmlCallsite[] = []
    for (const f of TSX_FILES) {
      callsites.push(...scanFileForDangerouslySetInnerHTML(f))
    }
    // Every callsite must live in an allowlisted file (we already enforce
    // this above; here we sanity-check the count is in the expected range).
    expect(callsites.length).toBeGreaterThanOrEqual(1)
    expect(callsites.length).toBeLessThanOrEqual(20)
    for (const c of callsites) {
      const allowed =
        DANGEROUS_HTML_ALLOWLIST.has(c.file) || c.hasCspAllowedComment
      expect(
        allowed,
        `Callsite ${c.file}:${c.line} is neither allowlisted nor commented`,
      ).toBe(true)
    }
  })
})
