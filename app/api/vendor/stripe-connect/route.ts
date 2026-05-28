import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import { rateLimit, getIp } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const { success } = rateLimit(getIp(req), 5, 60_000) // 5 per minute per IP
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServiceClient()
    const { data: vendor } = await supabase
      .from('vendors')
      .select('stripe_account_id, business_email')
      .eq('clerk_user_id', userId)
      .single()

    if (!vendor) {
      return NextResponse.json(
        { error: 'No vendor profile found. Please submit your store details first.' },
        { status: 400 }
      )
    }

    let accountId = vendor.stripe_account_id

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: vendor.business_email ?? undefined,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      })
      accountId = account.id

      await supabase.from('vendors')
        .update({ stripe_account_id: accountId })
        .eq('clerk_user_id', userId)
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/vendor/onboarding?stripe=refresh`,
      return_url: `${origin}/api/vendor/stripe-connect/callback?account=${accountId}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe-connect] error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
