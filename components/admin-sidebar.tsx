'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ShoppingBag, BarChart2, Settings, Shield, HelpCircle, LogOut } from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Vendors', href: '/admin/vendors', icon: Users },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="flex flex-col w-52 min-h-screen py-6 px-4" style={{ backgroundColor: '#164E44', borderRight: '1px solid #0f3830' }}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} color="#FFD23F" />
          <div className="font-black text-base text-white">Admin Panel</div>
        </div>
        <div className="text-xs font-medium mt-0.5" style={{ color: '#6db8b2' }}>Flip7 Market</div>
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
                color: active ? '#fff' : '#a8d5d2',
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-2 mt-6">
        <Link href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium" style={{ color: '#6db8b2' }}>
          <HelpCircle size={15} /> Support
        </Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-2 text-sm font-medium" style={{ color: '#EF6C4A' }}>
          <LogOut size={15} /> Log Out
        </Link>
      </div>
    </aside>
  )
}
