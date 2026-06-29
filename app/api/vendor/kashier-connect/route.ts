import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { rateLimit, getIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const { success } = rateLimit(getIp(req), 5, 60_000)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServiceClient()
    const { data: vendor } = await supabase
      .from('vendors')
      .select('kashier_account_id, business_email')
      .eq('clerk_user_id', userId)
      .single()

    if (!vendor) {
      return NextResponse.json({ error: 'No vendor profile found.' }, { status: 400 })
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const accountId = vendor.kashier_account_id ?? `kashier_mock_${Date.now()}`

    if (!vendor.kashier_account_id) {
       await supabase.from('vendors').update({ kashier_account_id: accountId }).eq('clerk_user_id', userId)
    }

    // Mock an onboarding redirect URL
    const url = `${origin}/api/vendor/kashier-connect/callback?account=${accountId}`
    return NextResponse.json({ url })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

