'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  emoji: string
  quantity: number
  stock: number
  vendor_id: string
  store_name?: string
  kashier_account_id?: string
}

const CART_KEY = 'flip7_cart'

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

// Simple pub/sub so multiple components stay in sync
const listeners = new Set<() => void>()
function notify() { listeners.forEach(fn => fn()) }

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(readCart())
    const refresh = () => setItems(readCart())
    listeners.add(refresh)
    return () => { listeners.delete(refresh) }
  }, [])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    const current = readCart()
    const existing = current.find(i => i.product_id === item.product_id)
    let next: CartItem[]
    if (existing) {
      next = current.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i)
    } else {
      next = [...current, { ...item, quantity: 1 }]
    }
    writeCart(next)
    setItems(next)
    notify()
  }, [])

  const removeItem = useCallback((product_id: string) => {
    const next = readCart().filter(i => i.product_id !== product_id)
    writeCart(next)
    setItems(next)
    notify()
  }, [])

  const updateQty = useCallback((product_id: string, quantity: number) => {
    if (quantity < 1) { removeItem(product_id); return }
    const current = readCart()
    const item = current.find(i => i.product_id === product_id)
    const capped = item ? Math.min(quantity, item.stock) : quantity
    const next = current.map(i => i.product_id === product_id ? { ...i, quantity: capped } : i)
    writeCart(next)
    setItems(next)
    notify()
  }, [removeItem])

  const clearCart = useCallback(() => {
    writeCart([])
    setItems([])
    notify()
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return { items, itemCount, subtotal, addItem, removeItem, updateQty, clearCart }
}
