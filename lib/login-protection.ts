import { createServiceClient } from "@/lib/supabase/server"

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const LOCKOUT_MS = 30 * 60 * 1000

function key(email: string): string {
  return `login:${email.toLowerCase().trim()}`
}

export async function checkLoginAllowed(email: string): Promise<{ allowed: boolean; remainingAttempts: number; lockedUntil?: number }> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from("rate_limits")
      .select("count, expires_at")
      .eq("key", key(email))
      .maybeSingle()

    if (!data) return { allowed: true, remainingAttempts: MAX_ATTEMPTS }

    const count = Number(data.count ?? 0)
    const expiresAt = new Date(data.expires_at as string).getTime()

    if (count >= MAX_ATTEMPTS) {
      return { allowed: false, remainingAttempts: 0, lockedUntil: expiresAt }
    }
    return { allowed: true, remainingAttempts: Math.max(0, MAX_ATTEMPTS - count) }
  } catch {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }
}

export async function recordFailedLogin(email: string): Promise<void> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.rpc("increment_rate_limit", {
      p_key: key(email),
      p_window_ms: WINDOW_MS,
    })
    const count = typeof data === "number" ? data : Number(data ?? 0)
    if (count >= MAX_ATTEMPTS) {
      await supabase
        .from("rate_limits")
        .update({ expires_at: new Date(Date.now() + LOCKOUT_MS).toISOString() })
        .eq("key", key(email))
    }
  } catch {
    /* silent */
  }
}

export async function clearLoginAttempts(email: string): Promise<void> {
  try {
    const supabase = createServiceClient()
    await supabase.from("rate_limits").delete().eq("key", key(email))
  } catch {
    /* silent */
  }
}
