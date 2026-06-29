import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-server'

// Only fields a vendor is allowed to write through this endpoint.
// Admin-controlled columns (status, trust_score, kashier_account_id,
// identity_verified, reviewed_at, admin_notes) are never accepted here.
const SaveSchema = z.object({
  store_policy_accepted: z.boolean().optional(),
  store_name:            z.string().min(1).max(100).optional(),
  store_description:     z.string().max(2000).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = SaveSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('vendors')
    .upsert(
      { clerk_user_id: userId, ...parsed.data, updated_at: new Date().toISOString() },
      { onConflict: 'clerk_user_id' },
    )
    .select()
    .single()

  if (error) {
    console.error('vendor save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
