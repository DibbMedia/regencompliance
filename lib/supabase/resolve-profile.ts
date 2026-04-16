import { SupabaseClient } from '@supabase/supabase-js'
import { getActiveImpersonation } from '@/lib/impersonation'

export async function effectiveProfileId(
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  const imp = await getActiveImpersonation()
  if (imp && imp.admin_user_id === userId) {
    return imp.target_user_id
  }

  const { data: member } = await supabase
    .from('team_members')
    .select('profile_id')
    .eq('user_id', userId)
    .eq('accepted', true)
    .maybeSingle()
  return member?.profile_id ?? userId
}
