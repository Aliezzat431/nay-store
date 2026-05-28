import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import { rateLimit, getIp } from '@/lib/rate-limit'

const CheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity:   z.number().int().min(1).max(100),
      }),
    )
    .min(1)
    .max(50),
})

export async function POST(req: Request) {
  const { success } = rateLimit(getIp(req), 10, 60_000) // 10 per minute per IP
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = CheckoutSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  }
  const { items } = parsed.data

  const supabase = createServiceClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, emoji, vendor_id, vendors(stripe_account_id)')
    .in('id', items.map(i => i.product_id))
    .eq('is_active', true)

  if (!products || products.length === 0) {
    return NextResponse.json({ error: 'Products not found' }, { status: 400 })
  }

  // Fail if any requested product was not found (avoids silent partial checkout)
  if (products.length !== items.length) {
    return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
  }

  // Reserve stock atomically BEFORE charging the card. The RPC's row-level
  // UPDATE with `stock >= qty` guard is what serialises concurrent buyers —
  // the loser fails here and never reaches Stripe.
  const { data: reserveResult, error: reserveErr } = await supabase.rpc('decrement_stock_batch', {
    items,
  })
  if (reserveErr) {
    return NextResponse.json({ error: 'Could not reserve stock' }, { status: 500 })
  }
  if (!(reserveResult as { success: boolean } | null)?.success) {
    return NextResponse.json({ error: 'One or more items are out of stock' }, { status: 409 })
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const firstProduct = products[0]
  const vendorRaw = firstProduct.vendors
  const vendorStripeId = Array.isArray(vendorRaw)
    ? (vendorRaw[0] as { stripe_account_id: string } | undefined)?.stripe_account_id
    : (vendorRaw as { stripe_account_id: string } | null)?.stripe_account_id

  const lineItems = products.map(product => {
    const cartItem = items.find(i => i.product_id === product.id)
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name:        product.name,
          description: `${product.emoji} – Flip7 Market`,
        },
        unit_amount: Math.round(Number(product.price) * 100),
      },
      quantity: cartItem?.quantity ?? 1,
    }
  })

  const totalAmount = lineItems.reduce(
    (sum, item) => sum + item.price_data.unit_amount * item.quantity,
    0,
  )
  const applicationFee = Math.round(totalAmount * PLATFORM_FEE_PERCENT)

  // Store quantities in metadata keyed as "product_id:qty" for the webhook
  const itemsMeta = items.map(i => `${i.product_id}:${i.quantity}`).join(',')

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    payment_method_types: ['card'],
    line_items:           lineItems,
    mode:                 'payment',
    // 30 min is Stripe's minimum. When the session expires Stripe emits
    // `checkout.session.expired` and the webhook returns the reservation.
    expires_at:  Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${origin}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/cart`,
    metadata: {
      buyer_clerk_id: userId,
      items_meta:     itemsMeta.slice(0, 500), // Stripe metadata 500-char limit
    },
  }

  if (vendorStripeId) {
    sessionParams.payment_intent_data = {
      application_fee_amount: applicationFee,
      transfer_data: { destination: vendorStripeId },
    }
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    // Stripe failed after we reserved stock — return it before the buyer leaves
    await supabase.rpc('restore_stock_batch', { items })
    console.error('[checkout] stripe session creation failed, stock restored:', err)
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 502 })
  }
}
