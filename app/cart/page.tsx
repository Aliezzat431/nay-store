'use client'

import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Lock } from 'lucide-react'
import { useState } from 'react'
import Navbar from '@/components/navbar'

const ds = {
  tealDark:    '#1E8C86',
  teal:        '#2BA8A2',
  gold:        '#FFD23F',
  coral:       '#f46f4d',
  surface:     '#f2fbfa',
  surfaceLow:  '#ecf5f4',
  onSurface:   '#151d1d',
  onSurfaceVar:'#3d4948',
  outline:     '#bcc9c7',
}

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem, clearCart } = useCart()
  const { isSignedIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = subtotal

  async function handleCheckout() {
    if (!isSignedIn) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Checkout failed. Please try again.')
      }
    } catch {
      setError('Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: ds.surface, fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)' }}>
      <Navbar />

      <main className="pt-24 max-w-4xl mx-auto px-6 pb-16">
        <h1 className="font-black text-2xl mb-8" style={{ color: ds.onSurface }}>Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={56} className="mx-auto mb-4" style={{ color: ds.outline }} />
            <div className="font-black text-xl mb-2" style={{ color: ds.onSurface }}>Your cart is empty</div>
            <div className="text-sm mb-6" style={{ color: ds.onSurfaceVar }}>Browse the marketplace and add items to get started</div>
            <Link href="/marketplace"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-black text-sm transition-all hover:scale-105"
              style={{ backgroundColor: ds.gold, color: ds.onSurface, boxShadow: '0 4px 20px rgba(255,210,63,0.4)' }}>
              Shop Now <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Cart items */}
            <div className="flex-1 flex flex-col gap-3">
              {items.map(item => (
                <div key={item.product_id} className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(43,168,162,0.08)', border: `1px solid ${ds.outline}` }}>

                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ backgroundColor: ds.surfaceLow }}>
                    {item.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate mb-0.5" style={{ color: ds.onSurface }}>{item.name}</div>
                    <div className="text-sm font-black" style={{ color: ds.teal }}>${item.price.toFixed(2)}</div>
                    {item.store_name && (
                      <div className="text-xs mt-0.5" style={{ color: ds.onSurfaceVar }}>
                        Sold by <span className="font-semibold" style={{ color: ds.tealDark }}>{item.store_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: ds.coral }}>
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center font-black text-sm" style={{ color: ds.onSurface }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: item.quantity >= item.stock ? '#9ca3af' : ds.teal }}>
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="font-black text-sm flex-shrink-0 w-16 text-right" style={{ color: ds.onSurface }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  <button onClick={() => removeItem(item.product_id)}
                    className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-red-50"
                    style={{ color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button onClick={clearCart}
                className="text-xs font-semibold self-start mt-2 px-3 py-1.5 rounded-full border transition-colors hover:bg-red-50"
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}>
                Clear Cart
              </button>
            </div>

            {/* Order summary */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="rounded-2xl p-5 sticky top-24"
                style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.1)', border: `1px solid ${ds.outline}` }}>
                <h2 className="font-black text-sm mb-4 uppercase tracking-widest" style={{ color: '#9ca3af' }}>Order Summary</h2>

                <div className="flex flex-col gap-2.5 mb-4">
                  {[
                    { label: 'Subtotal', value: `$${subtotal.toFixed(2)}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm" style={{ color: ds.onSurfaceVar }}>
                      <span>{label}</span><span>{value}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2.5 flex justify-between font-black text-base"
                    style={{ borderColor: ds.outline, color: ds.onSurface }}>
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-600 mb-3 p-2 rounded-lg bg-red-50">{error}</div>
                )}

                {isSignedIn ? (
                  <button onClick={handleCheckout} disabled={loading}
                    className="w-full py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ backgroundColor: ds.gold, color: ds.onSurface, boxShadow: '0 4px 20px rgba(255,210,63,0.4)' }}>
                    {loading ? 'Redirecting...' : <><Lock size={14} /> Secure Checkout</>}
                  </button>
                ) : (
                  <Link href="/sign-in"
                    className="w-full py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: ds.teal, color: '#fff' }}>
                    Sign In to Checkout
                  </Link>
                )}

                <div className="flex items-center justify-center gap-1 mt-3 text-xs" style={{ color: '#9ca3af' }}>
                  <Lock size={10} />
                  <span>Powered by Kashier – Secure Payment</span>
                </div>

                <div className="mt-2 text-xs text-center" style={{ color: '#9ca3af' }}>
                  5% platform fee supports Flip7 Market
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
