# Activating the AI spend daily kill-switch

The kill-switch is already wired (`lib/ai-spend-guard.ts` +
`lib/anthropic.ts`) but is **inert** until the env var is set. This is a
deliberate opt-in so we can verify behavior once per environment before it
can throttle paying users.

## What it does

Every `anthropic.messages.create` call — meaning every scan, rewrite, cron AI
task, and admin AI tool — routes through `assertAiSpendAllowed()` first. That
helper sums `api_usage.estimated_cost_cents` for the current UTC day across
the whole platform. If the sum meets or exceeds `AI_SPEND_DAILY_CAP_CENTS`,
it throws `AiSpendCapError` and the Anthropic call short-circuits. On a
Supabase lookup error it fails open — the per-user rate limits are the
backstop.

- **Scope:** platform-wide for the rolling UTC day
- **Granularity:** per-call (checked before each Anthropic request)
- **Opt-in:** disabled unless the env var is present and numeric and > 0
- **Reset:** at UTC midnight (no manual reset needed)

## Recommended cap values

| Mode | Cap (cents) | Cap (USD) | Why |
| --- | --- | --- | --- |
| Beta, quiet week | 5000 | $50 | First-line guard; covers ~100 Sonnet rewrites or ~1000 Haiku scans at current pricing |
| Beta, active week | 10000 | $100 | Room for organic growth; still a hard stop if something runs away |
| Launched | 25000 | $250 | Normal production headroom |
| Lock-down (incident) | 500 | $5 | Manual rollback — lets you keep the site technically up while AI is off |

Start at **$50/day**. You can raise it from the Vercel dashboard at any time;
no redeploy needed because the value is read at request time via
`process.env`.

## Activation steps (Vercel)

1. Vercel dashboard → **regencompliance** project → **Settings → Environment
   Variables**.
2. **Add** a new variable:
   - Name: `AI_SPEND_DAILY_CAP_CENTS`
   - Value: `5000` (for $50/day to start)
   - Environments: **Production** + **Preview** (leave Dev up to you)
   - Type: **Sensitive** (because the value is effectively a throttle policy
     and we default every non-public var to Sensitive)
3. Hit **Save**.
4. No redeploy needed — the next Anthropic call will pick it up.
5. Confirm activation by running any free-tier demo scan and watching Vercel
   logs for either a normal scan completion (guard passed) or an
   `AiSpendCapError` log line (cap reached on day one, which would imply a
   too-low value).

## Verifying end-to-end (after activation)

One way to sanity-check without racking up cost:

1. Set `AI_SPEND_DAILY_CAP_CENTS` to `1` (one cent) for ~60 seconds in the
   **Preview** environment only.
2. Trigger a scan from a preview deployment.
3. Expected: the scan endpoint returns the `AiSpendCapError` message
   ("Daily AI spend cap reached: $... of $0.01. Scanning will resume
   tomorrow.").
4. Revert the value back to your real cap (e.g. `5000`) and confirm scans
   work again.

Only run this against Preview, never Production. Setting the cap to `1` on
Production would block every real user for the rest of the UTC day until
reverted.

## Tuning over time

- Check `api_usage` nightly for a week and watch the max daily spend.
- Set the cap to **2×** the observed peak so legitimate bursts never trip it.
- Reassess monthly as scan volume grows.

## If the cap trips in production

1. Check `api_usage` in Supabase: `SELECT date_trunc('day', created_at),
   SUM(estimated_cost_cents) FROM api_usage WHERE created_at > now() -
   interval '2 days' GROUP BY 1 ORDER BY 1 DESC;`
2. If the spend is legitimate, raise the cap in Vercel.
3. If the spend is runaway (unusually high per-user, or concentrated in a
   single account), lower the cap even further, find the abuser in
   `api_usage` by `user_id`, and suspend that user before raising the cap
   back.
4. The cap resets at UTC midnight regardless.
