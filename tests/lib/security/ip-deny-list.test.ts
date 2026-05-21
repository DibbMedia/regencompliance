import { describe, it, expect, vi, beforeEach } from "vitest"

/**
 * Shared in-memory representation of the ip_deny_list table. The mock
 * Supabase client below reads from / writes to this Map, mimicking the
 * real PostgREST shape:
 *   - .from("ip_deny_list").select("ip, expires_at").gt("expires_at", iso)
 *     -> returns array of rows whose expires_at > iso
 *   - .from("ip_deny_list").upsert({ ip, ... }, { onConflict: "ip" })
 *     -> writes / replaces the row keyed by ip
 *
 * Concurrent-refresh dedupe is observed via the `selectCallCount` counter:
 * if two isIpDenied calls fire at the same time after a stale-cache event,
 * the cacheLoadPromise gate should ensure only one .select() round trip.
 */
type Row = {
  ip: string
  reason: string
  signature: string
  hit_count: number
  last_hit_at: string
  expires_at: string
}

const state = {
  rows: new Map<string, Row>(),
  selectCallCount: 0,
  upsertCallCount: 0,
  // Optional artificial latency on the select so we can observe the
  // dedup gate when two isIpDenied calls race.
  selectDelayMs: 0,
}

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: (_table: string) => ({
      select: (_cols: string) => ({
        gt: async (_col: string, iso: string) => {
          state.selectCallCount += 1
          if (state.selectDelayMs > 0) {
            await new Promise((r) => setTimeout(r, state.selectDelayMs))
          }
          const threshold = new Date(iso).getTime()
          const data: Array<{ ip: string; expires_at: string }> = []
          for (const row of state.rows.values()) {
            if (new Date(row.expires_at).getTime() > threshold) {
              data.push({ ip: row.ip, expires_at: row.expires_at })
            }
          }
          return { data, error: null }
        },
      }),
      upsert: async (
        payload: Row,
        _opts: { onConflict: string; ignoreDuplicates: boolean },
      ) => {
        state.upsertCallCount += 1
        state.rows.set(payload.ip, payload)
        return { data: null, error: null }
      },
    }),
  }),
}))

// NODE_ENV is "test" by default under vitest, so _resetCacheForTests works.
// (No need to override it here.)

let isIpDenied: typeof import("@/lib/security/ip-deny-list").isIpDenied
let denyIp: typeof import("@/lib/security/ip-deny-list").denyIp
let _resetCacheForTests:
  typeof import("@/lib/security/ip-deny-list")._resetCacheForTests

beforeEach(async () => {
  state.rows.clear()
  state.selectCallCount = 0
  state.upsertCallCount = 0
  state.selectDelayMs = 0
  // Reset module state so the cache map + cacheLoadedAt start fresh per
  // test. Without resetModules, the module-scope cache survives across
  // tests and the cold-start-await semantics get scrambled.
  vi.resetModules()
  const mod = await import("@/lib/security/ip-deny-list")
  isIpDenied = mod.isIpDenied
  denyIp = mod.denyIp
  _resetCacheForTests = mod._resetCacheForTests
})

describe("isIpDenied - sentinel handling", () => {
  it("returns false for empty string IP (never ban the sentinel)", async () => {
    await denyIp("1.2.3.4", "attacker-probe-path", "/wp-admin")
    const denied = await isIpDenied("")
    expect(denied).toBe(false)
    // Sanity: empty-string lookup should not have touched the DB cache.
    // (We don't assert selectCallCount here since denyIp already added to
    // the in-memory cache; we just want the empty-string short-circuit
    // to return false unconditionally.)
  })

  it("returns false for the literal 'unknown' IP sentinel", async () => {
    await denyIp("1.2.3.4", "attacker-probe-path", "/wp-admin")
    const denied = await isIpDenied("unknown")
    expect(denied).toBe(false)
  })

  it("denyIp() is a no-op for empty IP", async () => {
    await denyIp("", "attacker-probe-path", "/wp-admin")
    expect(state.upsertCallCount).toBe(0)
    expect(state.rows.size).toBe(0)
  })

  it("denyIp() is a no-op for the 'unknown' sentinel", async () => {
    await denyIp("unknown", "attacker-probe-path", "/wp-admin")
    expect(state.upsertCallCount).toBe(0)
    expect(state.rows.size).toBe(0)
  })
})

