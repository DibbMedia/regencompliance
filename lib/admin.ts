import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export function getAdminEmail(): string | null {
  return process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || null
}

/**
 * Verify the requesting user is an admin.
 * Returns { user, serviceClient } on success, or a NextResponse error.
 */
export async function verifyAdmin() {
  const adminEmail = getAdminEmail()
  if (!adminEmail) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== adminEmail) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  const serviceClient = createServiceClient()
  return { user, serviceClient }
}
