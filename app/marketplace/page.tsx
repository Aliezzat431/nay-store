import Link from 'next/link'
import Image from 'next/image'
import { createAnonClient } from '@/lib/supabase-server'
import Navbar from '@/components/navbar'
import { ChevronRight, Shield } from 'lucide-react'

const ds = {
  tealDark:    '#1E8C86',
  teal:        '#2BA8A2',
  gold:        '#FFD23F',
  coral:       '#f46f4d',
  cream:       '#FFF8E7',
  surface:     '#f2fbfa',
  surfaceLow:  '#ecf5f4',
  onSurface:   '#151d1d',
  onSurfaceVar:'#3d4948',
  outline:     '#bcc9c7',
}

const categories = ['All', 'Retro Consoles', 'Electronics', 'Trading Cards', 'Vinyl Records', 'Vintage Toys', 'Kitchenware', 'Photography', 'Jewelry']

interface SearchParams { category?: string }

async function getProducts(category?: string) {
  const supabase = createAnonClient()
  let query = supabase
    .from('products')
    .select('id, name, description, price, category, condition, emoji, image_url, stock, vendors(store_name, trust_score)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data } = await query
  return data ?? []
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { category } = await searchParams
  const products = await getProducts(category)

  return (
    <div className="min-h-screen" style={{ backgroundColor: ds.surface, fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)' }}>
      <Navbar />

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 flex flex-col py-6 px-4 border-r min-h-screen"
          style={{ backgroundColor: '#fff', borderColor: ds.outline }}>
          <div className="font-black text-xs uppercase tracking-widest mb-4" style={{ color: '#9ca3af' }}>Categories</div>
          {categories.map(cat => {
            const active = (category ?? 'All') === cat
            return (
              <Link key={cat} href={cat === 'All' ? '/marketplace' : `/marketplace?category=${encodeURIComponent(cat)}`}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-full text-xs font-semibold mb-1 transition-all"
                style={{ backgroundColor: active ? ds.teal : 'transparent', color: active ? '#fff' : ds.onSurfaceVar }}>
                {active && <div className="w-2 h-2 rounded-full bg-white/80 flex-shrink-0" />}
                {cat}
              </Link>
            )
          })}

          <div className="mt-6">
            <div className="font-black text-xs uppercase tracking-widest mb-3" style={{ color: '#9ca3af' }}>Filters</div>
            <label className="flex items-center gap-2 text-xs font-medium mb-2 cursor-pointer" style={{ color: ds.onSurfaceVar }}>
              <div className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                style={{ borderColor: ds.outline, backgroundColor: '#fff' }} />
              Verified Sellers
            </label>
            <label className="flex items-center gap-2 text-xs font-medium mb-2 cursor-pointer" style={{ color: ds.onSurfaceVar }}>
              <div className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                style={{ borderColor: ds.outline, backgroundColor: '#fff' }} />
              In Stock
            </label>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-6 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#6b7280' }}>
            <Link href="/" style={{ color: ds.teal }}>Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: ds.onSurface, fontWeight: 600 }}>Marketplace{category ? ` / ${category}` : ''}</span>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="font-black text-xl" style={{ color: ds.onSurface }}>
              {category ?? 'All Products'}
              <span className="ml-2 text-sm font-semibold" style={{ color: ds.onSurfaceVar }}>({products.length} items)</span>
            </h1>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🎲</div>
              <div className="font-black text-lg mb-2" style={{ color: ds.onSurface }}>No items found</div>
              <div className="text-sm" style={{ color: ds.onSurfaceVar }}>Try a different category</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => {
                const vendorRaw = product.vendors
                const vendor = (Array.isArray(vendorRaw) ? vendorRaw[0] : vendorRaw) as { store_name: string; trust_score: number } | null
                return (
                  <Link href={`/products/${product.id}`} key={product.id}
                    className={`rounded-2xl overflow-hidden flex flex-col transition-all ${product.stock > 0 ? 'hover:scale-[1.02]' : 'opacity-60'}`}
                    style={{ backgroundColor: '#fff', boxShadow: '0 2px 16px rgba(43,168,162,0.10)', border: `1px solid ${ds.outline}` }}>

                    <div className="relative flex items-center justify-center text-6xl overflow-hidden"
                      style={{ backgroundColor: ds.surfaceLow, height: '180px' }}>
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="py-8">{product.emoji ?? '📦'}</span>
                      )}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-black z-10"
                        style={{ backgroundColor: ds.gold, color: ds.onSurface }}>
                        ${Number(product.price).toFixed(0)}
                      </span>
                      {product.condition && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold z-10"
                          style={{ backgroundColor: ds.teal, color: '#fff' }}>
                          {product.condition}
                        </span>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center z-20"
                          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                          <span className="px-3 py-1 rounded-full text-xs font-black"
                            style={{ backgroundColor: '#1f2937', color: '#fff' }}>
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <div className="font-bold text-sm mb-0.5" style={{ color: ds.onSurface }}>{product.name}</div>
                      {product.category && (
                        <div className="text-xs mb-2" style={{ color: ds.onSurfaceVar }}>{product.category}</div>
                      )}

                      {vendor && (
                        <div className="flex items-center gap-1 mb-3">
                          <Shield size={10} style={{ color: ds.teal }} />
                          <span className="text-xs" style={{ color: ds.onSurfaceVar }}>{vendor.store_name}</span>
                        </div>
                      )}

                      <div className="mt-auto w-full py-2 rounded-full text-xs font-black text-center"
                        style={{ backgroundColor: product.stock === 0 ? '#e5e7eb' : ds.teal, color: product.stock === 0 ? '#9ca3af' : '#fff' }}>
                        {product.stock === 0 ? 'Out of Stock' : 'View Item'}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
