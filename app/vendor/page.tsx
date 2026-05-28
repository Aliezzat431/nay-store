'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import VendorSidebar from '@/components/vendor-sidebar'
import { TrendingUp, ShoppingBag, Package, Star, ArrowUpRight, Loader2, RefreshCw, Eye } from 'lucide-react'

const ds = {
  teal: '#2BA8A2',
  gold: '#FFD23F',
  coral: '#f46f4d',
  surface: '#EFF8F7',
  onSurface: '#1a1a1a',
  onSurfaceVar: '#6b8f8b',
}

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  paid:       { bg: '#d1fae5', color: '#27AE60', label: 'Paid' },
  processing: { bg: '#e0f2fe', color: '#5DADE2', label: 'Processing' },
  shipped:    { bg: '#e0f2fe', color: '#5DADE2', label: 'Shipped' },
  delivered:  { bg: '#d1fae5', color: '#27AE60', label: 'Delivered' },
  pending:    { bg: '#FFF3CD', color: '#E6B800', label: 'Pending' },
  cancelled:  { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
}

interface DashboardData {
  totalRevenue: number
  activeOrders: number
  listedItems: number
  trustScore: number
  storeName: string
  status: string
  recentOrders: Array<{
    id: string
    item: string
    emoji: string
    total: string
    status: string
    date: string | null
  }>
  topProducts: Array<{
    name: string
    emoji: string
    revenue: number
    sold: number
  }>
}

export default function VendorDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchDashboard() {
    setLoading(true)
    try {
      const res = await fetch('/api/vendor/dashboard')
      if (res.status === 401) { router.push('/sign-in'); return }
      if (res.status === 404) { router.push('/vendor/onboarding'); return }
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: ds.surface }}>
        <VendorSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: ds.teal }} />
        </main>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    { label: 'Total Revenue', value: `$${data.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: ds.teal },
    { label: 'Active Orders', value: String(data.activeOrders), icon: ShoppingBag, color: ds.teal },
    { label: 'Listed Items', value: String(data.listedItems), icon: Package, color: ds.teal },
    { label: 'Trust Score', value: `${data.trustScore}/100`, icon: Star, color: ds.gold },
  ]

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: ds.surface, fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)' }}>
      <VendorSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-widest uppercase" style={{ color: ds.onSurface }}>Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: ds.onSurfaceVar }}>Welcome back, {data.storeName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors hover:bg-white"
              style={{ borderColor: '#bcc9c7', color: ds.onSurfaceVar }}>
              <RefreshCw size={14} />
              Refresh
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: data.status === 'approved' ? '#d1fae5' : '#FFF3CD', color: data.status === 'approved' ? '#27AE60' : '#E6B800' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.status === 'approved' ? '#27AE60' : '#E6B800' }} />
              {data.status === 'approved' ? 'Store Live' : 'Pending Approval'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>{label}</div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: ds.surface }}>
                  <Icon size={15} style={{ color }} />
                </div>
              </div>
              <div className="font-black text-2xl" style={{ color: ds.onSurface }}>{value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Recent Orders */}
          <div className="col-span-2 rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.08)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-sm" style={{ color: ds.onSurface }}>Recent Orders</h2>
            </div>
            {data.recentOrders.length === 0 ? (
              <div className="text-center py-10" style={{ color: ds.onSurfaceVar }}>
                <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">No orders yet</p>
                <p className="text-xs mt-1">Orders will appear here after your first sale</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {data.recentOrders.map(order => {
                  const s = statusStyle[order.status] ?? statusStyle.pending
                  return (
                    <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: '#f9fafb' }}>
                      <div className="text-xl w-8 text-center">{order.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs truncate" style={{ color: ds.onSurface }}>{order.item}</div>
                        <div className="text-xs font-mono" style={{ color: ds.onSurfaceVar }}>#{order.id}</div>
                      </div>
                      <div className="font-black text-sm" style={{ color: ds.onSurface }}>{order.total}</div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Top Products + Trust Score */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.08)' }}>
            <h2 className="font-black text-sm mb-4" style={{ color: ds.onSurface }}>Top Products</h2>
            {data.topProducts.length === 0 ? (
              <div className="text-center py-6" style={{ color: ds.onSurfaceVar }}>
                <Package size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">No sales yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.topProducts.map(product => (
                  <div key={product.name} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: ds.surface }}>{product.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs truncate mb-1" style={{ color: ds.onSurface }}>{product.name}</div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#9ca3af' }}>
                        <span className="flex items-center gap-0.5"><Eye size={11} /> ${product.revenue.toFixed(2)}</span>
                        <span className="flex items-center gap-0.5"><ShoppingBag size={11} /> {product.sold} sold</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
              <div className="text-xs font-bold mb-2" style={{ color: '#9ca3af' }}>Trust Score</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#e5e7eb' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${data.trustScore}%`, backgroundColor: ds.gold }} />
                </div>
                <span className="font-black text-sm" style={{ color: ds.onSurface }}>{data.trustScore}</span>
              </div>
              <div className="text-xs mt-1 font-semibold" style={{ color: data.trustScore >= 70 ? '#27AE60' : '#E6B800' }}>
                {data.trustScore >= 70 ? 'Excellent' : data.trustScore >= 40 ? 'Good' : 'Building'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
