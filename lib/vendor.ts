import { createServiceClient } from '@/lib/supabase-server'

export async function getVendorId(
  supabase: ReturnType<typeof createServiceClient>,
  clerkUserId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('vendors')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single()
  if (error || !data) return null
  return data.id as string
}
