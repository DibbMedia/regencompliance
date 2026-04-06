import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const inviteToken = searchParams.get("invite_token")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Handle team invite acceptance
      if (inviteToken) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from("team_members")
            .update({
              user_id: user.id,
              accepted: true,
              accepted_at: new Date().toISOString(),
            })
            .eq("invite_token", inviteToken)

          return NextResponse.redirect(`${origin}/dashboard/scanner`)
        }
      }

      // Check if onboarding is complete
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", user.id)
          .single()

        if (profile && !profile.onboarding_complete) {
          return NextResponse.redirect(`${origin}/onboarding/clinic`)
        }
      }

      return NextResponse.redirect(`${origin}/dashboard/scanner`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
