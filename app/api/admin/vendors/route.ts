import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

async function requireAdmin(userId: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  return data?.role === 'admin'
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await requireAdmin(userId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('vendors')
    .select(
      'id, clerk_user_id, store_name, business_name, business_type, store_description, ' +
      'business_email, business_phone, business_address, business_city, business_state, ' +
      'business_country, tax_id, status, admin_notes, submitted_at, reviewed_at, ' +
      'trust_score, stripe_onboarding_complete, created_at'
    )
    .order('submitted_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ vendors: data ?? [] })
}
