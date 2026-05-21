# Vercel Firewall - operator setup

Step-by-step recipes for configuring Vercel's built-in Firewall on the
RegenCompliance project. This doc is paste-ready for the operator. No code
changes required - everything here is dashboard-driven.

The rules below complement (do NOT duplicate) the application-level bot
classifier at `lib/security/bot-defense.ts`. Read the cross-reference section
at the bottom before disabling either layer.

## Why two layers (Firewall + code-level bot-defense)

The code-side classifier (`lib/security/bot-defense.ts`) runs inside Edge
middleware. It pays a few ms per request, ships through the build deploy
cycle, and matches on User-Agent strings, path patterns, and injection
signatures. It is excellent for the long tail of UA + path + payload
fingerprinting but it cannot dodge the cost: every blocked request still hits
Vercel's edge runtime and burns the per-invocation budget.

Vercel Firewall sits one layer earlier - in the network layer, BEFORE the
Edge function runs. Rules update instantly via the dashboard (no deploy
needed), and a blocked request is dropped before it costs any compute. The
trade-off is that Firewall rules only see network-level signals: source IP,
source ASN, source country, request path, request method, a small set of
headers. They cannot inspect request bodies or do regex against complex UA
substrings the way the code classifier does.

Combined posture:

- **Vercel Firewall** (this doc) handles cheap, broad blocks at the network
  edge - ASN-based denials, geo-blocks, rate limits, simple header checks.
- **`lib/security/bot-defense.ts`** handles surgical, signature-driven
  decisions - AI-crawler allowlist, scanner UA denylist, scraper UA denylist,
  injection-pattern detection, missing-UA-on-POST gate.

The two layers should never be one-or-the-other. If you disable Firewall to
"simplify," you lose cheap pre-edge filtering and the cost of an attack
spikes. If you disable the code classifier, you lose UA + injection coverage
that no Firewall rule can replicate cleanly.

## How to access

1. Sign in to the Vercel dashboard at `https://vercel.com`.
2. Choose the team that owns the RegenCompliance project (Dibb Media).
3. Open the RegenCompliance project.
4. Click the **Firewall** tab in the project navigation.

Direct URL pattern: `https://vercel.com/<team>/<project>/firewall`.

Vercel Pro includes free firewall rules. Vercel Enterprise includes the full
managed WAF with additional rule templates. The recipes below assume Pro at
minimum; Enterprise users will see richer condition options in the UI but the
rule semantics remain the same.

> **Footnote on syntax:** Vercel Firewall uses a dashboard rule builder
> rather than a paste-in DSL. The pseudo-code examples below describe the
> rule shape in JSON-ish form for clarity; the operator should map each
> field to the corresponding dropdown / value in the Vercel UI. As of the
> 2026-05-20 dashboard layout, the relevant fields are: Condition Type,
> Operator, Value, Action. Where a rule needs multiple conditions, use the
> "AND" combinator unless otherwise noted.

## Recommended rule set

The table below summarizes every rule in the recommended baseline. Each rule
has a detailed recipe in the section after the table.

