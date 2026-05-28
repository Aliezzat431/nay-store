'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, BarChart2, Settings, Plus, HelpCircle, LogOut } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/vendor', icon: LayoutDashboard },
  { label: 'Inventory', href: '/vendor/inventory', icon: Package },
  { label: 'Orders', href: '/vendor/orders', icon: ShoppingBag },
  { label: 'Analytics', href: '/vendor/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/vendor/settings', icon: Settings },
]

export default function VendorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  return (
    <aside className="flex flex-col w-52 min-h-screen py-6 px-4" style={{ backgroundColor: '#FFF8E7', borderRight: '1px solid #e8dcc0' }}>
      <div className="mb-8">
        <div className="font-black text-base" style={{ color: '#164E44' }}>Vendor Portal</div>
        <div className="text-xs font-medium mt-0.5" style={{ color: '#6b8f8b' }}>Shop Management</div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: active ? '#2BA8A2' : 'transparent',
                color: active ? '#fff' : '#4a6b66',
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={() => router.push('/vendor/inventory')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105"
          style={{ backgroundColor: '#FFD23F', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(255,210,63,0.35)' }}
        >
          <Plus size={15} />
          Add New Product
        </button>
        <Link href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium" style={{ color: '#6b8f8b' }}>
          <HelpCircle size={15} /> Support
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium" style={{ color: '#EF6C4A' }}>
          <LogOut size={15} /> Log Out
        </Link>
      </div>
    </aside>
  )
}
