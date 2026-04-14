import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

const ADMIN_EMAILS = [
  "isaac@dibbenterprizes.com",
  "oscar@regenportal.com",
]

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || ADMIN_EMAILS[0]
}

/**
 * Check if a given email is an admin email. Server-only.
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const envAdmin = process.env.ADMIN_EMAIL
  if (envAdmin && email === envAdmin) return true
  return ADMIN_EMAILS.includes(email)
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
