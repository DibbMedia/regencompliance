import { createServiceClient } from "@/lib/supabase/server"

const EXPENSIVE_PREFIXES = [
  "scan",
  "scan-url",
  "scan-file",
  "rewrite",
  "demo",
  "demo-ip",
  "demo-rewrite-ip",
  "crawl",
  "crawl-user",
]

function isExpensive(key: string): boolean {
  const prefix = key.split(":")[0]
  return EXPENSIVE_PREFIXES.includes(prefix)
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.rpc("increment_rate_limit", {
      p_key: key,
      p_window_ms: windowMs,
    })
    if (error) {
      if (error.code === "42P01" || error.code === "42883") {
        return { allowed: true, remaining: maxRequests - 1 }
      }
      console.error("[rate-limit] RPC error:", error.message)
      if (isExpensive(key)) return { allowed: false, remaining: 0 }
      return { allowed: true, remaining: maxRequests - 1 }
    }
    const count = typeof data === "number" ? data : Number(data ?? 0)
    return { allowed: count <= maxRequests, remaining: Math.max(0, maxRequests - count) }
  } catch (err) {
    console.error("[rate-limit] Unexpected error:", err)
    if (isExpensive(key)) return { allowed: false, remaining: 0 }
    return { allowed: true, remaining: maxRequests - 1 }
  }
}
