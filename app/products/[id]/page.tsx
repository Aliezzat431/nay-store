import { notFound } from 'next/navigation'
import { createAnonClient } from '@/lib/supabase-server'
import Navbar from '@/components/navbar'
import Link from 'next/link'
import { ChevronRight, Shield, Star } from 'lucide-react'
import AddToCartButton from '@/components/add-to-cart-button'

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

async function getProduct(id: string) {
  const supabase = createAnonClient()
  const { data } = await supabase
    .from('products')
    .select('*, vendors(id, store_name, trust_score, stripe_account_id)')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  return data
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  const vendor = product.vendors as {
    id: string; store_name: string; trust_score: number; stripe_account_id: string
  } | null

  const platformFee = Number(product.price) * 0.05
  const shipping = 15
  const total = Number(product.price) + shipping + platformFee

  return (
    <div className="min-h-screen" style={{ backgroundColor: ds.surface, fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)' }}>
      <Navbar />

      <main className="pt-20 max-w-5xl mx-auto px-6 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#6b7280' }}>
          <Link href="/" style={{ color: ds.teal }}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace" style={{ color: ds.teal }}>Marketplace</Link>
          <ChevronRight size={12} />
          <Link href={`/marketplace?category=${encodeURIComponent(product.category)}`} style={{ color: ds.teal }}>
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: ds.onSurface, fontWeight: 600 }}>{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: product display */}
          <div className="flex-1">
            {/* Main image */}
            <div className="rounded-3xl flex items-center justify-center py-20 text-8xl mb-4 relative"
              style={{ backgroundColor: ds.surfaceLow }}>
              {product.emoji}
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black"
                style={{ backgroundColor: ds.teal, color: '#fff' }}>
                {product.condition}
              </span>
              {product.stock <= 2 && (
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black"
                  style={{ backgroundColor: ds.coral, color: '#fff' }}>
                  Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Product details */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.08)' }}>
              <h1 className="text-2xl font-black mb-2" style={{ color: ds.onSurface }}>{product.name}</h1>
              <div className="text-sm font-bold mb-4" style={{ color: ds.teal }}>{product.category}</div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: ds.onSurfaceVar }}>
                {product.description}
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <div className="rounded-xl p-3" style={{ backgroundColor: '#f3f4f6' }}>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>Condition</div>
                  <div className="font-bold text-sm mt-0.5" style={{ color: ds.onSurface }}>{product.condition}</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: '#f3f4f6' }}>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>Category</div>
                  <div className="font-bold text-sm mt-0.5" style={{ color: ds.onSurface }}>{product.category}</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: '#f3f4f6' }}>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>In Stock</div>
                  <div className="font-bold text-sm mt-0.5" style={{ color: ds.onSurface }}>{product.stock} units</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: price panel */}
          <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">

            {/* Price card */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.1)' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Buy It Now</div>
              <div className="text-4xl font-black mb-4" style={{ color: ds.onSurface }}>
                ${Number(product.price).toFixed(2)}
              </div>

              {/* Price breakdown */}
              <div className="rounded-xl p-3 mb-4 flex flex-col gap-2" style={{ backgroundColor: '#f9fafb' }}>
                {[
                  { label: 'Subtotal', value: `$${Number(product.price).toFixed(2)}` },
                  { label: 'Shipping', value: `$${shipping.toFixed(2)}` },
                  { label: 'Platform Fee (5%) ⓘ', value: `$${platformFee.toFixed(2)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm" style={{ color: ds.onSurfaceVar }}>
                    <span>{label}</span><span>{value}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-1 flex justify-between font-black text-base"
                  style={{ borderColor: ds.outline, color: ds.onSurface }}>
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>

              <AddToCartButton product={{
                product_id:        product.id,
                id:                product.id,
                name:              product.name,
                price:             Number(product.price),
                emoji:             product.emoji,
                stock:             product.stock ?? 0,
                vendor_id:         vendor?.id ?? '',
                store_name:        vendor?.store_name ?? '',
                stripe_account_id: vendor?.stripe_account_id ?? '',
              }} />
            </div>

            {/* Seller card */}
            {vendor && (
              <div className="rounded-2xl p-4" style={{ backgroundColor: ds.surfaceLow, border: `1px solid ${ds.outline}` }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>About the Seller</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                    style={{ background: 'linear-gradient(135deg, #FFD23F, #E6B800)', color: ds.onSurface }}>
                    {vendor.store_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: ds.onSurface }}>{vendor.store_name}</div>
                    <div className="flex items-center gap-1">
                      <Shield size={11} style={{ color: ds.teal }} />
                      <div className="flex">
                        {[1,2,3,4,5].map(i => <Star key={i} size={11} fill={ds.gold} style={{ color: ds.gold }} />)}
                      </div>
                      <span className="text-xs" style={{ color: '#6b7280' }}>(verified)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mb-2" style={{ color: ds.onSurfaceVar }}>
                  <span>Trust Score</span>
                  <span className="font-black" style={{ color: ds.teal }}>{vendor.trust_score}/100</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
