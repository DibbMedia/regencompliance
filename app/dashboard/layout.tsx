import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { HelpButton } from "@/components/help-button"
import { NavigationProgress } from "@/components/navigation-progress"
import { SessionTimeout } from "@/components/session-timeout"
import { getProfile } from "@/lib/repos/profiles"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Route through the profiles repo so clinic_name is decrypted under the
  // caller's per-user DEK (Wave 2A; see docs/user-level-encryption-plan.md).
  const profile = await getProfile(supabase, user.id)

  if (!profile) {
    redirect("/onboarding/clinic")
  }

  if (!profile.onboarding_complete) {
    redirect("/onboarding/clinic")
  }

  // Determine role
  const { data: member } = await supabase
    .from("team_members")
    .select("role, profile_id")
    .eq("user_id", user.id)
    .maybeSingle()

  const role = member?.role || "owner"

  return (
    <SidebarProvider>
      <NavigationProgress />
      <div className="flex min-h-[100dvh] w-full bg-[#0a0a0a]">
        <DashboardSidebar
          clinicName={profile?.clinic_name}
          userEmail={user.email}
        />
        <div className="flex flex-1 flex-col min-w-0">
          <DashboardHeader
            userEmail={user.email}
            clinicName={profile?.clinic_name}
            role={role}
          />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
        <HelpButton />
        <SessionTimeout />
      </div>
    </SidebarProvider>
  )
}
