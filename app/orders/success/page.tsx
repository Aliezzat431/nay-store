'use client'

import Link from 'next/link'
import { CheckCircle2, ShoppingBag } from 'lucide-react'
import { useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'
import Navbar from '@/components/navbar'

const ds = {
  teal: '#2BA8A2',
  gold: '#FFD23F',
  surface: '#f2fbfa',
  onSurface: '#151d1d',
  onSurfaceVar: '#3d4948',
}

export default function OrderSuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: ds.surface, fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)' }}>
      <Navbar />
      <div className="text-center max-w-md">
        <CheckCircle2 size={72} className="mx-auto mb-6" style={{ color: ds.teal }} />
        <h1 className="font-black text-3xl mb-3" style={{ color: ds.onSurface }}>Order Placed! 🎉</h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: ds.onSurfaceVar }}>
          Your payment was successful. The vendor has been notified and will ship your item soon.
          You'll receive a confirmation email shortly.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/marketplace"
            className="px-7 py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
            style={{ backgroundColor: ds.gold, color: ds.onSurface, boxShadow: '0 4px 20px rgba(255,210,63,0.4)' }}>
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
