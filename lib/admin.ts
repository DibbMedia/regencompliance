import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

const FALLBACK_ADMIN_EMAIL = "isaac@dibbenterprizes.com"

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || FALLBACK_ADMIN_EMAIL
}

/**
 * Check if a given email is the admin email. Server-only.
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  return email === getAdminEmail()
}

/**
 * Verify the requesting user is an admin.
 * Returns { user, serviceClient } on success, or a NextResponse error.
 */
export async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  const serviceClient = createServiceClient()
  return { user, serviceClient }
}
