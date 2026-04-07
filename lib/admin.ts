import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "isaac@dibbenterprizes.com"

/**
 * Verify the requesting user is an admin.
 * Returns { user, serviceClient } on success, or a NextResponse error.
 */
export async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  const serviceClient = createServiceClient()
  return { user, serviceClient }
}
