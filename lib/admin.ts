import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

export type AdminRole = "developer" | "support"

export async function getAdminRole(
  email: string | undefined | null,
): Promise<AdminRole | null> {
  if (!email) return null
  const normalized = email.toLowerCase().trim()
  const envAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (envAdmin && envAdmin === normalized) {
    return "developer"
  }
  try {
    const svc = createServiceClient()
    const { data } = await svc
      .from("platform_admins")
      .select("role")
      .eq("email", normalized)
      .maybeSingle()
    return (data?.role as AdminRole) ?? null
  } catch {
    return null
  }
}

export async function isPlatformAdmin(email: string | undefined | null): Promise<boolean> {
  return (await getAdminRole(email)) !== null
}

export async function isDeveloperAdmin(email: string | undefined | null): Promise<boolean> {
  return (await getAdminRole(email)) === "developer"
}

export async function verifyAdmin(): Promise<
  | { user: { id: string; email?: string }; serviceClient: SupabaseClient; role: AdminRole }
  | { error: NextResponse }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = await getAdminRole(user?.email)
  if (!user || !role) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  const serviceClient = createServiceClient()
  return { user, serviceClient, role }
}

export async function verifyDeveloperAdmin(): Promise<
  | { user: { id: string; email?: string }; serviceClient: SupabaseClient }
  | { error: NextResponse }
> {
  const auth = await verifyAdmin()
  if ("error" in auth) return auth
  if (auth.role !== "developer") {
    return {
      error: NextResponse.json({ error: "Developer access required" }, { status: 403 }),
    }
  }
  return { user: auth.user, serviceClient: auth.serviceClient }
}
