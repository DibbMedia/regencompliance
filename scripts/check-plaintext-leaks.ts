// CI guard: scan API route handlers for patterns that risk leaking encrypted
// columns or bypassing the repo decrypt layer.
//
// Run: `npm run check:plaintext-leaks`
// Wired into .github/workflows/tests.yml.
//
// Heuristics (conservative — false positives are tolerable, false negatives
// are not):
//   1. `.select("*")` on `app/**/route.ts` or `app/api/**/*.ts` files.
//      Returning `*` will include `*_enc` columns alongside whatever else
//      and risks leaking ciphertext to the client unchecked. Exception:
//      the same file imports from `lib/repos/` (heuristic that the file
//      routes through the decrypt-aware repo layer).
//   2. Direct `.from("<table>").select(...)` where <select args> include any
//      column listed in ENCRYPTED_COLUMNS, in a file that does NOT import
//      from `lib/repos/`. These bypass the decrypt path entirely.
//   3. Direct read of a known-plaintext column that was dropped at cutover
//      (e.g., `scans.original_text` post-migration 036). Pre-cutover this
//      reads through; post-cutover it errors at runtime. Either way it
//      indicates code that skipped the repo layer.
//
// Output: list of `file:line — pattern — suggestion`. Exit 1 if any matches.

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const ROOT = process.cwd()
const APP_DIR = join(ROOT, "app")

// Encrypted columns by table, derived from migrations 033/035/037/039/041.
// Format: `<table>.<column>`. The plaintext name (no `_enc`) is what we flag —
// any direct read of these post-cutover is a bug.
const ENCRYPTED_COLUMNS: ReadonlyArray<string> = [
  // 033 — profiles, team_members
  "profiles.clinic_name",
  "profiles.treatments",
  "team_members.email",
  // 035 — scans, monitored_sites, site_pages
  "scans.original_text",
  "scans.rewritten_text",
  "scans.flags",
  "scans.source_url",
  "monitored_sites.domain",
  "monitored_sites.name",
  "site_pages.url",
  "site_pages.title",
  // 037 — tickets, notifications
  "support_tickets.subject",
  "ticket_messages.message",
  "notifications.title",
  "notifications.body",
  "notifications.action_url",
  // 039 — audit + impersonation
  "audit_log.user_email",
  "audit_log.details",
  "audit_log.ip_address",
  "audit_log.user_agent",
  "impersonation_sessions.admin_email",
  "impersonation_sessions.target_email",
  // 041 — lead-capture
  "waitlist.email",
  "waitlist.name",
  "waitlist.ip_address",
  "waitlist.user_agent",
  "beta_applications.name",
  "beta_applications.email",
  "beta_applications.clinic_name",
  "beta_applications.specialty",
  "beta_applications.role",
  "beta_applications.website",
  "beta_applications.monthly_volume",
  "beta_applications.why_apply",
  "beta_applications.ip_address",
  "beta_applications.user_agent",
  "free_audit_leads.email",
  "free_audit_leads.website_url",
  "free_audit_leads.page_title",
  "free_audit_leads.ip_address",
  "free_audit_leads.user_agent",
  "free_audit_leads.flags",
  "newsletter_subscribers.email",
  "newsletter_subscribers.ip_address",
  "newsletter_subscribers.user_agent",
  "beta_purchases.email",
]

interface Finding {
  file: string
  line: number
  pattern: string
  suggestion: string
}

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    const full = join(dir, name)
    let s
    try {
      s = statSync(full)
    } catch {
      continue
    }
    if (s.isDirectory()) {
      if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue
      walk(full, out)
    } else if (s.isFile()) {
      if (full.endsWith(".ts") || full.endsWith(".tsx")) {
        out.push(full)
      }
    }
  }
  return out
}

function isRouteFile(file: string): boolean {
  const rel = relative(ROOT, file).split(sep).join("/")
  if (!rel.startsWith("app/")) return false
  // Any route.ts or route.tsx under app/, OR any .ts/.tsx under app/api/
  if (/\/route\.tsx?$/.test(rel)) return true
  if (rel.startsWith("app/api/")) return true
  return false
}

