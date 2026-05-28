'use client'

import AdminSidebar from '@/components/admin-sidebar'
import { useState, useEffect, useCallback } from 'react'
import { Check, X, Info, Loader2, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react'

const ds = {
  teal:        '#2BA8A2',
  gold:        '#FFD23F',
  coral:       '#f46f4d',
  surface:     '#f2fbfa',
  surfaceLow:  '#ecf5f4',
  onSurface:   '#151d1d',
  onSurfaceVar:'#3d4948',
  outline:     '#bcc9c7',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  draft:          { label: 'Draft',          color: '#6b7280', bg: '#f3f4f6',  icon: <Clock size={12} /> },
  pending_review: { label: 'Pending Review', color: '#d97706', bg: '#FFF8E1', icon: <Clock size={12} /> },
  approved:       { label: 'Approved',       color: '#16a34a', bg: '#E8F5E9', icon: <CheckCircle size={12} /> },
  rejected:       { label: 'Rejected',       color: '#dc2626', bg: '#FFEBEE', icon: <XCircle size={12} /> },
  info_requested: { label: 'Info Requested', color: '#9333ea', bg: '#F3E8FF', icon: <Info size={12} /> },
}

interface Vendor {
  id: string
  store_name: string | null
  business_name: string | null
  business_type: string | null
  business_email: string | null
  business_phone: string | null
  business_address: string | null
  business_city: string | null
  business_state: string | null
  business_country: string | null
  tax_id: string | null
  status: string
  admin_notes: string | null
  submitted_at: string | null
  reviewed_at: string | null
  trust_score: number
  stripe_onboarding_complete: boolean
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [acting, setActing] = useState(false)
  const [filter, setFilter] = useState<string>('pending_review')

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/vendors')
      const data = await res.json()
      setVendors(data.vendors ?? [])
    } catch {
      console.error('Failed to fetch vendors')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVendors() }, [fetchVendors])

  async function handleReview(id: string, action: 'approve' | 'reject' | 'request_info') {
    setActing(true)
    try {
      const res = await fetch(`/api/admin/vendors/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      })
      if (res.ok) {
        setSelectedId(null)
        setNotes('')
        await fetchVendors()
      }
    } finally {
      setActing(false)
    }
  }

  const filtered = filter === 'all' ? vendors : vendors.filter(v => v.status === filter)
  const counts = {
    all: vendors.length,
    pending_review: vendors.filter(v => v.status === 'pending_review').length,
    approved: vendors.filter(v => v.status === 'approved').length,
    rejected: vendors.filter(v => v.status === 'rejected').length,
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: ds.surface, fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)' }}>
      <AdminSidebar />

      <main className="flex-1 p-8 ml-64">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black" style={{ color: ds.onSurface }}>Vendor Applications</h1>
            <p className="text-sm mt-0.5" style={{ color: ds.onSurfaceVar }}>Review and manage seller applications</p>
          </div>
          <button onClick={fetchVendors}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors hover:bg-white"
            style={{ borderColor: ds.outline, color: ds.onSurfaceVar }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {([
            ['all', 'All'],
            ['pending_review', 'Pending Review'],
            ['approved', 'Approved'],
            ['rejected', 'Rejected'],
          ] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: filter === key ? ds.teal : '#fff',
                color: filter === key ? '#fff' : ds.onSurfaceVar,
                border: `1px solid ${filter === key ? ds.teal : ds.outline}`,
              }}>
              {label}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                style={{ backgroundColor: filter === key ? 'rgba(255,255,255,0.2)' : ds.surfaceLow }}>
                {counts[key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin" style={{ color: ds.teal }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: ds.onSurfaceVar }}>
            <p className="font-semibold">No vendors in this category.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(vendor => {
              const statusCfg = STATUS_CONFIG[vendor.status] ?? STATUS_CONFIG.draft
              const isSelected = selectedId === vendor.id
              return (
                <div key={vendor.id}
                  className="rounded-2xl p-6 transition-all"
                  style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(43,168,162,0.08)', border: `1px solid ${isSelected ? ds.teal : ds.outline}` }}>

                  <div className="flex items-start justify-between gap-4">
                    {/* Left: vendor info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #FFD23F, #E6B800)', color: ds.onSurface }}>
                          {(vendor.store_name ?? 'V').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-base" style={{ color: ds.onSurface }}>
                            {vendor.store_name ?? '—'}
                          </div>
                          <div className="text-xs" style={{ color: ds.onSurfaceVar }}>
                            {vendor.business_name} · {vendor.business_type}
                          </div>
                        </div>
                        <span className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-3" style={{ color: ds.onSurfaceVar }}>
                        {vendor.business_email && <span>✉ {vendor.business_email}</span>}
                        {vendor.business_phone && <span>📞 {vendor.business_phone}</span>}
                        {vendor.business_address && (
                          <span className="col-span-2">
                            📍 {[vendor.business_address, vendor.business_city, vendor.business_state, vendor.business_country].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {vendor.tax_id && <span>🪪 Tax ID: {vendor.tax_id}</span>}
                        {vendor.submitted_at && (
                          <span>Submitted: {new Date(vendor.submitted_at).toLocaleDateString()}</span>
                        )}
                        <span>Trust Score: {vendor.trust_score}/100</span>
                        <span>Stripe: {vendor.stripe_onboarding_complete ? '✓ Connected' : '✗ Not connected'}</span>
                      </div>

                      {vendor.admin_notes && (
                        <div className="rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}>
                          Admin note: {vendor.admin_notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (only for actionable statuses) */}
                  {['pending_review', 'info_requested', 'draft'].includes(vendor.status) && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: ds.outline }}>
                      {!isSelected ? (
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedId(vendor.id); setNotes('') }}
                            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                            style={{ backgroundColor: '#E8F5E9', color: '#16a34a' }}>
                            <Check size={13} /> Approve
                          </button>
                          <button onClick={() => { setSelectedId(vendor.id + '_reject'); setNotes('') }}
                            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                            style={{ backgroundColor: '#FFEBEE', color: '#dc2626' }}>
                            <X size={13} /> Reject
                          </button>
                          <button onClick={() => { setSelectedId(vendor.id + '_info'); setNotes('') }}
                            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                            style={{ backgroundColor: '#F3E8FF', color: '#9333ea' }}>
                            <Info size={13} /> Request Info
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder={
                              selectedId === vendor.id ? 'Optional note for the vendor...' :
                              selectedId === vendor.id + '_reject' ? 'Reason for rejection (shown to vendor)...' :
                              'What additional info do you need?'
                            }
                            rows={2}
                            className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
                            style={{ borderColor: ds.outline, color: ds.onSurface, backgroundColor: ds.surfaceLow }}
                          />
                          <div className="flex gap-2">
                            {selectedId === vendor.id && (
                              <button onClick={() => handleReview(vendor.id, 'approve')} disabled={acting}
                                className="px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 disabled:opacity-60"
                                style={{ backgroundColor: '#16a34a', color: '#fff' }}>
                                {acting ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                                Confirm Approve
                              </button>
                            )}
                            {selectedId === vendor.id + '_reject' && (
                              <button onClick={() => handleReview(vendor.id, 'reject')} disabled={acting}
                                className="px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 disabled:opacity-60"
                                style={{ backgroundColor: '#dc2626', color: '#fff' }}>
                                {acting ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />}
                                Confirm Reject
                              </button>
                            )}
                            {selectedId === vendor.id + '_info' && (
                              <button onClick={() => handleReview(vendor.id, 'request_info')} disabled={acting}
                                className="px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 disabled:opacity-60"
                                style={{ backgroundColor: '#9333ea', color: '#fff' }}>
                                {acting ? <Loader2 size={12} className="animate-spin" /> : <Info size={13} />}
                                Send Request
                              </button>
                            )}
                            <button onClick={() => setSelectedId(null)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold border"
                              style={{ borderColor: ds.outline, color: ds.onSurfaceVar }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Already-approved: show re-action options */}
                  {vendor.status === 'approved' && (
                    <div className="mt-3 pt-3 border-t flex gap-2" style={{ borderColor: ds.outline }}>
                      <button onClick={() => handleReview(vendor.id, 'reject')} disabled={acting}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold"
                        style={{ backgroundColor: '#FFEBEE', color: '#dc2626' }}>
                        Revoke Approval
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
