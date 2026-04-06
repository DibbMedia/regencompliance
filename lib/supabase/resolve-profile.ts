import { SupabaseClient } from '@supabase/supabase-js'

export async function effectiveProfileId(
  userId: string,
  supabase: SupabaseClient
): Promise<string> {
  const { data: member } = await supabase
    .from('team_members')
    .select('profile_id')
    .eq('user_id', userId)
    .single()
  return member?.profile_id ?? userId
}