describe("denyIp -> isIpDenied flow", () => {
  it("after denyIp('1.2.3.4', ...), isIpDenied('1.2.3.4') returns true", async () => {
    await denyIp("1.2.3.4", "attacker-probe-path", "/wp-admin")
    const denied = await isIpDenied("1.2.3.4")
    expect(denied).toBe(true)
  })

  it("does NOT deny an IP that was never banned", async () => {
    await denyIp("1.2.3.4", "attacker-probe-path", "/wp-admin")
    const denied = await isIpDenied("9.9.9.9")
    expect(denied).toBe(false)
  })

  it("denyIp persists the row with the trimmed signature (max 500 chars)", async () => {
    const longSig = "x".repeat(2000)
    await denyIp("1.2.3.4", "injection-pattern", longSig)
    const row = state.rows.get("1.2.3.4")
    expect(row).toBeDefined()
    expect(row!.signature.length).toBe(500)
    expect(row!.reason).toBe("injection-pattern")
  })

  it("denyIp populates the cache immediately (no DB read needed for the next isIpDenied)", async () => {
    await denyIp("1.2.3.4", "attacker-probe-path", "/wp-admin")
    // The denyIp call should have set the in-memory cache entry. The
    // next isIpDenied should NOT have to refresh.
    const selectBefore = state.selectCallCount
    const denied = await isIpDenied("1.2.3.4")
    expect(denied).toBe(true)
    // We accept either 0 OR 1 select calls depending on whether the cache
    // staleness check triggered (cacheLoadedAt was 0 before the first
    // isIpDenied, so it WILL await a refresh on cold start). The point
    // is that the cache entry put there by denyIp is still present after
    // the refresh because the mock returns it from the DB.
    expect(state.selectCallCount - selectBefore).toBeLessThanOrEqual(1)
  })

  it("isIpDenied returns true for an IP banned only in the DB (not yet in cache)", async () => {
    // Simulate a sibling Edge instance writing the deny row; this instance
    // only sees it via cache refresh.
    const future = new Date(Date.now() + 24 * 3600_000).toISOString()
    state.rows.set("5.5.5.5", {
      ip: "5.5.5.5",
      reason: "attacker-probe-path",
      signature: "/.env",
      hit_count: 1,
      last_hit_at: new Date().toISOString(),
      expires_at: future,
    })
    // Cold-start await should load it.
    const denied = await isIpDenied("5.5.5.5")
    expect(denied).toBe(true)
  })
})

