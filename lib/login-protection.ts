/**
 * In-memory login attempt tracking for brute-force protection.
 * Locks accounts after 5 failed attempts within 15 minutes.
 */

const attempts = new Map<string, { count: number; firstAt: number; lockedUntil: number }>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000  // 15 minutes
const LOCKOUT_MS = 30 * 60 * 1000 // 30 minutes

export function checkLoginAllowed(email: string): { allowed: boolean; remainingAttempts: number; lockedUntil?: number } {
  const key = email.toLowerCase().trim()
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  // Check if locked
  if (entry.lockedUntil > now) {
    return { allowed: false, remainingAttempts: 0, lockedUntil: entry.lockedUntil }
  }

  // Reset if window expired
  if (now - entry.firstAt > WINDOW_MS) {
    attempts.delete(key)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - entry.count }
}

export function recordFailedLogin(email: string): void {
  const key = email.toLowerCase().trim()
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now, lockedUntil: 0 })
    return
  }

  entry.count++

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS
  }
}

export function clearLoginAttempts(email: string): void {
  attempts.delete(email.toLowerCase().trim())
}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of attempts) {
    if (now - entry.firstAt > WINDOW_MS && entry.lockedUntil < now) {
      attempts.delete(key)
    }
  }
}, 10 * 60 * 1000)
