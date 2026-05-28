import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase-server'

const ApplicationSchema = z.object({
  store_name:        z.string().min(2).max(100),
  business_name:     z.string().min(2).max(200),
  business_type:     z.enum(['individual', 'llc', 'corporation', 'partnership']).default('individual'),
  store_description: z.string().max(2000).optional(),
  business_email:    z.email(),
  business_phone:    z.string().max(30).optional(),
  business_address:  z.string().max(300).optional(),
  business_city:     z.string().max(100).optional(),
  business_state:    z.string().max(100).optional(),
  business_country:  z.string().max(100).default('US'),
  tax_id:            z.string().max(50).optional(),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = ApplicationSchema.safeParse(await req.json())
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(', ')
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const {
    store_name, business_name, business_type, store_description,
    business_email, business_phone, business_address, business_city,
    business_state, business_country, tax_id,
  } = parsed.data

  const supabase = createServiceClient()

  // Check if already reviewed — don't overwrite an approved/rejected status
  const { data: existing } = await supabase
    .from('vendors')
    .select('status')
    .eq('clerk_user_id', userId)
    .single()

  const isReviewed = existing?.status === 'approved' || existing?.status === 'rejected'

  const { error } = await supabase
    .from('vendors')
    .upsert(
      {
        clerk_user_id:     userId,
        store_name,
        business_name,
        business_type,
        store_description,
        business_email,
        business_phone,
        business_address,
        business_city,
        business_state,
        business_country,
        tax_id,
        // Only set pending_review if not already reviewed
        ...(isReviewed ? {} : { status: 'pending_review' }),
        // identity_verified is NOT set here — reserved for admin / KYC provider
        submitted_at: new Date().toISOString(),
        updated_at:   new Date().toISOString(),
      },
      { onConflict: 'clerk_user_id' },
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
