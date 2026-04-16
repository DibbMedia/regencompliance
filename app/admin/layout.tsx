import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAdminRole } from "@/lib/admin"
import { AdminShell } from "./admin-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = await getAdminRole(user?.email)
  if (!user || !role) {
    redirect("/dashboard")
  }

  return <AdminShell role={role}>{children}</AdminShell>
}
