import { NextResponse } from 'next/server'
import { stripe, PLATFORM_FEE_PERCENT } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Parse "product_id:quantity,..." metadata written by the checkout route.
  type ItemEntry = { product_id: string; quantity: number }
  function parseItemsMeta(meta: string | undefined): ItemEntry[] {
    return (meta ?? '')
      .split(',')
      .filter(Boolean)
      .map((entry): ItemEntry | null => {
        const [pid, qty] = entry.split(':')
        const quantity = parseInt(qty ?? '1', 10)
        if (!pid || isNaN(quantity)) return null
        return { product_id: pid, quantity }
      })
      .filter((e): e is ItemEntry => e !== null)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const buyerClerkId = session.metadata?.buyer_clerk_id
    const itemEntries  = parseItemsMeta(session.metadata?.items_meta)

    if (!buyerClerkId) return NextResponse.json({ ok: true })

    const productIds = itemEntries.map(e => e.product_id)
    const { data: products } = await supabase
      .from('products')
      .select('id, vendor_id, price')
      .in('id', productIds)

    const platformFee = session.amount_total
      ? (session.amount_total * PLATFORM_FEE_PERCENT) / 100
      : null

    // Stock was already reserved at checkout creation. Inserting the order
    // here just finalises the reservation. The unique constraint on
    // stripe_checkout_session makes this idempotent under webhook retries.
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        buyer_clerk_id:          buyerClerkId,
        stripe_checkout_session: session.id,
        stripe_payment_intent:   typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
        amount_total: session.amount_total ? session.amount_total / 100 : null,
        platform_fee: platformFee,
        status:       'paid',
      })
      .select()
      .single()

    // Duplicate session = already processed (webhook retry). Treat as success.
    if (orderErr?.code === '23505') return NextResponse.json({ ok: true })

    if (order && products) {
      await supabase.from('order_items').insert(
        products.map(p => {
          const entry = itemEntries.find(e => e.product_id === p.id)
          return {
            order_id:   order.id,
            product_id: p.id,
            vendor_id:  p.vendor_id,
            quantity:   entry?.quantity ?? 1,
            unit_price: p.price,
          }
        }),
      )
    }
  }

  // Buyer abandoned the Stripe page (or paid asynchronously and failed).
  // Return the reservation to the product's stock.
  if (
    event.type === 'checkout.session.expired' ||
    event.type === 'checkout.session.async_payment_failed'
  ) {
    const session    = event.data.object as Stripe.Checkout.Session
    const itemEntries = parseItemsMeta(session.metadata?.items_meta)

    if (itemEntries.length === 0) return NextResponse.json({ ok: true })

    // Insert a placeholder row first. If a 'paid' order already exists for
    // this session, the unique constraint fires and we skip the restore —
    // that guards against expired arriving after completed (or retry storms).
    const { error: markErr } = await supabase
      .from('orders')
      .insert({
        buyer_clerk_id:          session.metadata?.buyer_clerk_id ?? 'unknown',
        stripe_checkout_session: session.id,
        status:                  event.type === 'checkout.session.expired' ? 'expired' : 'failed',
      })

    if (markErr?.code === '23505') return NextResponse.json({ ok: true })

    await supabase.rpc('restore_stock_batch', { items: itemEntries })
  }

  if (event.type === 'account.updated') {
    const account   = event.data.object as Stripe.Account
    const isComplete = account.details_submitted && account.charges_enabled
    await supabase
      .from('vendors')
      .update({
        stripe_onboarding_complete: Boolean(isComplete),
        payout_setup:               Boolean(isComplete),
        updated_at:                 new Date().toISOString(),
      })
      .eq('stripe_account_id', account.id)
  }

  return NextResponse.json({ ok: true })
}
