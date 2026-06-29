'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Bell, CheckCircle, XCircle, Loader2, FileText, Shield, Building2 } from 'lucide-react'

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

const INPUT = {
  borderColor: '#bcc9c7',
  color: '#151d1d',
  backgroundColor: '#ecf5f4',
}

type VendorStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'info_requested'

interface VendorData {
  id?: string
  status?: VendorStatus
  store_name?: string
  business_name?: string
  business_type?: string
  store_description?: string
  business_email?: string
  business_phone?: string
  business_address?: string
  business_city?: string
  business_state?: string
  business_country?: string
  tax_id?: string
  admin_notes?: string
  identity_verified?: boolean
  store_policy_accepted?: boolean
  kashier_onboarding_complete?: boolean
  payout_setup?: boolean
}

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  draft:          { label: '✏ DRAFT',           bg: '#f3f4f6', color: '#6b7280' },
  pending_review: { label: '⏳ PENDING REVIEW',  bg: '#FFD23F', color: '#7a5a00' },
  approved:       { label: '✅ APPROVED',         bg: '#dcfce7', color: '#15803d' },
  rejected:       { label: '✗ NOT APPROVED',     bg: '#fee2e2', color: '#dc2626' },
  info_requested: { label: '💬 INFO REQUESTED',  bg: '#ede9fe', color: '#7c3aed' },
}

function calcTrustScore(v: VendorData): number {
  let s = 0
  if (v.identity_verified)       s += 30  // document scan
  if (v.business_name)           s += 15  // business reg
  if (v.store_policy_accepted)   s += 15  // policy
  if (v.kashier_onboarding_complete) s += 25 // bank link
  if (v.status === 'approved')   s += 15  // admin trust
  return Math.min(s, 100)
}

function TrustCircle({ score }: { score: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 70 ? ds.teal : score >= 40 ? ds.gold : ds.coral

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" style={{ overflow: 'visible' }}>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x="55" y="50" textAnchor="middle" fontSize="26" fontWeight="900" fill={ds.onSurface}>{score}</text>
      <text x="55" y="68" textAnchor="middle" fontSize="11" fill="#9ca3af">/100</text>
    </svg>
  )
}