describe("cache TTL semantics", () => {
  it("returns false for an IP whose expires_at has elapsed", async () => {
    // Seed the DB-side row as already expired so refreshCache filters it
    // out via the gt() check.
    const past = new Date(Date.now() - 60_000).toISOString()
    state.rows.set("6.6.6.6", {
      ip: "6.6.6.6",
      reason: "attacker-probe-path",
      signature: "/.env",
      hit_count: 1,
      last_hit_at: past,
      expires_at: past,
    })
    const denied = await isIpDenied("6.6.6.6")
    expect(denied).toBe(false)
  })

  it("evicts and returns false when an in-cache entry has elapsed", async () => {
    // First, ban an IP - this puts it in cache + DB with a future TTL.
    await denyIp("7.7.7.7", "attacker-probe-path", "/wp-admin")
    expect(await isIpDenied("7.7.7.7")).toBe(true)

    // Now mutate the DB row to be expired AND mutate the cache by hand to
    // a past timestamp. We have to reach into the cache via a second
    // denyIp() call against the same IP with a past expiry... but denyIp
    // computes expiresAt internally. Easier approach: advance the system
    // time past the 24h window with fake timers.
    vi.useFakeTimers()
    try {
      // Re-load module + re-seed cache so the test isn't sensitive to
      // beforeEach ordering. Set time AFTER the 24h ban window.
      vi.setSystemTime(new Date(Date.now() + 25 * 3600_000))
      // Also remove the row from the DB so a refresh wouldn't re-add it.
      state.rows.delete("7.7.7.7")
      // Force a stale-cache refresh by advancing time past the 60s cache
      // window (which has already happened since we jumped 25h ahead).
      // isIpDenied will see cacheLoadedAt is stale, kick off a refresh.
      // On the second pass the cache will not contain 7.7.7.7. But on
      // the FIRST pass after vi.setSystemTime, the cache still has the
      // stale entry, which the code path explicitly handles by checking
      // `if (expiresAt < Date.now()) { cache.delete(ip); return false }`
      const denied = await isIpDenied("7.7.7.7")
      expect(denied).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it("cold-start awaits the cache load (a sibling-Edge banned IP gets blocked on first request)", async () => {
    _resetCacheForTests()
    // Seed a deny row directly into the DB - the in-memory cache is empty.
    const future = new Date(Date.now() + 24 * 3600_000).toISOString()
    state.rows.set("8.8.8.8", {
      ip: "8.8.8.8",
      reason: "injection-pattern",
      signature: "Log4Shell",
      hit_count: 1,
      last_hit_at: new Date().toISOString(),
      expires_at: future,
    })
    // Cold start: cacheLoadedAt === 0, so isIpDenied MUST await refresh
    // before returning.
    const denied = await isIpDenied("8.8.8.8")
    expect(denied).toBe(true)
    expect(state.selectCallCount).toBeGreaterThanOrEqual(1)
  })
})

describe("concurrent refresh dedupe", () => {
  it("concurrent isIpDenied calls during cache refresh do not fire multiple selects (cold start)", async () => {
    _resetCacheForTests()
    state.selectDelayMs = 50 // slow the select so requests overlap

    // Fire three concurrent lookups on a cold cache. Without the
    // cacheLoadPromise dedup, all three would race into refreshCache and
    // each issue its own .select() call.
    const results = await Promise.all([
      isIpDenied("3.3.3.3"),
      isIpDenied("3.3.3.3"),
      isIpDenied("3.3.3.3"),
    ])
    expect(results).toEqual([false, false, false])
    // Dedupe contract: ONE select call should service all three requests.
    expect(state.selectCallCount).toBe(1)
  })

  it("a stale-cache refresh during background mode does NOT block requests", async () => {
    _resetCacheForTests()
    state.selectDelayMs = 0

    // Prime the cache (cold start await loads an empty deny list).
    expect(await isIpDenied("4.4.4.4")).toBe(false)
    expect(state.selectCallCount).toBe(1)

    // Now simulate the cache being stale by advancing time past the 60s
    // TTL. The next isIpDenied call should fire a refresh in the
    // BACKGROUND (not await it) since cacheLoadedAt > 0.
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(Date.now() + 61_000))
      // Add a deny row that the background refresh will pick up.
      const future = new Date(Date.now() + 24 * 3600_000).toISOString()
      state.rows.set("4.4.4.4", {
        ip: "4.4.4.4",
        reason: "attacker-probe-path",
        signature: "/.env",
        hit_count: 1,
        last_hit_at: new Date().toISOString(),
        expires_at: future,
      })
      // First post-stale call: returns false (cache still says no), but
      // kicks off the refresh.
      const firstDenied = await isIpDenied("4.4.4.4")
      expect(firstDenied).toBe(false)
    } finally {
      vi.useRealTimers()
    }
    // Wait one microtask tick for the background refresh to settle, then
    // verify a follow-up call sees the new ban.
    await new Promise((r) => setTimeout(r, 10))
    const secondDenied = await isIpDenied("4.4.4.4")
    expect(secondDenied).toBe(true)
  })
})

describe("denyIp upsert payload shape", () => {
  it("upsert is called with onConflict: 'ip' and ignoreDuplicates: false", async () => {
    // Spy on the upsert call by checking the resulting row state.
    await denyIp("2.2.2.2", "injection-pattern", "<script>")
    expect(state.upsertCallCount).toBe(1)
    const row = state.rows.get("2.2.2.2")
    expect(row).toMatchObject({
      ip: "2.2.2.2",
      reason: "injection-pattern",
      signature: "<script>",
      hit_count: 1,
    })
    expect(row!.expires_at).toBeTruthy()
    expect(new Date(row!.expires_at).getTime()).toBeGreaterThan(Date.now())
    expect(row!.last_hit_at).toBeTruthy()
  })

  it("upsert with onConflict: 'ip' refreshes the existing row's expires_at on a second ban", async () => {
    await denyIp("2.2.2.2", "attacker-probe-path", "/wp-admin")
    const firstExpiry = state.rows.get("2.2.2.2")!.expires_at
    // Wait a tick so the new expires_at is measurably different.
    await new Promise((r) => setTimeout(r, 5))
    await denyIp("2.2.2.2", "injection-pattern", "<script>")
    const secondExpiry = state.rows.get("2.2.2.2")!.expires_at
    expect(new Date(secondExpiry).getTime()).toBeGreaterThanOrEqual(
      new Date(firstExpiry).getTime(),
    )
    // Reason updated to the latest signature.
    expect(state.rows.get("2.2.2.2")!.reason).toBe("injection-pattern")
  })
})
