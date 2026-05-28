import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'

const origin = () => process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get('account')

  if (!accountId) {
    return NextResponse.redirect(`${origin()}/vendor/onboarding?error=missing_account`)
  }

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(`${origin()}/sign-in`)
  }

  let isComplete = false
  try {
    const account = await stripe.accounts.retrieve(accountId)
    isComplete = Boolean(account.details_submitted)
  } catch (err) {
    console.error('Stripe account retrieve error:', err)
    return NextResponse.redirect(`${origin()}/vendor/onboarding?error=stripe_error`)
  }

  const supabase = createServiceClient()
  await supabase
    .from('vendors')
    .update({
      stripe_account_id:        accountId,
      stripe_onboarding_complete: isComplete,
      payout_setup:             isComplete,
      updated_at:               new Date().toISOString(),
    })
    .eq('clerk_user_id', userId)

  return NextResponse.redirect(
    `${origin()}/vendor/onboarding?stripe=${isComplete ? 'success' : 'pending'}`,
  )
}
