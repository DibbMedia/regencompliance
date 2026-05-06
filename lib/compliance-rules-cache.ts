import type { SupabaseClient } from "@supabase/supabase-js"

export interface CachedComplianceRule {
  id: string
  banned_phrase: string
  banned_phrase_variants: string[] | null
  compliant_alternative: string | null
  risk_level: string
  applies_to: string[] | null
  category: string | null
}

const RULES_TTL_MS = 60_000

interface CacheEntry {
  rules: CachedComplianceRule[]
  expiresAt: number
}

let cache: CacheEntry | null = null
let inflight: Promise<CachedComplianceRule[]> | null = null

/**
 * Active compliance rules with a 60-second in-process cache. Each scan
 * route used to re-SELECT the entire active ruleset every time, which
 * meant 30+ DB roundtrips per active beta user per hour for data that
 * changes maybe a few times per day. The cache keeps reads bounded
 * without giving up freshness when rules actually change.
 *
 * Coalesces concurrent misses through `inflight` so a thundering herd
 * after expiry only fires one DB query.
 *
 * Admin write routes (POST/PATCH /api/admin/rules) call
 * `invalidateComplianceRules()` to drop the cache on rule changes.
 */
export async function getActiveComplianceRules(
  supabase: SupabaseClient
): Promise<CachedComplianceRule[]> {
  const now = Date.now()
  if (cache && cache.expiresAt > now) {
    return cache.rules
  }
  if (inflight) {
    return inflight
  }
  inflight = (async () => {
    try {
      const { data, error } = await supabase
        .from("compliance_rules")
        .select(
          "id, banned_phrase, banned_phrase_variants, compliant_alternative, risk_level, applies_to, category"
        )
        .eq("is_active", true)
      if (error) {
        // Don't poison the cache on error; fall back to whatever we had.
        if (cache) return cache.rules
        return []
      }
      const rules = (data ?? []) as CachedComplianceRule[]
      cache = { rules, expiresAt: Date.now() + RULES_TTL_MS }
      return rules
    } finally {
      inflight = null
    }
  })()
  return inflight
}

export function invalidateComplianceRules(): void {
  cache = null
  inflight = null
}