function importsRepoLayer(source: string): boolean {
  return /from\s+["'](?:@\/)?lib\/repos\//.test(source)
}

// A file is "decrypt-aware" if it imports lib/crypto's decrypt* helpers OR
// imports from lib/repos/. Both indicate the author understood the encrypted
// column boundary. This is the heuristic that lets legitimate routes that
// read `*_enc` and decrypt inline pass the check.
function isDecryptAware(source: string): boolean {
  if (importsRepoLayer(source)) return true
  // Imports from @/lib/crypto that pull in any decrypt* symbol.
  const cryptoImports = source.match(
    /import\s*\{([^}]+)\}\s*from\s+["'](?:@\/)?lib\/crypto["']/g,
  )
  if (!cryptoImports) return false
  for (const block of cryptoImports) {
    if (/\bdecrypt(?:For(?:User|Row|System)|JSONFor(?:User|Row|System)|Any|)\b/.test(block)) {
      return true
    }
  }
  return false
}

function findLineNumber(source: string, matchIndex: number): number {
  let line = 1
  for (let i = 0; i < matchIndex && i < source.length; i++) {
    if (source[i] === "\n") line++
  }
  return line
}

function scanFile(file: string): Finding[] {
  const findings: Finding[] = []
  let source: string
  try {
    source = readFileSync(file, "utf8")
  } catch {
    return findings
  }
  const rel = relative(ROOT, file).split(sep).join("/")
  const routesThroughRepo = isDecryptAware(source)

  // Heuristic 1: .select("*") in a route file without repo-layer import.
  if (!routesThroughRepo) {
    const re = /\.select\(\s*["']\*["']\s*\)/g
    let m: RegExpExecArray | null
    while ((m = re.exec(source)) !== null) {
      findings.push({
        file: rel,
        line: findLineNumber(source, m.index),
        pattern: `.select("*")`,
        suggestion:
          "Route through lib/repos/<table>.ts which decrypts the *_enc columns. " +
          'Or replace with an explicit column list that excludes "*_enc" entries.',
      })
    }
  }

  // Heuristic 2 + 3: direct .from("<table>")... read of an encrypted column,
  // in a file that does not go through the repo layer.
  if (!routesThroughRepo) {
    // Collect every .from("<table>") in the file with their offsets so we can
    // attribute encrypted-column mentions to the nearest preceding .from().
    const fromRe = /\.from\(\s*["']([A-Za-z0-9_]+)["']\s*\)/g
    const froms: Array<{ table: string; index: number }> = []
    let fm: RegExpExecArray | null
    while ((fm = fromRe.exec(source)) !== null) {
      froms.push({ table: fm[1], index: fm.index })
    }
    if (froms.length > 0) {
      // Only flag a column name that appears as the FIRST string-literal arg
      // of a Supabase query builder method (.select / .eq / .in / .not /
      // .is / .like / .ilike / .order / .gte / .lte / .gt / .lt / .neq /
      // .filter / .or). Inside .select() the column can appear in a
      // comma-separated list. Matches outside these positions (e.g. local
      // variables named `body`) are ignored.
      const SUPABASE_METHODS =
        "select|eq|in|not|is|like|ilike|order|gte|lte|gt|lt|neq|filter|or|match|update|insert"
      const callRe = new RegExp(
        `\\.(${SUPABASE_METHODS})\\(\\s*["']([^"']+)["']`,
        "g",
      )
      let call: RegExpExecArray | null
      while ((call = callRe.exec(source)) !== null) {
        const firstArg = call[2]
        // Split on comma to handle .select("a, b, c") and check each token.
        const tokens = firstArg.split(",").map((t) => t.trim())
        for (const token of tokens) {
          // Strip "table:" / "table!fk(" prefixes for nested selects; keep
          // the bare identifier.
          const bare = token.replace(/^[A-Za-z0-9_]+\!?[A-Za-z0-9_]*\(.*$/, "").trim()
          if (!bare) continue
          // Skip if it ends with _enc (the encrypted column itself — fine).
          if (/_enc$/.test(bare)) continue
          // Find which .from("table") this call follows.
          let nearest: { table: string; index: number } | null = null
          for (const f of froms) {
            if (f.index < call.index && (!nearest || f.index > nearest.index)) {
              nearest = f
            }
          }
          if (!nearest) continue
          const colSpec = `${nearest.table}.${bare}`
          if (!ENCRYPTED_COLUMNS.includes(colSpec)) continue
          findings.push({
            file: rel,
            line: findLineNumber(source, call.index),
            pattern: `direct read of encrypted column ${colSpec}`,
            suggestion: `Route through lib/repos/${nearest.table}.ts — the plaintext column was dropped at cutover; reads must go through the decrypt path.`,
          })
        }
      }
    }
  }

  return findings
}

function main(): void {
  const allFiles = walk(APP_DIR)
  const routeFiles = allFiles.filter(isRouteFile)
  const findings: Finding[] = []
  for (const f of routeFiles) {
    findings.push(...scanFile(f))
  }

  if (findings.length === 0) {
    console.log(`check-plaintext-leaks: clean (${routeFiles.length} route files scanned)`)
    process.exit(0)
  }

  console.error(`check-plaintext-leaks: ${findings.length} finding(s)\n`)
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line} — ${f.pattern}`)
    console.error(`    suggestion: ${f.suggestion}`)
  }
  console.error(
    "\nIf a finding is a confirmed false positive (e.g., reads a non-encrypted column that happens to share a name), refactor the query to use an explicit column list, or move the read into lib/repos/.",
  )
  process.exit(1)
}

main()