export default function VendorOnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [vendor, setVendor] = useState<VendorData | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [policyChecked, setPolicyChecked] = useState(false)
  const [acceptingPolicy, setAcceptingPolicy] = useState(false)

  const [form, setForm] = useState({
    store_name: '',
    business_name: '',
    business_type: 'individual',
    store_description: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    business_city: '',
    business_state: '',
    business_country: 'US',
    tax_id: '',
  })

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push('/sign-in'); return }
    loadVendor()
  }, [isLoaded, user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadVendor() {
    setLoading(true)
    try {
      const res = await fetch('/api/vendor/me')
      const data = await res.json()
      // /api/vendor/me returns flat object, not { vendor: ... }
      const v: VendorData | null = data?.id ? data : null
      setVendor(v)
      if (v) {
        setForm({
          store_name:       v.store_name       ?? '',
          business_name:    v.business_name    ?? '',
          business_type:    v.business_type    ?? 'individual',
          store_description:v.store_description?? '',
          business_email:   v.business_email   ?? '',
          business_phone:   v.business_phone   ?? '',
          business_address: v.business_address ?? '',
          business_city:    v.business_city    ?? '',
          business_state:   v.business_state   ?? '',
          business_country: v.business_country ?? 'US',
          tax_id:           v.tax_id           ?? '',
        })
        // Skip step 1 if they've already submitted
        if (v.identity_verified || v.status !== 'draft') setStep(2)
        // Fully onboarded → dashboard
        if (v.status === 'approved' && v.kashier_onboarding_complete) {
          router.push('/vendor')
        }
      }
    } catch {
      setError('Could not load your vendor data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/vendor/submit-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to save. Please try again.'); return }
      await loadVendor()
      setStep(2)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAcceptPolicy() {
    setAcceptingPolicy(true)
    setError('')
    try {
      const res = await fetch('/api/vendor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_policy_accepted: true }),
      })
      if (!res.ok) { setError('Failed to accept policy.'); return }
      setVendor(v => v ? { ...v, store_policy_accepted: true } : v)
    } catch {
      setError('Failed to accept policy.')
    } finally {
      setAcceptingPolicy(false)
    }
  }

  async function handleKashierConnect() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/vendor/kashier-connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error ?? 'Could not start Kashier setup.')
    } catch {
      setError('Could not connect Kashier. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const trust = vendor ? calcTrustScore(vendor) : 0
  const status = (vendor?.status ?? 'draft') as VendorStatus
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.draft

  const identityDone = !!vendor?.identity_verified
  const policyDone   = !!vendor?.store_policy_accepted
  const kashierDone   = !!vendor?.kashier_onboarding_complete

  const steps = [
    { n: 1, label: 'Store Details', active: step === 1, done: step === 2 },
    { n: 2, label: 'Verification',  active: step === 2, done: status === 'approved' && kashierDone },
    { n: 3, label: 'Launch',        active: false, done: false },
  ]

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: ds.surface }}>
        <Loader2 size={36} className="animate-spin" style={{ color: ds.teal }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: ds.surface, fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)' }}>

      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-4">
        <Link href="/" className="font-black text-lg tracking-widest" style={{ color: ds.tealDark }}>
          FLIP7 MARKET
        </Link>
        <div className="flex items-center gap-4" style={{ color: ds.onSurfaceVar }}>
          <Bell size={20} />
          <ShoppingCart size={20} />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-16 pt-4">

        {/* Step progress */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                  style={{
                    backgroundColor: s.active ? ds.gold : s.done ? ds.teal : 'transparent',
                    color: s.active ? ds.onSurface : s.done ? '#fff' : '#9ca3af',
                    border: s.active || s.done ? 'none' : '2px solid #d1d5db',
                  }}>
                  {s.done ? '✓' : s.n}
                </div>
                <span className="text-xs font-semibold"
                  style={{ color: s.active ? ds.onSurface : s.done ? ds.teal : '#9ca3af' }}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className="flex gap-1 mx-2 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="w-2.5 h-0.5 rounded-full"
                      style={{ backgroundColor: s.done ? ds.teal : '#d1d5db' }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ──────── STEP 1: STORE DETAILS ──────── */}
        {step === 1 && (
          <form onSubmit={handleSaveDetails}
            className="rounded-3xl p-8 border"
            style={{ backgroundColor: '#fff', borderColor: ds.outline, boxShadow: '0 4px 30px rgba(43,168,162,0.08)' }}>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: ds.surfaceLow }}>
                <FileText size={16} style={{ color: ds.teal }} />
              </div>
              <h2 className="text-lg font-black" style={{ color: ds.onSurface }}>Store Details</h2>
            </div>
            <p className="text-sm mb-6 ml-11" style={{ color: ds.onSurfaceVar }}>
              Tell us about your business so our team can verify it.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: ds.onSurfaceVar }}>Store Name *</label>
                <input value={form.store_name} onChange={e => setForm(p => ({ ...p, store_name: e.target.value }))}
                  placeholder="e.g. RetroKing99" required
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ring-teal-300" style={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: ds.onSurfaceVar }}>Legal Business Name *</label>
                <input value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))}
                  placeholder="e.g. Walaa Trading LLC" required
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ring-teal-300" style={INPUT} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold mb-1" style={{ color: ds.onSurfaceVar }}>Business Type</label>
              <select value={form.business_type} onChange={e => setForm(p => ({ ...p, business_type: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={INPUT}>
                <option value="individual">Individual / Sole Trader</option>
                <option value="llc">LLC</option>
                <option value="corporation">Corporation</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold mb-1" style={{ color: ds.onSurfaceVar }}>Store Description</label>
              <textarea value={form.store_description} onChange={e => setForm(p => ({ ...p, store_description: e.target.value }))}
                placeholder="What will you sell? Tell buyers about your store..." rows={3}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none" style={INPUT} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: ds.onSurfaceVar }}>Business Email *</label>
                <input type="email" value={form.business_email} onChange={e => setForm(p => ({ ...p, business_email: e.target.value }))}
                  placeholder="store@example.com" required
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: ds.onSurfaceVar }}>Phone Number</label>
                <input type="tel" value={form.business_phone} onChange={e => setForm(p => ({ ...p, business_phone: e.target.value }))}
                  placeholder="+1 555 000 0000"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={INPUT} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold mb-1" style={{ color: ds.onSurfaceVar }}>Street Address</label>
              <input value={form.business_address} onChange={e => setForm(p => ({ ...p, business_address: e.target.value }))}
                placeholder="123 Main St"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={INPUT} />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { key: 'business_city',    label: 'City',    ph: 'New York' },
                { key: 'business_state',   label: 'State',   ph: 'NY' },
                { key: 'business_country', label: 'Country', ph: 'US' },
              ].map(({ key, label, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-bold mb-1" style={{ color: ds.onSurfaceVar }}>{label}</label>
                  <input value={form[key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={ph}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={INPUT} />
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold mb-1" style={{ color: ds.onSurfaceVar }}>Tax ID / EIN (optional)</label>
              <input value={form.tax_id} onChange={e => setForm(p => ({ ...p, tax_id: e.target.value }))}
                placeholder="XX-XXXXXXX"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none" style={INPUT} />
            </div>

            {error && <div className="text-xs text-red-600 mb-4 p-3 rounded-xl bg-red-50">{error}</div>}

            <button type="submit" disabled={saving}
              className="w-full py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ backgroundColor: ds.gold, color: ds.onSurface, boxShadow: '0 4px 20px rgba(255,210,63,0.4)' }}>
              {saving
                ? <Loader2 size={16} className="animate-spin" />
                : 'Continue to Verification →'}
            </button>
          </form>
        )}

        {/* ──────── STEP 2: VERIFICATION HUB ──────── */}
        {step === 2 && (
          <div className="rounded-3xl border overflow-hidden"
            style={{ backgroundColor: '#fff', borderColor: ds.outline, boxShadow: '0 4px 30px rgba(43,168,162,0.08)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b"
              style={{ borderBottomColor: ds.outline }}>
              <div className="flex items-center gap-3">
                <Shield size={22} style={{ color: ds.teal }} />
                <span className="font-black text-lg" style={{ color: ds.onSurface }}>Verification Hub</span>
              </div>
              <span className="px-3 py-1.5 rounded-full text-xs font-black"
                style={{ backgroundColor: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>

            {/* Dashed separator */}
            <div className="border-b border-dashed" style={{ borderColor: ds.outline }} />

            {/* Body */}
            <div className="flex flex-col sm:flex-row gap-6 p-8">

              {/* LEFT: Trust Score */}
              <div className="flex flex-col items-center rounded-2xl p-6 flex-shrink-0 w-full sm:w-52"
                style={{ backgroundColor: ds.surfaceLow, border: `1px solid ${ds.outline}` }}>
                <TrustCircle score={trust} />
                <div className="font-black text-sm mt-3 mb-4 text-center" style={{ color: ds.onSurface }}>
                  AI Trust Score
                </div>

                {/* Checklist */}
                <div className="w-full flex flex-col gap-2.5">
                  {[
                    { label: 'Document Scan', done: identityDone },
                    { label: 'Business Reg',  done: !!vendor?.business_name },
                    { label: 'Bank Link',      done: kashierDone, pending: !kashierDone && identityDone },
                  ].map(({ label, done, pending }) => (
                    <div key={label} className="flex items-center justify-between text-xs font-semibold"
                      style={{ color: ds.onSurfaceVar }}>
                      <span>{label}</span>
                      {done
                        ? <CheckCircle size={15} style={{ color: ds.teal }} />
                        : pending
                          ? <span style={{ color: ds.gold, fontSize: 15 }}>⏳</span>
                          : <span style={{ color: '#d1d5db', fontSize: 15 }}>○</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: Verification cards */}
              <div className="flex-1 flex flex-col gap-3">

                {/* Identity Verification */}
                <div className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ backgroundColor: '#f8faff', border: '1px solid #e0e7ff' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#e0e7ff' }}>
                    <FileText size={18} style={{ color: '#4f46e5' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-sm" style={{ color: ds.onSurface }}>Identity Verification</div>
                    <div className="text-xs mt-0.5" style={{ color: identityDone ? '#16a34a' : ds.onSurfaceVar }}>
                      {identityDone ? 'Business Details Submitted' : 'Submit your store details to verify'}
                    </div>
                  </div>
                  {identityDone
                    ? <CheckCircle size={22} style={{ color: '#16a34a' }} />
                    : <XCircle size={22} style={{ color: '#d1d5db' }} />}
                </div>

                {/* Store Policy Check */}
                <div className="rounded-2xl p-4 flex items-start gap-4"
                  style={{ backgroundColor: '#f0fdf4', border: `1px solid ${policyDone ? '#bbf7d0' : ds.outline}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: policyDone ? '#bbf7d0' : ds.surfaceLow }}>
                    <Shield size={18} style={{ color: policyDone ? '#16a34a' : ds.teal }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-sm" style={{ color: ds.onSurface }}>Store Policy Check</div>
                    {policyDone ? (
                      <div className="text-xs mt-0.5" style={{ color: '#16a34a' }}>Terms Accepted</div>
                    ) : (
                      <div className="mt-2">
                        <label className="flex items-start gap-2 text-xs cursor-pointer mb-2" style={{ color: ds.onSurfaceVar }}>
                          <input type="checkbox" checked={policyChecked} onChange={e => setPolicyChecked(e.target.checked)}
                            className="mt-0.5 rounded" />
                          <span>I agree to the Flip7 Market <span style={{ color: ds.teal }} className="font-semibold underline cursor-pointer">Seller Terms of Service</span> and <span style={{ color: ds.teal }} className="font-semibold underline cursor-pointer">Privacy Policy</span></span>
                        </label>
                        <button onClick={handleAcceptPolicy} disabled={!policyChecked || acceptingPolicy}
                          className="px-4 py-1.5 rounded-full text-xs font-black disabled:opacity-50"
                          style={{ backgroundColor: ds.teal, color: '#fff' }}>
                          {acceptingPolicy ? <Loader2 size={12} className="animate-spin inline" /> : 'Accept Policy'}
                        </button>
                      </div>
                    )}
                  </div>
                  {policyDone
                    ? <CheckCircle size={22} style={{ color: '#16a34a' }} />
                    : <XCircle size={22} style={{ color: '#f97316' }} />}
                </div>

                {/* Payout Setup */}
                <div className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ backgroundColor: kashierDone ? '#f0fdf4' : '#fff5f5', border: `1px solid ${kashierDone ? '#bbf7d0' : '#fecaca'}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: kashierDone ? '#bbf7d0' : '#fee2e2' }}>
                    <Building2 size={18} style={{ color: kashierDone ? '#16a34a' : ds.coral }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-sm" style={{ color: ds.onSurface }}>Payout Setup</div>
                    <div className="text-xs mt-0.5" style={{ color: kashierDone ? '#16a34a' : ds.coral }}>
                      {kashierDone ? 'Bank Account Connected' : 'Action Required'}
                    </div>
                  </div>
                  {kashierDone
                    ? <CheckCircle size={22} style={{ color: '#16a34a' }} />
                    : <XCircle size={22} style={{ color: ds.coral }} />}
                </div>

              </div>
            </div>

            {/* Admin rejected banner */}
            {status === 'rejected' && (
              <div className="mx-8 mb-6 rounded-2xl p-4 text-sm"
                style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                <div className="font-bold mb-1">Application not approved</div>
                {vendor?.admin_notes && <div>{vendor.admin_notes}</div>}
                <div className="mt-2 text-xs">Please contact support if you believe this is an error.</div>
              </div>
            )}

            {/* Info requested banner */}
            {status === 'info_requested' && vendor?.admin_notes && (
              <div className="mx-8 mb-6 rounded-2xl p-4 text-sm"
                style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}>
                <div className="font-bold mb-1">Additional info requested by admin:</div>
                {vendor.admin_notes}
                <button onClick={() => setStep(1)} className="block mt-2 font-bold underline text-xs">
                  Update my application →
                </button>
              </div>
            )}

            {/* CTA button */}
            {!kashierDone && (
              <div className="px-8 pb-8">
                {error && <div className="text-xs text-red-600 mb-3 p-3 rounded-xl bg-red-50">{error}</div>}
                <button onClick={handleKashierConnect} disabled={saving}
                  className="w-full py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{ backgroundColor: ds.gold, color: ds.onSurface, boxShadow: '0 4px 20px rgba(255,210,63,0.35)' }}>
                  {saving
                    ? <Loader2 size={16} className="animate-spin" />
                    : 'Complete Payout Setup →'}
                </button>
                <p className="text-xs text-center mt-2" style={{ color: '#9ca3af' }}>
                  Powered by Kashier Connect — secure bank-level encryption
                </p>
              </div>
            )}

            {/* All done + approved */}
            {kashierDone && status === 'approved' && (
              <div className="px-8 pb-8">
                <button onClick={() => router.push('/vendor')}
                  className="w-full py-3.5 rounded-full font-black text-sm transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: ds.teal, color: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.35)' }}>
                  🚀 Launch My Store
                </button>
              </div>
            )}

            {/* Done with Kashier but waiting for admin */}
            {kashierDone && status !== 'approved' && status !== 'rejected' && (
              <div className="px-8 pb-8 text-center text-sm" style={{ color: ds.onSurfaceVar }}>
                ✅ Kashier connected! Waiting for admin approval to go live.
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
