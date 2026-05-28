import Link from 'next/link'
import { ShoppingCart, Bell, Heart, ChevronRight, Star, Shield, Minus, Plus } from 'lucide-react'

export default function ProductPage() {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', backgroundColor: '#f9fafb' }}>

      {/* Left Sidebar */}
      <aside className="w-44 flex flex-col py-6 px-4 border-r" style={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
        <div className="font-black text-sm mb-6" style={{ color: '#164E44' }}>Flip7 Market</div>

        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>Categories</div>
          {[
            { label: 'Retro Consoles', active: true },
            { label: 'Vinyl Records', active: false },
            { label: 'Trading Cards', active: false },
            { label: 'Vintage Toys', active: false },
          ].map(({ label, active }) => (
            <button key={label} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-full text-xs font-semibold mb-1 transition-all"
              style={{ backgroundColor: active ? '#2BA8A2' : 'transparent', color: active ? '#fff' : '#4a6b66' }}>
              {active && <div className="w-2 h-2 rounded-full bg-white/80 flex-shrink-0" />}
              {label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>Filters</div>
          {[
            { label: 'Verified Sellers', checked: false },
            { label: 'Mint Condition', checked: true },
          ].map(({ label, checked }) => (
            <label key={label} className="flex items-center gap-2 text-xs font-medium mb-2 cursor-pointer" style={{ color: '#4a6b66' }}>
              <div className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                style={{ borderColor: checked ? '#2BA8A2' : '#d1d5db', backgroundColor: checked ? '#2BA8A2' : '#fff' }}>
                {checked && <div className="w-2 h-2 rounded-sm bg-white" />}
              </div>
              {label}
            </label>
          ))}
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>Price Range</div>
          <div className="px-1">
            <div className="h-1.5 rounded-full mb-2 relative" style={{ backgroundColor: '#e5e7eb' }}>
              <div className="absolute left-0 h-full rounded-full" style={{ width: '70%', backgroundColor: '#2BA8A2' }} />
              <div className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md top-1/2 -translate-y-1/2" style={{ left: '70%', backgroundColor: '#2BA8A2' }} />
            </div>
            <div className="flex justify-between text-xs" style={{ color: '#9ca3af' }}>
              <span>$0</span><span>$250+</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button className="text-xs font-medium" style={{ color: '#9ca3af' }}>Preferences</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Nav */}
        <nav className="flex items-center justify-between px-6 py-3 border-b" style={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm" style={{ borderColor: '#d1d5db', color: '#9ca3af', maxWidth: '360px' }}>
              🔍 Search retro treasures...
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700"><ShoppingCart size={20} /></button>
            <button className="text-gray-500 hover:text-gray-700"><Bell size={20} /></button>
            <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #2BA8A2, #1E8C86)' }} />
          </div>
        </nav>

        <div className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-5" style={{ color: '#6b7280' }}>
            <Link href="/" style={{ color: '#2BA8A2' }}>Home</Link>
            <ChevronRight size={12} />
            <span>Retro Consoles</span>
            <ChevronRight size={12} />
            <span style={{ color: '#1a1a1a', fontWeight: 600 }}>N64 Classic Edition</span>
          </div>

          {/* Top: Gallery + Price Panel */}
          <div className="flex gap-6 mb-6">
            {/* Image Gallery — left ~60% */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 gap-2 h-72">
                {/* Main large image */}
                <div className="relative rounded-2xl overflow-hidden row-span-1"
                  style={{ background: 'linear-gradient(135deg, #e8e8e8, #d4d4d4)' }}>
                  <div className="w-full h-full flex items-center justify-center text-7xl">🕹️</div>
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                    style={{ backgroundColor: '#2BA8A2', color: '#fff' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" /> Mint
                  </span>
                </div>

                {/* Right thumbnails column */}
                <div className="flex flex-col gap-2">
                  <div className="flex-1 rounded-2xl overflow-hidden flex items-center justify-center text-4xl"
                    style={{ backgroundColor: '#e5f9f8' }}>🎮</div>
                  <div className="flex-1 rounded-2xl overflow-hidden flex items-center justify-center font-bold relative cursor-pointer"
                    style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
                    <div className="text-center">
                      <div className="text-lg font-black">+3</div>
                      <div className="text-xs font-normal">Photos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price / Cart Panel — right ~40% */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-4">
              {/* Price card */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.1)' }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Buy It Now</div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl font-black" style={{ color: '#1a1a1a' }}>$245</div>
                  <button className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: '#e5e7eb' }}>
                    <Heart size={16} style={{ color: '#EF6C4A' }} />
                  </button>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-semibold" style={{ color: '#4a6b66' }}>Quantity</span>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: '#EF6C4A', boxShadow: '0 4px 12px rgba(239,108,74,0.3)' }}>
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">1</span>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: '#2BA8A2', boxShadow: '0 4px 12px rgba(43,168,162,0.3)' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="rounded-xl p-3 mb-4 flex flex-col gap-2" style={{ backgroundColor: '#f9fafb' }}>
                  {[
                    { label: 'Subtotal', value: '$245.00' },
                    { label: 'Shipping', value: '$15.00' },
                    { label: 'Platform Fee ⓘ', value: '$12.25' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm" style={{ color: '#4a6b66' }}>
                      <span>{label}</span><span>{value}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-1 flex justify-between font-black text-base" style={{ borderColor: '#e5e7eb', color: '#1a1a1a' }}>
                    <span>Total</span><span>$272.25</span>
                  </div>
                </div>

                <button className="w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: '#FFD23F', color: '#1a1a1a', boxShadow: '0 4px 20px rgba(255,210,63,0.4)' }}>
                  🛒 Add to Cart
                </button>
              </div>

              {/* Seller card */}
              <div className="rounded-2xl p-4" style={{ backgroundColor: '#EFF8F7', border: '1px solid #d1eeec' }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>About the Seller</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FFD23F, #E6B800)' }}>
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: '#1a1a1a' }}>R</div>
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: '#1a1a1a' }}>RetroKing99</div>
                    <div className="flex items-center gap-1">
                      <Shield size={11} style={{ color: '#2BA8A2' }} />
                      <div className="flex">
                        {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#FFD23F" style={{ color: '#FFD23F' }} />)}
                      </div>
                      <span className="text-xs" style={{ color: '#6b7280' }}>(428)</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2 rounded-full text-xs font-bold border transition-all hover:bg-white"
                  style={{ borderColor: '#2BA8A2', color: '#2BA8A2' }}>
                  Contact Seller
                </button>
              </div>
            </div>
          </div>

          {/* Bottom: Product title + Item Details */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.08)' }}>
            <h1 className="text-2xl font-black mb-4" style={{ color: '#1a1a1a' }}>N64 Classic Edition Boxed</h1>
            <div className="font-bold text-sm mb-2" style={{ color: '#2BA8A2' }}>Item Details</div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#4a6b66' }}>
              Complete in box (CIB) Nintendo 64. Original grey model, tested and working perfectly. Includes one original grey controller with a tight analog stick, power supply, and standard AV cables. Box shows minor shelf wear typical for its age but maintains vibrant colors and structural integrity. A perfect centerpiece for any retro collection.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {[{ label: 'Condition', value: 'Excellent (CIB)' }, { label: 'Platform', value: 'Nintendo 64' }].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3" style={{ backgroundColor: '#f3f4f6' }}>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>{label}</div>
                  <div className="font-bold text-sm mt-0.5" style={{ color: '#1a1a1a' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t py-5 px-8 text-center" style={{ borderColor: '#e5e7eb', backgroundColor: '#fff' }}>
          <div className="font-black text-base mb-2" style={{ color: '#2BA8A2' }}>Flip7Market</div>
          <div className="flex items-center justify-center gap-5 mb-2">
            {['Terms of Service', 'Privacy Policy', 'Contact Support', 'Sell on Flip7'].map(l => (
              <a key={l} href="#" className="text-xs" style={{ color: '#9ca3af' }}>{l}</a>
            ))}
          </div>
          <div className="text-xs" style={{ color: '#d1d5db' }}>© 2024 Flip7 Retro Market. All Rights Reserved.</div>
        </footer>
      </div>
    </div>
  )
}
