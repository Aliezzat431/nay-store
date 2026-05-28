import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase-server'
import Navbar from '@/components/navbar'
import {
  User, Mail, Calendar, ShoppingBag, Package,
  Store, Star, Shield, ArrowUpRight, ChevronRight,
} from 'lucide-react'

const ds = {
  teal:        '#2BA8A2',
  tealDark:    '#1E8C86',
  gold:        '#FFD23F',
  coral:       '#f46f4d',
  surface:     '#f2fbfa',
  surfaceLow:  '#ecf5f4',
  onSurface:   '#151d1d',
  onSurfaceVar:'#3d4948',
  outline:     '#bcc9c7',
}

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [clerkUser, supabase] = await Promise.all([
    currentUser(),
    Promise.resolve(createServiceClient()),
  ])

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, store_name, status, trust_score, store_description, business_email, created_at')
    .eq('clerk_user_id', userId)
    .single()

  const { count: orderCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('buyer_clerk_id', userId)

  let productCount = 0
  if (vendor?.id) {
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .eq('is_active', true)
    productCount = count ?? 0
  }

  const name = clerkUser?.fullName
    ?? clerkUser?.firstName
    ?? profile?.full_name
    ?? 'Member'

  const email = clerkUser?.emailAddresses?.[0]?.emailAddress
    ?? profile?.email
    ?? '—'

  const role: string = profile?.role ?? 'buyer'
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—'

  const avatarUrl = clerkUser?.imageUrl

  const vendorStatusColor: Record<string, { bg: string; color: string; label: string }> = {
    approved: { bg: '#d1fae5', color: '#27AE60', label: 'Approved' },
    pending:  { bg: '#FFF3CD', color: '#E6B800', label: 'Pending Review' },
    draft:    { bg: '#f3f4f6', color: '#6b7280', label: 'Draft' },
    active:   { bg: '#d1fae5', color: '#27AE60', label: 'Active' },
    rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: ds.surface, fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)' }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-16 flex flex-col gap-5">

        {/* Avatar + name card */}
        <div className="rounded-3xl p-7" style={{ backgroundColor: '#fff', boxShadow: '0 4px 24px rgba(43,168,162,0.08)' }}>
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} width={80} height={80}
                className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                style={{ boxShadow: '0 4px 16px rgba(43,168,162,0.2)' }} />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: ds.surfaceLow }}>
                <User size={32} style={{ color: ds.teal }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-2xl truncate" style={{ color: ds.onSurface }}>{name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wide"
                  style={{
                    backgroundColor: role === 'vendor' ? '#FFF8E7' : ds.surfaceLow,
                    color: role === 'vendor' ? '#b8860b' : ds.teal,
                  }}>
                  {role === 'vendor' ? '🏪 Vendor' : '🛍 Buyer'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm" style={{ color: ds.onSurfaceVar }}>
              <Mail size={15} style={{ color: ds.outline }} />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: ds.onSurfaceVar }}>
              <Calendar size={15} style={{ color: ds.outline }} />
              <span>Member since {joinedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: ds.onSurfaceVar }}>
              <Shield size={15} style={{ color: ds.outline }} />
              <span className="font-mono text-xs">{userId}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 4px 24px rgba(43,168,162,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>Orders Placed</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: ds.surfaceLow }}>
                <ShoppingBag size={15} style={{ color: ds.teal }} />
              </div>
            </div>
            <div className="font-black text-3xl" style={{ color: ds.onSurface }}>{orderCount ?? 0}</div>
            <Link href="/orders" className="flex items-center gap-1 text-xs font-semibold mt-2 hover:underline"
              style={{ color: ds.teal }}>
              View orders <ArrowUpRight size={12} />
            </Link>
          </div>

          {role === 'vendor' && (
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 4px 24px rgba(43,168,162,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>Listed Products</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF8E7' }}>
                  <Package size={15} style={{ color: ds.gold }} />
                </div>
              </div>
              <div className="font-black text-3xl" style={{ color: ds.onSurface }}>{productCount}</div>
              <Link href="/vendor" className="flex items-center gap-1 text-xs font-semibold mt-2 hover:underline"
                style={{ color: ds.teal }}>
                Go to dashboard <ArrowUpRight size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* Vendor store card */}
        {vendor && (
          <div className="rounded-3xl p-6" style={{ backgroundColor: '#fff', boxShadow: '0 4px 24px rgba(43,168,162,0.08)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF8E7' }}>
                  <Store size={18} style={{ color: ds.gold }} />
                </div>
                <div>
                  <div className="font-black text-base" style={{ color: ds.onSurface }}>{vendor.store_name}</div>
                  <div className="text-xs" style={{ color: ds.onSurfaceVar }}>Your store</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: vendorStatusColor[vendor.status ?? 'draft']?.bg ?? '#f3f4f6',
                  color: vendorStatusColor[vendor.status ?? 'draft']?.color ?? '#6b7280',
                }}>
                {vendorStatusColor[vendor.status ?? 'draft']?.label ?? vendor.status}
              </span>
            </div>

            {vendor.store_description && (
              <p className="text-sm mb-4" style={{ color: ds.onSurfaceVar }}>{vendor.store_description}</p>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: ds.onSurfaceVar }}>
                  <span className="flex items-center gap-1"><Star size={11} /> Trust Score</span>
                  <span style={{ color: ds.onSurface }}>{vendor.trust_score ?? 0}/100</span>
                </div>
                <div className="h-2 rounded-full" style={{ backgroundColor: ds.surfaceLow }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${vendor.trust_score ?? 0}%`, backgroundColor: ds.gold }} />
                </div>
              </div>
            </div>

            <Link href="/vendor"
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.01]"
              style={{ backgroundColor: ds.surfaceLow, color: ds.tealDark }}>
              Open Vendor Dashboard
              <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {/* If buyer with no vendor account */}
        {role === 'buyer' && !vendor && (
          <div className="rounded-3xl p-6 border-2 border-dashed" style={{ borderColor: ds.outline }}>
            <div className="flex items-center gap-3 mb-3">
              <Store size={20} style={{ color: ds.outline }} />
              <span className="font-bold text-sm" style={{ color: ds.onSurfaceVar }}>Want to sell on Flip7?</span>
            </div>
            <p className="text-xs mb-4" style={{ color: ds.onSurfaceVar }}>
              Set up a store, list your items, and start earning. Takes less than 5 minutes.
            </p>
            <Link href="/sign-up?role=vendor"
              className="px-5 py-2.5 rounded-full font-black text-sm inline-flex items-center gap-2 transition-all hover:scale-105"
              style={{ backgroundColor: ds.gold, color: ds.onSurface, boxShadow: '0 4px 16px rgba(255,210,63,0.4)' }}>
              Become a Vendor 🚀
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
