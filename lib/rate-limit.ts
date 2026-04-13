import { createServiceClient } from "@/lib/supabase/server"

/**
 * Supabase-backed rate limiter. Persists across Vercel cold starts and
 * shares state across all serverless instances.
 *
 * MIGRATION REQUIRED: Run supabase/migrations/012_rate_limits.sql to create
 * the rate_limits table. Until then, falls back to in-memory limiting.
 */

// In-memory fallback (used when Supabase table doesn't exist or query fails)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimitInMemory(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count }
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const supabase = createServiceClient()
    const now = new Date().toISOString()

    // Step 1: Read existing non-expired entry
    const { data: existing, error: readError } = await supabase
      .from("rate_limits")
      .select("count, expires_at")
      .eq("key", key)
      .gt("expires_at", now)
      .maybeSingle()

    if (readError) {
      // 42P01 = undefined_table — expected before migration runs
      if (readError.code === "42P01") {
        return checkRateLimitInMemory(key, maxRequests, windowMs)
      }
      console.error("[rate-limit] Supabase read error:", readError.message)
      return checkRateLimitInMemory(key, maxRequests, windowMs)
    }

    if (!existing) {
      // No active window — start a new one via upsert (handles expired row replacement)
      const { error: upsertError } = await supabase
        .from("rate_limits")
        .upsert({
          key,
          count: 1,
          expires_at: new Date(Date.now() + windowMs).toISOString(),
        }, { onConflict: "key" })

      if (upsertError) {
        console.error("[rate-limit] Supabase upsert error:", upsertError.message)
        return checkRateLimitInMemory(key, maxRequests, windowMs)
      }

      return { allowed: true, remaining: maxRequests - 1 }
    }

    // Active window exists — check limit before incrementing
    if (existing.count >= maxRequests) {
      return { allowed: false, remaining: 0 }
    }

    // Increment count (only if still within window to avoid race with expiry)
    const newCount = existing.count + 1
    const { error: updateError } = await supabase
      .from("rate_limits")
      .update({ count: newCount })
      .eq("key", key)
      .gt("expires_at", new Date().toISOString())

    if (updateError) {
      console.error("[rate-limit] Supabase update error:", updateError.message)
      return checkRateLimitInMemory(key, maxRequests, windowMs)
    }

    return { allowed: true, remaining: maxRequests - newCount }
  } catch (err) {
    console.error("[rate-limit] Unexpected error, falling back to in-memory:", err)
    return checkRateLimitInMemory(key, maxRequests, windowMs)
  }
}

// Cleanup old in-memory entries every 10 minutes (fallback only)
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key)
    }
  }, 10 * 60 * 1000)
}
