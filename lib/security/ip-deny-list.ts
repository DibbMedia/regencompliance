/**
 * Persistent IP deny list. Populated by the bot-defense middleware on
 * attacker-probe-path / injection-pattern verdicts. Lookup is in-memory-
 * cached (60s TTL) to bound Edge DB latency.
 *
 * Cache strategy:
 *   - Module-level Map<ip, expiresAt> populated on first miss + refreshed
 *     every 60 seconds via a fetch of the full deny list (typically small —
 *     a few hundred rows max during active abuse).
 *   - "Deny" cache hits are instant.
 *   - "Allow" cache misses fall through to DB read on first hit, then
 *     cache the result for 60s.
 *
 * Cold-start vs background refresh:
 *   - On the very first call after a cold start (cacheLoadedAt === 0), we
 *     AWAIT the cache load so the first request from a banned IP can't
 *     slip through.
 *   - On every subsequent stale-cache event, we fire the refresh in the
 *     background and let the current request read the (60-120s) stale
 *     cache. This bounds tail latency at the cost of up to 60s of staleness
 *     on the "deny -> allow" transition, which is acceptable for a 24h
 *     deny window (one wave of requests at most).
 *   - The cacheLoadPromise gate dedupes concurrent refreshes during the
 *     race window where N requests arrive between cache going stale and
 *     the refresh completing.
 *
 * Edge-runtime safety: no node:* imports. Uses the same createServiceClient
 * used by the rest of the middleware (Supabase REST under the hood).
 */
import { createServiceClient } from "@/lib/supabase/server"

export const IP_DENY_TTL_HOURS = 24
const CACHE_REFRESH_MS = 60_000

let cache: Map<string, number> = new Map() // ip -> expiresAt (ms)
let cacheLoadedAt = 0
let cacheLoadPromise: Promise<void> | null = null

async function refreshCache(): Promise<void> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("ip_deny_list")
    .select("ip, expires_at")
    .gt("expires_at", new Date().toISOString())
  if (!data) return
  const next = new Map<string, number>()
  for (const row of data as Array<{ ip: string; expires_at: string }>) {
    next.set(row.ip, new Date(row.expires_at).getTime())
  }
  cache = next
  cacheLoadedAt = Date.now()
}

export async function isIpDenied(ip: string): Promise<boolean> {
  if (!ip || ip === "unknown") return false
  // Refresh cache if stale OR never loaded
  if (Date.now() - cacheLoadedAt > CACHE_REFRESH_MS) {
    if (!cacheLoadPromise) {
      cacheLoadPromise = refreshCache().finally(() => {
        cacheLoadPromise = null
      })
    }
    // DECISION: await on cold start (cacheLoadedAt === 0), background
    // otherwise. Cold-start await prevents a banned IP from slipping
    // through during the warm-up window; background refresh keeps the
    // steady-state latency low at the cost of up to 60s of staleness.
    if (cacheLoadedAt === 0) {
      await cacheLoadPromise
    }
  }
  const expiresAt = cache.get(ip)
  if (!expiresAt) return false
  if (expiresAt < Date.now()) {
    cache.delete(ip)
    return false
  }
  return true
}

export async function denyIp(ip: string, reason: string, signature: string): Promise<void> {
  if (!ip || ip === "unknown") return
  const expiresAt = new Date(Date.now() + IP_DENY_TTL_HOURS * 3600_000).toISOString()
  // Add to cache immediately so subsequent requests from this IP hit
  // the local cache; don't wait for DB write.
  cache.set(ip, new Date(expiresAt).getTime())

  const supabase = createServiceClient()
  // UPSERT pattern: increment hit_count, refresh last_hit_at + expires_at.
  // If already denied, this extends the ban (good — repeat offender).
  //
  // Note: upsert doesn't atomically increment hit_count on conflict; on a
  // repeat-offender match the hit_count is overwritten back to 1. For v1
  // that's fine - the row's mere existence is what gates the deny. A
  // separate RPC (e.g. `increment_ip_deny_hit_count`) could do an atomic
  // bump if we want accurate hit_count for forensics.
  await supabase.from("ip_deny_list").upsert(
    {
      ip,
      reason,
      signature: signature.slice(0, 500),
      hit_count: 1,
      last_hit_at: new Date().toISOString(),
      expires_at: expiresAt,
    },
    { onConflict: "ip", ignoreDuplicates: false },
  )
}

// Test-only helper:
export function _resetCacheForTests(): void {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("_resetCacheForTests may only be called in tests")
  }
  cache = new Map()
  cacheLoadedAt = 0
  cacheLoadPromise = null
}
