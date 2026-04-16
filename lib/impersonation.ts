import { cookies } from "next/headers"
import { createServiceClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

export const IMPERSONATE_COOKIE = "regen_impersonate"
const SESSION_TTL_MS = 4 * 60 * 60 * 1000

export type ImpersonationMode = "read" | "write"

export interface ActiveImpersonation {
  session_id: string
  admin_user_id: string
  admin_email: string
  target_user_id: string
  target_email: string | null
  mode: ImpersonationMode
  expires_at: string
}

export async function readImpersonationCookie(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(IMPERSONATE_COOKIE)?.value ?? null
}

export async function getActiveImpersonation(
  supabaseForRead?: SupabaseClient,
): Promise<ActiveImpersonation | null> {
  const sessionId = await readImpersonationCookie()
  if (!sessionId) return null

  const svc = supabaseForRead ?? createServiceClient()
  const { data } = await svc
    .from("impersonation_sessions")
    .select("id, admin_user_id, admin_email, target_user_id, target_email, mode, expires_at")
    .eq("id", sessionId)
    .maybeSingle()

  if (!data) return null
  if (new Date(data.expires_at).getTime() < Date.now()) return null

  return {
    session_id: data.id,
    admin_user_id: data.admin_user_id,
    admin_email: data.admin_email,
    target_user_id: data.target_user_id,
    target_email: data.target_email,
    mode: data.mode as ImpersonationMode,
    expires_at: data.expires_at,
  }
}

export async function startImpersonation(opts: {
  adminUserId: string
  adminEmail: string
  targetUserId: string
  targetEmail: string | null
  mode: ImpersonationMode
}): Promise<ActiveImpersonation> {
  const svc = createServiceClient()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

  const { data, error } = await svc
    .from("impersonation_sessions")
    .insert({
      admin_user_id: opts.adminUserId,
      admin_email: opts.adminEmail,
      target_user_id: opts.targetUserId,
      target_email: opts.targetEmail,
      mode: opts.mode,
      expires_at: expiresAt,
    })
    .select("id, admin_user_id, admin_email, target_user_id, target_email, mode, expires_at")
    .single()

  if (error || !data) {
    throw new Error(`Failed to start impersonation: ${error?.message ?? "no row returned"}`)
  }

  const jar = await cookies()
  jar.set(IMPERSONATE_COOKIE, data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })

  return {
    session_id: data.id,
    admin_user_id: data.admin_user_id,
    admin_email: data.admin_email,
    target_user_id: data.target_user_id,
    target_email: data.target_email,
    mode: data.mode as ImpersonationMode,
    expires_at: data.expires_at,
  }
}

export async function stopImpersonation(): Promise<void> {
  const sessionId = await readImpersonationCookie()
  const jar = await cookies()
  jar.delete(IMPERSONATE_COOKIE)

  if (sessionId) {
    try {
      const svc = createServiceClient()
      await svc.from("impersonation_sessions").delete().eq("id", sessionId)
    } catch {
      /* best-effort */
    }
  }
}
