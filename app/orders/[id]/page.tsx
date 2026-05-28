import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, FileText, Package, Truck, Home as HomeIcon } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase-server'

type Props = { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const supabase = createServiceClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  // Block access if order doesn't exist or belongs to another user
  if (!order || order.buyer_clerk_id !== userId) notFound()

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('id, quantity, unit_price, products(name, emoji)')
    .eq('order_id', id)

  const items = orderItems ?? []
  const placedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EFF8F7', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Header */}
      <div className="flex items-center px-6 py-3" style={{ backgroundColor: '#164E44' }}>
        <Link href="/orders" className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div className="flex-1 text-center font-bold text-white text-sm">Order Details</div>
        <div className="w-24" />
      </div>

      <div className="flex-1 flex flex-col items-center py-8 px-6">
        <div className="w-full max-w-md flex flex-col gap-5">

          {/* Order ID & Date */}
          <div className="text-center">
            <div className="font-black text-lg" style={{ color: '#1a1a1a' }}>
              Order #{id.slice(0, 8).toUpperCase()}
            </div>
            <div className="text-sm mt-1" style={{ color: '#6b8f8b' }}>
              Placed on{' '}
              <span className="font-semibold pb-0.5" style={{ borderBottom: '2px solid #2BA8A2', color: '#2BA8A2' }}>
                {placedDate}
              </span>
            </div>
          </div>

          {/* Delivery Status */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.1)' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>Delivery Status</div>
            <div className="flex items-center">
              {[
                { label: 'Confirmed', icon: Package, done: true },
                { label: 'Shipped', icon: Truck, done: order.status === 'shipped' || order.status === 'delivered' },
                { label: 'Delivered', icon: HomeIcon, done: order.status === 'delivered' },
              ].map(({ label, icon: Icon, done }, i, arr) => (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: done ? '#2BA8A2' : '#e5e7eb', boxShadow: done ? '0 4px 12px rgba(43,168,162,0.3)' : 'none' }}>
                      <Icon size={18} color={done ? '#fff' : '#9ca3af'} />
                    </div>
                    <div className="text-xs font-bold text-center" style={{ color: done ? '#1a1a1a' : '#9ca3af' }}>{label}</div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1" style={{ backgroundColor: done ? '#2BA8A2' : '#e5e7eb' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Items Ordered */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.1)' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>Items Ordered</div>
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const product = Array.isArray(item.products) ? item.products[0] : item.products
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: '#EFF8F7' }}>
                        {product?.emoji ?? '📦'}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold" style={{ color: '#1a1a1a' }}>{product?.name ?? 'Item'}</div>
                        <div className="text-xs" style={{ color: '#6b8f8b' }}>Qty: {item.quantity}</div>
                      </div>
                      <div className="font-black text-sm" style={{ color: '#1a1a1a' }}>
                        ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-4">
              {order.shipping_address && (
                <div className="rounded-2xl p-4" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.1)' }}>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>
                    <MapPin size={12} /> Shipping To
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: '#4a6b66' }}>
                    {JSON.stringify(order.shipping_address)}
                  </div>
                </div>
              )}

              <div className="rounded-2xl p-4" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.1)' }}>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>
                  <FileText size={12} /> Summary
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs" style={{ color: '#4a6b66' }}>
                    <span>Subtotal</span>
                    <span>${(Number(order.amount_total) - Number(order.platform_fee ?? 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: '#4a6b66' }}>
                    <span>Platform fee</span>
                    <span>${Number(order.platform_fee ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <span className="font-bold text-sm" style={{ color: '#1a1a1a' }}>Total</span>
                    <span className="font-black text-sm px-2 py-0.5 rounded"
                      style={{ backgroundColor: '#FFD23F', color: '#1a1a1a' }}>
                      ${Number(order.amount_total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
