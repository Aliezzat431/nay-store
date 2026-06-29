import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()

  // Get vendor record
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, store_name, trust_score, status')
    .eq('clerk_user_id', userId)
    .single()

  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  // Get all order_items for this vendor with order + product info
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('id, quantity, unit_price, order_id, product_id, orders(id, status, created_at, buyer_clerk_id, stripe_payment_intent), products(name, emoji)')
    .eq('vendor_id', vendor.id)

  // Total revenue
  const totalRevenue = (orderItems ?? []).reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity, 0
  )

  // Active orders (paid/processing)
  const activeOrders = (orderItems ?? []).filter(
    item => ['paid', 'processing', 'shipped'].includes((item.orders as any)?.status ?? '')
  ).length

  // Listed products count
  const { count: listedItems } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('vendor_id', vendor.id)
    .eq('is_active', true)

  // Recent 5 orders (deduplicated by order_id)
  const seenOrders = new Set<string>()
  const recentOrders = (orderItems ?? [])
    .filter(item => {
      const orderId = (item.orders as any)?.id
      if (!orderId || seenOrders.has(orderId)) return false
      seenOrders.add(orderId)
      return true
    })
    .slice(0, 5)
    .map(item => {
      const order = item.orders as any
      const product = item.products as any
      return {
        id: order?.id?.slice(0, 8).toUpperCase() ?? '—',
        item: product?.name ?? 'Unknown',
        emoji: product?.emoji ?? '📦',
        total: `$${(Number(item.unit_price) * item.quantity).toFixed(2)}`,
        status: order?.status ?? 'pending',
        date: order?.created_at ?? null,
      }
    })

  // Top products by revenue
  const productRevenue: Record<string, { name: string; emoji: string; revenue: number; sold: number }> = {}
  for (const item of orderItems ?? []) {
    const product = item.products as any
    if (!product || !item.product_id) continue
    if (!productRevenue[item.product_id]) {
      productRevenue[item.product_id] = { name: product.name, emoji: product.emoji, revenue: 0, sold: 0 }
    }
    productRevenue[item.product_id].revenue += Number(item.unit_price) * item.quantity
    productRevenue[item.product_id].sold += item.quantity
  }
  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3)

  return NextResponse.json({
    totalRevenue,
    activeOrders,
    listedItems: listedItems ?? 0,
    trustScore: vendor.trust_score ?? 0,
    status: vendor.status,
    storeName: vendor.store_name,
    recentOrders,
    topProducts,
  })
}
