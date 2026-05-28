import Link from 'next/link'
import { Zap, ChevronRight, Globe, Share2, Heart } from 'lucide-react'
import Navbar from '@/components/navbar'
import { createAnonClient } from '@/lib/supabase-server'

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

const boardPieces = [
  { emoji: '🎲', top: '5%',  left: '40%', size: 48, bg: '#FFD23F'  },
  { emoji: '👑', top: '30%', left: '75%', size: 44, bg: '#f46f4d'  },
  { emoji: '⭐', top: '65%', left: '70%', size: 40, bg: '#FFD23F'  },
  { emoji: '🎮', top: '75%', left: '30%', size: 44, bg: '#2BA8A2'  },
  { emoji: '💎', top: '40%', left: '5%',  size: 40, bg: '#1E8C86'  },
  { emoji: '🃏', top: '10%', left: '15%', size: 36, bg: '#f46f4d'  },
]

async function getFeaturedProducts() {
  const supabase = createAnonClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, category, price, emoji')
    .eq('is_active', true)
    .limit(4)
  return data ?? []
}

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <div style={{ fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)', backgroundColor: ds.surface, color: ds.onSurface }}>

      <Navbar />

      <main className="pt-16">

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-black leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
              Discover.<br />
              <span style={{ color: ds.teal }}>Buy.</span><br />
              <span style={{ color: ds.coral }}>Sell.</span>
            </h1>
            <p className="mb-7 text-base leading-relaxed max-w-md" style={{ color: ds.onSurfaceVar, fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
              The ultimate tabletop-inspired marketplace. Trade rare collectibles, vintage toys, and unique treasures in a competitive world of joy.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/marketplace"
                className="px-7 py-3 rounded-full font-black text-sm transition-all hover:scale-105"
                style={{ backgroundColor: ds.gold, color: ds.onSurface, boxShadow: '0 4px 20px rgba(255,210,63,0.4)' }}>
                Shop Now
              </Link>
              <Link href="/sign-up/choose-role"
                className="px-7 py-3 rounded-full font-bold text-sm border-2 transition-all hover:scale-105"
                style={{ borderColor: ds.teal, color: ds.teal }}>
                Become a Vendor
              </Link>
            </div>
          </div>

          {/* Game board */}
          <div className="relative h-72 md:h-96 flex items-center justify-center">
            <div className="relative w-72 h-72 rounded-full flex items-center justify-center"
              style={{ background: `radial-gradient(circle, #3CC4BD25 0%, #2BA8A210 70%)`, border: `3px dashed #3CC4BD60` }}>
              {boardPieces.map(({ emoji, top, left, size, bg }) => (
                <div key={emoji} className="absolute rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ top, left, width: size, height: size, backgroundColor: bg, transform: 'translate(-50%,-50%)' }}>
                  <span style={{ fontSize: size * 0.5 }}>{emoji}</span>
                </div>
              ))}
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl"
                style={{ backgroundColor: ds.tealDark, color: '#fff', boxShadow: '0 8px 32px rgba(30,140,134,0.4)' }}>
                F7
              </div>
            </div>
          </div>
        </section>

        {/* Flash Deals Banner */}
        <section className="py-4 mb-10" style={{ backgroundColor: ds.coral }}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Zap size={28} fill="#FFF8E7" color="#FFF8E7" />
              <div>
                <div className="font-black text-lg tracking-widest text-white">BOOM! FLASH DEALS</div>
                <div className="text-xs font-medium" style={{ color: '#ffe8e0', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
                  Grab them before the game ends!
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-black text-2xl text-white">
              {['02','44','56'].map((v, i) => (
                <span key={v} className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-center inline-block" style={{ backgroundColor: ds.teal, minWidth: 48 }}>{v}</span>
                  {i < 2 && <span>:</span>}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Pieces */}
        <section className="max-w-7xl mx-auto px-6 py-10 mb-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-black text-2xl" style={{ color: ds.onSurface }}>Featured Pieces</h2>
              <p className="text-sm mt-1" style={{ color: ds.onSurfaceVar, fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
                Hand-picked items from top sellers
              </p>
            </div>
            <Link href="/marketplace" className="flex items-center gap-1 text-sm font-bold" style={{ color: ds.teal }}>
              View Board <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map(({ id, name, category, price, emoji }) => (
              <Link href={`/products/${id}`} key={id}
                className="rounded-3xl overflow-hidden flex flex-col transition-all hover:scale-[1.02]"
                style={{ backgroundColor: '#fff', boxShadow: '0 2px 16px rgba(43,168,162,0.10)', borderLeft: `5px solid ${ds.teal}` }}>
                <div className="relative flex items-center justify-center py-8 text-6xl"
                  style={{ backgroundColor: ds.surfaceLow }}>
                  {emoji ?? '📦'}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-black"
                    style={{ backgroundColor: ds.gold, color: ds.onSurface }}>${Number(price).toFixed(0)}</span>
                </div>
                <div className="p-4">
                  <div className="font-bold text-sm mb-0.5" style={{ color: ds.onSurface }}>{name}</div>
                  {category && <div className="text-xs mb-3" style={{ color: ds.onSurfaceVar, fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>{category}</div>}
                  <div className="w-full py-2 rounded-full text-xs font-black text-center transition-all hover:scale-105"
                    style={{ backgroundColor: ds.teal, color: '#fff', boxShadow: '0 4px 12px rgba(43,168,162,0.25)' }}>
                    View Item
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: ds.tealDark }}>
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-black text-xl mb-3" style={{ color: ds.gold }}>FLIP7 MARKET</div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#9ecfcc', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
              The world's most playful marketplace where every purchase is a move towards victory.
            </p>
            <div className="flex gap-3">
              {[Globe, Share2, Heart].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110"
                  style={{ borderColor: '#3CC4BD60', color: ds.tealLight }}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-black text-xs uppercase tracking-widest mb-4" style={{ color: ds.gold }}>Play</div>
            {['Sell on Flip7', 'Game Rules', 'Point Rewards'].map(l => (
              <Link key={l} href="#" className="block text-sm mb-2 hover:text-white transition-colors"
                style={{ color: '#9ecfcc', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>{l}</Link>
            ))}
          </div>

          <div>
            <div className="font-black text-xs uppercase tracking-widest mb-4" style={{ color: ds.gold }}>Support</div>
            {['Help Center', 'Terms', 'Safety'].map(l => (
              <Link key={l} href="#" className="block text-sm mb-2 hover:text-white transition-colors"
                style={{ color: '#9ecfcc', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>{l}</Link>
            ))}
          </div>

          <div>
            <div className="font-black text-xs uppercase tracking-widest mb-4" style={{ color: ds.gold }}>Stay in the Loop</div>
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#3CC4BD40' }}>
              <input type="email" placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: '#3CC4BD15', color: '#fff', fontFamily: 'var(--font-inter, Inter, sans-serif)' }} />
              <button className="px-3 flex items-center justify-center" style={{ backgroundColor: ds.gold }}>
                <ChevronRight size={16} color={ds.onSurface} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t" style={{ borderColor: '#3CC4BD25' }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-xs"
            style={{ color: '#3CC4BD80', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
            <span>© 2024 FLIP7 MARKET. Play the Market.</span>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
