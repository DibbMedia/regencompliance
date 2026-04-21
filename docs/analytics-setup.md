# Analytics setup

Funnel instrumentation for RegenCompliance. Two paths, pick one.

## Path A — Vercel Web Analytics (zero code, free, recommended to start)

1. Vercel dashboard → **regencompliance** project → **Analytics** tab.
2. Click **Enable Web Analytics**. Free tier: page views, top pages, referrers, device breakdown. No configuration required.
3. Optional: also enable **Speed Insights** in the same section — tracks real-user Core Web Vitals (LCP, INP, CLS) and flags regressions. Also free on Hobby/Pro tier.

What this gives you for free:
- Page view counts and top-page ranking (daily, weekly, monthly).
- Geographic breakdown of visitors.
- Referrer / source tracking (organic search vs direct vs social).
- Device / browser breakdown.
- Core Web Vitals percentiles (if Speed Insights is on).

What it does NOT give you:
- Custom event tracking (sign-up clicks, scan starts, checkout funnel).
- User-level attribution.
- Retention cohorts.

If the above is enough, **stop here**. If you want custom events, do Path B.

## Path B — Custom event tracking (needs one npm dep)

**Adds `@vercel/analytics` to package.json.** Next deploy will `npm install`; no local Node required on your machine.

### Install step (one-time)

Add to `package.json` dependencies:

```json
"@vercel/analytics": "^1.3.1"
```

Run `npm install` locally if you have Node, or let Vercel's deploy regenerate the lockfile (may trigger one extra preview cycle).

### Wire step (app/layout.tsx)

```tsx
import { Analytics } from "@vercel/analytics/react"

// inside <body>:
<Analytics />
```

### Event-tracking helper (lib/analytics.ts)

```ts
"use client"
import { track } from "@vercel/analytics/react"

export function trackEvent(name: string, props?: Record<string, string | number | boolean | null>) {
  try {
    track(name, props)
  } catch {
    // Analytics never fails loud
  }
}
```

### Priority events to add first

Hit these in order of business value:

| Event | Where | Props |
| --- | --- | --- |
| `signup_clicked` | `components/checkout-button.tsx` or wherever /login → signup tab is | `{ source: "landing" \| "pricing" \| ... }` |
| `demo_scan_submitted` | `app/demo/page.tsx` handleScan | `{ content_type, flag_count, score }` (after response) |
| `demo_rewrite_clicked` | `app/demo/page.tsx` handleRewrite | `{ scan_id }` |
| `checkout_started` | `components/checkout-button.tsx` handleClick | `{ source }` |
| `first_scan_completed` | `app/dashboard/scanner/page.tsx` handleScan (only on scanscount=1) | `{ mode, score }` |
| `first_rewrite_completed` | scanner handleRewrite | `{ scan_id }` |
| `sample_scan_clicked` | dashboard empty-state cards | `{ sample: "stem-cell" \| "med-spa" \| "weight-loss" }` |
| `waitlist_submitted` | `app/waitlist/page.tsx` | `{}` |

### Funnel definitions (Vercel Analytics → Custom Events)

- **Top funnel**: `/demo view` → `demo_scan_submitted` → `demo_rewrite_clicked` → `/pricing view` → `checkout_started`
- **Bottom funnel**: `checkout_started` → `/dashboard view` (after Stripe redirect) → `first_scan_completed` → `first_rewrite_completed`
- **Organic funnel**: `/blog/*` view → `/ view` → `demo_scan_submitted`

## Path C — PostHog (if you outgrow Vercel Analytics)

Vercel Analytics hits a ceiling around 250K events/mo on paid tier. Also no cohort retention, no funnel visualization beyond basics, no session recording. PostHog self-hosted or cloud runs ~$0.00031/event, has full product-analytics features, and integrates with Next 16 via `@posthog/next`.

Not recommended for the first 3-6 months of beta — the event volume won&rsquo;t justify the setup time.