| #  | Name                          | Trigger                                     | Action          | Rationale                                                    |
|----|-------------------------------|---------------------------------------------|-----------------|--------------------------------------------------------------|
| a1 | Block hosting ASNs on /api    | Source ASN in deny list AND path matches    | Deny            | Cost-amplifying API routes; legit B2B traffic is not VPS     |
| b1 | Geo-block high-abuse regions  | Source country in deny list AND /api/*      | Challenge/Deny  | Customer footprint is US/CA/UK/AU/EU only                    |
| c1 | Rate-limit /api/free-audit    | 5 req / 60s / IP on /api/free-audit         | Deny            | Network-edge backstop to app-level rate limit                |
| c2 | Rate-limit /api/scan-url      | 10 req / 60s / IP on /api/scan-url          | Deny            | Network-edge backstop to app-level rate limit                |
| d1 | Empty Referer on free-audit   | POST /api/free-audit AND Referer is empty   | Deny            | Lead-magnet form should always carry a Referer               |
| e1 | Allow Vercel cron carve-out   | UA matches vercel-cron/1.0                  | Allow           | Cron jobs must not be caught by ASN/geo blocks               |
| f1 | Allow Stripe webhook carve    | Source IP in Stripe published list          | Allow           | Stripe deliveries must always succeed                        |
| g1 | No Anthropic inbound rule     | n/a - documented for completeness           | n/a             | We CALL Anthropic; no inbound traffic from them              |

### Rule a1 - Block known-malicious ASNs on cost-amplifying API routes

**Why:** Roughly 90% of automated abuse against B2B SaaS APIs originates from
a small set of hosting providers (VPS / dedicated server vendors). Legitimate
RegenCompliance customers visit from residential ISPs (Comcast, Spectrum,
ATT, etc.) or corporate ranges (clinic office networks). A request landing
on `/api/scan-url` from DigitalOcean is almost never a clinic owner running
a scan from their datacenter; it is almost always automation.

**ASNs to deny** (this is the conservative shortlist; expand if abuse data
warrants it):

- AS14061 - DigitalOcean
- AS16276 - OVH
- AS24940 - Hetzner
- AS63949 - Linode / Akamai
- AS20473 - Vultr

**Paths to apply to** (cost-amplifying routes; LLM or scan workload):

- `/api/scan*` (covers `/api/scan-url`, `/api/scan`, future variants)
- `/api/free-audit`
- `/api/waitlist`
- `/api/beta-apply`

**Paths to leave alone** (must NOT be blocked):

- `/api/health` - uptime monitors
- `/api/stripe/webhook` - Stripe delivery infra (see rule f1)
- `/api/cron/*` - internal cron paths (see rule e1)

**Action:** Deny (return 403).

**Pseudo-rule:**

```json
{
  "name": "Block hosting ASNs on cost-amplifying API routes",
  "if": {
    "all": [
      { "source_asn": ["14061", "16276", "24940", "63949", "20473"] },
      { "path_matches_any": ["/api/scan*", "/api/free-audit", "/api/waitlist", "/api/beta-apply"] }
    ]
  },
  "then": { "action": "deny" }
}
```

**Operator note:** in the Vercel UI, ASN is a first-class condition. Choose
"Source ASN" -> "is one of" -> paste the comma-separated ASN numbers.

### Rule b1 - Geo-block requests from high-abuse regions (opt-in)

**Why:** Customer geography for RegenCompliance is US, CA, UK, AU, and
Western Europe. Inbound API traffic from regions with no expected customer
footprint and a high density of abusive ASNs is almost certainly automation.
However: this rule must be enabled deliberately. A false positive here
silently locks out a legitimate prospect, which is more damaging than a
missed bot.

**Sample country list** (high-abuse density per Cloudflare Radar / Verizon
DBIR; conservative shortlist):

- CN - China
- RU - Russia
- KP - North Korea
- IR - Iran
- BY - Belarus

**Paths to apply to:** All `/api/*` paths.

**Action:** Challenge (if the UI exposes "Challenge" - this sends an
interstitial CAPTCHA before allowing the request through). If Challenge is
not available, fall back to Deny. Challenge is preferred because it is
recoverable if the operator turns out to have an unexpected customer in the
blocked region.

**Pseudo-rule:**

```json
{
  "name": "Geo-block high-abuse regions on /api/*",
  "if": {
    "all": [
      { "source_country": ["CN", "RU", "KP", "IR", "BY"] },
      { "path_matches": "/api/*" }
    ]
  },
  "then": { "action": "challenge" }
}
```

> **Operator decision required:** Confirm there are zero legitimate
> customers in CN / RU / KP / IR / BY before enabling. If the founder beta
> includes a clinic owner in any of these regions, remove that country from
> the list. This rule is opt-in for a reason.

### Rule c1 - Rate-limit /api/free-audit per source IP

**Why:** Lead-magnet endpoints are a classic target for credential-stuffing,
email-enumeration, and resource-exhaustion attacks. The application already
enforces 50/hour global + 3/hour per IP + 5/day per host (see
`app/api/free-audit/route.ts`). A network-edge rate limit is cheaper because
it drops requests before they reach the Edge function.

**Threshold:** 5 requests per 60 seconds per source IP.

**Path:** `/api/free-audit`.

**Action:** Deny.

**Pseudo-rule:**

```json
{
  "name": "Rate-limit /api/free-audit per IP",
  "if": {
    "all": [
      { "path_matches": "/api/free-audit" },
      { "rate": { "requests": 5, "window_seconds": 60, "key": "source_ip" } }
    ]
  },
  "then": { "action": "deny" }
}
```

### Rule c2 - Rate-limit /api/scan-url per source IP

**Why:** `/api/scan-url` triggers an LLM call against Anthropic, which is the
single most expensive operation per request in the app. The application-level
rate limit guards against ordinary abuse; the network-edge limit is a
catastrophic-cost circuit-breaker.

**Threshold:** 10 requests per 60 seconds per source IP.

**Path:** `/api/scan-url`.

**Action:** Deny.

**Pseudo-rule:**

```json
{
  "name": "Rate-limit /api/scan-url per IP",
  "if": {
    "all": [
      { "path_matches": "/api/scan-url" },
      { "rate": { "requests": 10, "window_seconds": 60, "key": "source_ip" } }
    ]
  },
  "then": { "action": "deny" }
}
```

### Rule d1 - Block empty-Referer requests on /api/free-audit POST

**Why:** Legitimate browser submissions of the free-audit form carry a
Referer header naming the origin page (`https://regencompliance.ai/free-audit`).
Automated scrapers and curl-based scripts almost never set Referer correctly.
The false-positive risk is users who strip Referer via privacy extensions
(Brave shields, uBlock advanced, Firefox referer-trim).

Acceptable for `/api/free-audit` specifically - it is a lead-magnet form,
not a critical revenue path. A privacy-conscious user who fails this check
can still apply via `/apply` (which does NOT have this rule).

**Condition:** Method is POST AND Path is `/api/free-audit` AND Referer
header is empty or missing.

**Action:** Deny.

**Pseudo-rule:**

```json
{
  "name": "Block empty Referer on free-audit POST",
  "if": {
    "all": [
      { "method": "POST" },
      { "path_matches": "/api/free-audit" },
      { "header": { "name": "Referer", "is_empty": true } }
    ]
  },
  "then": { "action": "deny" }
}
```

> **Operator decision required:** Before enabling, run rule d1 in Log-Only
> mode for 48 hours and check how many real free-audit submissions would be
> caught. If the false-positive rate exceeds ~2%, keep it off.

### Rule e1 - Allow Vercel cron job carve-out

**Why:** RegenCompliance runs at least two scheduled jobs from Vercel cron
infrastructure: the weekly compliance KB updater (Sunday 1am CDT) and the
site-monitor cron. These run from Vercel's internal infra and present the
UA `vercel-cron/1.0`. They must NOT be caught by ASN or geo blocks, even
when those rules expand to cover more paths.

**Condition:** UA matches `vercel-cron/1.0` (case-sensitive substring is
fine; the UA is stable).

**Action:** Allow (this is an explicit ALLOW rule that should be ordered
BEFORE the deny rules - in Vercel Firewall, rule order matters; the first
matching rule wins).

**Pseudo-rule:**

```json
{
  "name": "Allow Vercel cron carve-out",
  "priority": "first",
  "if": {
    "header": { "name": "User-Agent", "contains": "vercel-cron/1.0" }
  },
  "then": { "action": "allow" }
}
```

**Alternative carve-out method:** If Vercel publishes a documented set of
internal cron-source IP ranges (check the Vercel docs at deploy time), use
those instead of the UA string. UA can be spoofed; an IP-range carve-out is
sturdier. As of 2026-05-20, the UA-based check is the documented approach.

### Rule f1 - Allow Stripe webhook IPs

**Why:** Stripe webhook deliveries must always succeed - missing a webhook
silently desyncs subscription state and breaks the billing flow. Stripe
publishes a static IP list at `https://stripe.com/files/ips/ips_webhooks.json`.
Allow those IPs unconditionally on `/api/stripe/webhook` so geographic or
ASN blocks never apply to webhook traffic.

**Setup:**

1. Fetch the IP list from `https://stripe.com/files/ips/ips_webhooks.json`.
2. Copy the `WEBHOOKS` array (CIDR list).
3. Paste into a new Vercel Firewall ALLOW rule with priority ordered BEFORE
   the deny rules.
4. Add a calendar reminder to refresh the list quarterly - Stripe rotates
   ranges occasionally.

**Pseudo-rule:**

```json
{
  "name": "Allow Stripe webhook IPs",
  "priority": "first",
  "if": {
    "all": [
      { "source_ip_in_list": "stripe-webhook-ips" },
      { "path_matches": "/api/stripe/webhook" }
    ]
  },
  "then": { "action": "allow" }
}
```

### Rule g1 - No Anthropic inbound rule needed

**Documented for completeness.** RegenCompliance CALLS the Anthropic API
(outbound) for LLM inference. We do NOT receive callbacks or webhooks from
Anthropic. There is no inbound Firewall rule for Anthropic. If a future
feature adds Anthropic-initiated webhooks (none currently planned), add an
ALLOW rule scoped to their published egress IPs.

## Recommended deploy order

The rules above should be deployed in three phases. Each phase has a 48-hour
Log-Only soak before flipping to enforcing mode.

### Phase 1 - Safest, broadest impact

Enable these first. They are the highest-value, lowest-risk rules.

1. Rule a1 - ASN block on cost-amplifying routes.
2. Rule c1 - Rate-limit on `/api/free-audit`.
3. Rule c2 - Rate-limit on `/api/scan-url`.
4. Rule e1 - Vercel cron carve-out (allow).
5. Rule f1 - Stripe webhook carve-out (allow).

**Soak in Log-Only mode for 48 hours.** During the soak, check the Firewall
logs daily. If any legitimate customer activity gets logged as a hit,
investigate before enforcing.

### Phase 2 - Opt-in geo-block

After Phase 1 has been enforcing for at least 7 days with no customer
complaints:

1. Rule b1 - Geo-block high-abuse regions.

**Soak in Log-Only mode for 48 hours.** Verify the country list against the
beta-customer table:

```sql
-- Run in Supabase SQL editor
select distinct
  coalesce(billing_country, signup_country) as country,
  count(*) as count
from profiles
where status = 'active'
group by 1
order by 2 desc;
```

If any active customer country appears in the deny list, remove that country
before enforcing.

### Phase 3 - Referer check (last)

Enable last because it has the highest false-positive risk:

1. Rule d1 - Empty Referer block on `/api/free-audit` POST.

**Soak in Log-Only mode for 48 hours.** Spot-check the logs for legitimate
form submissions that would be denied. If false positives exceed ~2%, leave
it off and revisit later.

## Preview / Log-Only mode

Vercel Firewall provides a "Log Only" mode (sometimes shown as "Preview
mode" in the UI). When a rule is set to Log Only:

- The condition is evaluated on every matching request.
- Hits are recorded in the Firewall log with the rule name + matched fields.
- The action (deny / challenge / allow) is NOT executed - the request
  proceeds as if the rule were disabled.

**Always run a new rule in Log-Only mode for 48 hours before enforcing.**
This catches false positives against real customer traffic without blocking
anyone.

How to enable Log-Only on a specific rule:

1. Open the rule in the Firewall tab.
2. Look for a "Log Only" or "Preview" toggle (top-right of the rule editor
   panel as of 2026-05-20).
3. Save.

To promote a rule from Log-Only to Enforcing:

1. Open the rule.
2. Toggle Log-Only OFF.
3. Save.

Changes apply within seconds - no deploy needed.

## Rollback procedure

Every Firewall rule has a per-rule "Enabled" toggle in the dashboard.
Disabling a rule applies within seconds. No code change, no redeploy.

**To disable a single rule:**

1. Open the rule in the Firewall tab.
2. Toggle "Enabled" OFF.
3. Save.

**To disable ALL Firewall rules (panic switch):**

1. Open the Firewall tab.
2. There is a global "Disable Firewall" toggle at the top of the page.
3. Toggle OFF.

Disabling the global Firewall leaves the application-level bot classifier
(`lib/security/bot-defense.ts`) in place - the app is not unprotected, just
operating without the network-layer filter. Use the global toggle ONLY if a
Firewall rule is actively breaking production traffic and you need an
immediate kill-switch while you investigate.

**SOC 2 note:** Any Firewall rule change (enable, disable, modify) is a
configuration change in the security control plane and must be logged in the
change-management record. See the cross-references section below.

## Cross-references

### Application-level bot classifier

The code-side classifier lives at `lib/security/bot-defense.ts` and is wired
into `proxy.ts` (Edge middleware). It handles:

- AI crawler allowlist (GPTBot, ClaudeBot, Perplexity, Googlebot, Bingbot,
  etc.) - unconditional allow.
- Vulnerability scanner UA denylist (nikto, sqlmap, nuclei, burpsuite, etc.)
  - hard deny.
- Bad scraper UA denylist (Bytespider, Diffbot, MJ12bot, AhrefsBot,
  SemrushBot, CCBot, etc.) - hard deny.
- Attacker probe paths (`/wp-admin`, `/.env`, `/.git`, `/phpmyadmin`, etc.)
  - hard deny.
- Injection pattern detection (SQLi, XSS, Log4Shell, path traversal, null
  byte, etc.) - hard deny.
- Missing UA on POST / PUT / PATCH / DELETE - hard deny.
- Unknown bot UA heuristic - rate-limit-strict, not deny.

The Firewall rules in this doc do NOT duplicate any of those checks. The
Firewall filters on IP / ASN / Country / simple header presence; the
classifier filters on UA strings + path patterns + URL injection signatures.
Both layers run for every request, in that order: Firewall first, classifier
second.

### Change management

Adding, modifying, or removing a Firewall rule is a change in the security
control plane and is in scope for the change-management process documented
at `docs/security/change-management.md`. The minimum log entry should
include:

- Date / time of change.
- Operator who made the change.
- Rule name + before / after configuration.
- Reason for the change.

For SOC 2 audit purposes, retain Firewall change records for at least 12
months. Vercel exposes a Firewall audit log in the dashboard - export
quarterly to long-term storage.

### Other related docs

- `docs/security/owasp-top-10.md` - the OWASP mapping table cross-references
  this doc under A05 (Security Misconfiguration) and A09 (Logging Failures).
- `docs/security/incident-response.md` - the IR playbook references the
  Firewall global-disable toggle as a Sev-2 mitigation step.
- `docs/security/threat-model.md` - the threat model assumes a layered
  defense; if either layer is materially weakened, refresh the model.

## Review cadence

| Item                                   | Cadence                              |
|----------------------------------------|--------------------------------------|
| Full rule-set review                   | Quarterly                            |
| Stripe webhook IP list refresh         | Quarterly                            |
| ASN deny list refresh                  | Quarterly (against threat intel)     |
| Country deny list refresh              | Annually + on geo-expansion          |
| Rate-limit threshold tuning            | After every Sev-2 abuse incident     |
| SOC 2 audit-log export                 | Quarterly                            |
