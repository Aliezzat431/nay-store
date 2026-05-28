'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import VendorSidebar from '@/components/vendor-sidebar'
import { Plus, Pencil, Trash2, X, Check, Upload, Loader2, ImageIcon } from 'lucide-react'

const TEAL = '#2BA8A2'
const GOLD = '#FFD23F'
const CORAL = '#f46f4d'
const SURFACE = '#f2fbfa'
const ON_SURFACE = '#151d1d'

type Product = {
  id: string
  name: string
  price: number
  emoji: string
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

type FormState = {
  name: string
  price: string
  description: string
  is_active: boolean
  image_url: string | null
}

const EMPTY_FORM: FormState = {
  name: '',
  price: '',
  description: '',
  is_active: true,
  image_url: null,
}

export default function VendorInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/vendor/products')
      if (!res.ok) throw new Error('Failed to load products')
      const data = await res.json()
      setProducts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  function openAddForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setUploadError(null)
    setShowForm(true)
  }

  function openEditForm(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description ?? '',
      is_active: product.is_active,
      image_url: product.image_url ?? null,
    })
    setFormError(null)
    setUploadError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setUploadError(null)
  }

  async function handleImageUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/vendor/products/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setForm(f => ({ ...f, image_url: data.url }))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageUpload(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.name.trim() || !form.price) {
      setFormError('Name and price are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        emoji: '📦',
        name: form.name.trim(),
        price: parseFloat(form.price),
        description: form.description.trim() || null,
        is_active: form.is_active,
        image_url: form.image_url ?? null,
      }
      const res = editingId
        ? await fetch(`/api/vendor/products/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/vendor/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save product')
      }
      closeForm()
      fetchProducts()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/vendor/products/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete')
      setDeleteConfirmId(null)
      fetchProducts()
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: SURFACE }}>
      <VendorSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-widest uppercase" style={{ color: ON_SURFACE }}>Inventory</h1>
            <p className="text-sm mt-1" style={{ color: '#6b8f8b' }}>Manage your listed products</p>
          </div>
          <button onClick={openAddForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:scale-105"
            style={{ backgroundColor: GOLD, color: ON_SURFACE, boxShadow: '0 4px 16px rgba(255,210,63,0.35)' }}>
            <Plus size={15} /> Add Product
          </button>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <div className="relative w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: '#fff', boxShadow: '0 8px 40px rgba(43,168,162,0.2)' }}>
              <button onClick={closeForm}
                className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100"
                style={{ color: '#9ca3af' }}>
                <X size={18} />
              </button>
              <h2 className="font-black text-lg mb-5" style={{ color: ON_SURFACE }}>
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#6b8f8b' }}>
                    Product Image <span style={{ color: '#9ca3af' }}>(optional)</span>
                  </label>

                  {form.image_url ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border"
                      style={{ borderColor: '#e5e7eb' }}>
                      <Image src={form.image_url} alt="Product" fill className="object-cover" />
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, image_url: null }))}
                        className="absolute top-2 right-2 rounded-full p-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDrop={handleDrop}
                      onDragOver={e => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-teal-400"
                      style={{ borderColor: '#bcc9c7', backgroundColor: SURFACE }}>
                      {uploading ? (
                        <Loader2 size={24} className="animate-spin" style={{ color: TEAL }} />
                      ) : (
                        <>
                          <ImageIcon size={28} style={{ color: '#9ca3af' }} />
                          <p className="text-xs font-semibold" style={{ color: '#6b8f8b' }}>
                            Click or drag & drop to upload
                          </p>
                          <p className="text-xs" style={{ color: '#9ca3af' }}>JPG, PNG, WebP — max 5MB</p>
                        </>
                      )}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />
                  {uploadError && <p className="text-xs mt-1 font-semibold" style={{ color: CORAL }}>{uploadError}</p>}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#6b8f8b' }}>Name</label>
                  <input type="text" placeholder="Product name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                    style={{ borderColor: '#e5e7eb', backgroundColor: SURFACE, color: ON_SURFACE }} />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#6b8f8b' }}>Price ($)</label>
                  <input type="number" placeholder="0.00" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                    style={{ borderColor: '#e5e7eb', backgroundColor: SURFACE, color: ON_SURFACE }} />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#6b8f8b' }}>
                    Description <span style={{ color: '#9ca3af' }}>(optional)</span>
                  </label>
                  <textarea placeholder="Short description..." value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none resize-none"
                    style={{ borderColor: '#e5e7eb', backgroundColor: SURFACE, color: ON_SURFACE }} />
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: '#6b8f8b' }}>Active listing</span>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                    className="relative w-11 h-6 rounded-full transition-colors duration-200"
                    style={{ backgroundColor: form.is_active ? TEAL : '#d1d5db' }}>
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                      style={{ transform: form.is_active ? 'translateX(20px)' : 'translateX(0)' }} />
                  </button>
                </div>

                {formError && <p className="text-xs font-semibold" style={{ color: CORAL }}>{formError}</p>}

                <div className="flex gap-3 mt-1">
                  <button type="button" onClick={closeForm}
                    className="flex-1 rounded-xl py-2.5 text-sm font-bold"
                    style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving || uploading}
                    className="flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-60"
                    style={{ backgroundColor: TEAL, color: '#fff' }}>
                    {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin" style={{ color: TEAL }} />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-sm font-semibold" style={{ color: CORAL }}>{error}</p>
            <button onClick={fetchProducts} className="mt-3 text-sm font-bold underline" style={{ color: TEAL }}>Retry</button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="text-5xl">📦</div>
            <p className="font-bold" style={{ color: ON_SURFACE }}>No products yet</p>
            <p className="text-sm" style={{ color: '#6b8f8b' }}>Click "Add Product" to list your first item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product.id} className="rounded-2xl overflow-hidden flex flex-col relative"
                style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.08)' }}>

                {/* Image or Emoji */}
                {product.image_url ? (
                  <div className="relative w-full h-44">
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-44 flex items-center justify-center"
                    style={{ backgroundColor: SURFACE }}>
                    <ImageIcon size={40} style={{ color: '#bcc9c7' }} />
                  </div>
                )}

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <p className="font-black text-sm" style={{ color: ON_SURFACE }}>{product.name}</p>
                  {product.description && (
                    <p className="text-xs line-clamp-2" style={{ color: '#9ca3af' }}>{product.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="font-black text-base" style={{ color: TEAL }}>
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      style={{
                        backgroundColor: product.is_active ? '#d1fae5' : '#f3f4f6',
                        color: product.is_active ? '#27AE60' : '#9ca3af',
                      }}>
                      {product.is_active ? <><Check size={10} /> Active</> : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button onClick={() => openEditForm(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold"
                      style={{ backgroundColor: SURFACE, color: TEAL }}>
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirmId(product.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold"
                      style={{ backgroundColor: '#fff0ed', color: CORAL }}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>

                {/* Delete confirm overlay */}
                {deleteConfirmId === product.id && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 rounded-2xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.96)' }}>
                    <p className="text-sm font-bold text-center" style={{ color: ON_SURFACE }}>Delete this product?</p>
                    <p className="text-xs text-center" style={{ color: '#9ca3af' }}>This cannot be undone.</p>
                    <div className="flex gap-2 w-full">
                      <button onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 rounded-xl py-2 text-xs font-bold"
                        style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                        Cancel
                      </button>
                      <button onClick={() => handleDelete(product.id)} disabled={deleting}
                        className="flex-1 rounded-xl py-2 text-xs font-bold disabled:opacity-60"
                        style={{ backgroundColor: CORAL, color: '#fff' }}>
                        {deleting ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
