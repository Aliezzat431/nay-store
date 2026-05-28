'use client'

import Link from 'next/link'
import { ShoppingCart, Store, Check, ChevronRight } from 'lucide-react'

const ds = {
  tealDark:    '#1E8C86',
  teal:        '#2BA8A2',
  tealLight:   '#3CC4BD',
  gold:        '#FFD23F',
  coral:       '#f46f4d',
  cream:       '#FFF8E7',
  surface:     '#f2fbfa',
  surfaceLow:  '#ecf5f4',
  onSurface:   '#151d1d',
  onSurfaceVar:'#3d4948',
  outline:     '#bcc9c7',
}

const steps = ['Choose Role', 'Verify Identity', 'Setup Store']

export default function ChooseRolePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: ds.surface, fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)' }}>

      {/* Logo */}
      <Link href="/" className="font-black text-xl tracking-widest mb-10" style={{ color: ds.tealDark }}>
        FLIP7 MARKET
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                style={{
                  backgroundColor: i === 0 ? ds.gold : 'transparent',
                  color: i === 0 ? ds.onSurface : ds.outline,
                  border: i === 0 ? 'none' : `2px solid ${ds.outline}`,
                }}>
                {i + 1}
              </div>
              <span className="text-xs font-semibold whitespace-nowrap"
                style={{ color: i === 0 ? ds.onSurface : ds.outline }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-16 h-px mb-5 mx-2" style={{ backgroundColor: ds.outline }} />
            )}
          </div>
        ))}
      </div>

      <h1 className="font-black text-3xl mb-2 text-center" style={{ color: ds.onSurface }}>Get Started</h1>
      <p className="text-sm mb-10 text-center" style={{ color: ds.onSurfaceVar }}>Choose how you want to use Flip7 Market</p>

      {/* Role cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">

        {/* Buyer card */}
        <Link href="/sign-up"
          className="flex-1 rounded-3xl p-7 border-2 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer"
          style={{ backgroundColor: '#fff', borderColor: ds.outline }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: ds.surfaceLow }}>
              <ShoppingCart size={22} style={{ color: ds.teal }} />
            </div>
            <h2 className="font-black text-xl" style={{ color: ds.onSurface }}>Buyer</h2>
          </div>

          <p className="text-sm leading-relaxed mb-5" style={{ color: ds.onSurfaceVar }}>
            Ready to find rare treasures and daily deals? Join as a buyer to start browsing, bidding,
            and purchasing from top vendors in the Flip7 Marketplace.
          </p>

          <div className="flex flex-col gap-2 mb-6">
            {['Access exclusive deals', 'Secure checkout process'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm" style={{ color: ds.teal }}>
                <Check size={14} />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div className="w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: ds.teal, color: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.3)' }}>
            Select Buyer <ChevronRight size={16} />
          </div>
        </Link>

        {/* Vendor card */}
        <Link href="/sign-up?role=vendor"
          className="flex-1 rounded-3xl p-7 border-2 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer relative"
          style={{ backgroundColor: '#fff', borderColor: ds.gold, boxShadow: '0 4px 30px rgba(255,210,63,0.15)' }}>

          {/* Recommended badge */}
          <span className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-black"
            style={{ backgroundColor: ds.gold, color: ds.onSurface }}>
            RECOMMENDED
          </span>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#FFF8E7' }}>
              <Store size={22} style={{ color: ds.gold }} />
            </div>
            <h2 className="font-black text-xl" style={{ color: ds.onSurface }}>Vendor</h2>
          </div>

          <p className="text-sm leading-relaxed mb-5" style={{ color: ds.onSurfaceVar }}>
            Turn your inventory into profit. Set up a storefront, manage your sales,
            and reach a massive audience of eager buyers.
          </p>

          <div className="flex flex-col gap-2 mb-6">
            {['Advanced analytics dashboard', 'Low transaction fees'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#b8860b' }}>
                <span>★</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div className="w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: ds.gold, color: ds.onSurface, boxShadow: '0 4px 20px rgba(255,210,63,0.4)' }}>
            Become a Vendor 🚀
          </div>
        </Link>
      </div>

      <p className="mt-8 text-xs" style={{ color: ds.onSurfaceVar }}>
        Already have an account?{' '}
        <Link href="/sign-in" className="font-bold" style={{ color: ds.teal }}>Sign in</Link>
      </p>
    </div>
  )
}
