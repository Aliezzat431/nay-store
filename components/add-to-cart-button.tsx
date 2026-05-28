'use client'

import { useAuth, SignInButton } from '@clerk/nextjs'
import { useCart, CartItem } from '@/hooks/use-cart'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'

const ds = {
  gold: '#FFD23F',
  teal: '#2BA8A2',
  onSurface: '#151d1d',
}

interface Props {
  product: Omit<CartItem, 'quantity'>
}

export default function AddToCartButton({ product }: Props) {
  const { isSignedIn } = useAuth()
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)

  const cartItem = items.find(i => i.product_id === product.product_id)
  const inCart   = Boolean(cartItem)
  const atLimit  = inCart && cartItem!.quantity >= product.stock

  function handleAdd() {
    if (atLimit) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (product.stock === 0) {
    return (
      <button disabled
        className="w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed"
        style={{ backgroundColor: '#e5e7eb', color: '#9ca3af' }}>
        Out of Stock
      </button>
    )
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{ backgroundColor: ds.gold, color: ds.onSurface, boxShadow: '0 4px 20px rgba(255,210,63,0.4)' }}>
          <ShoppingCart size={16} />
          Sign In to Buy
        </button>
      </SignInButton>
    )
  }

  if (atLimit) {
    return (
      <button disabled
        className="w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed"
        style={{ backgroundColor: '#e5e7eb', color: '#9ca3af' }}>
        <Check size={16} /> Max Qty in Cart
      </button>
    )
  }

  return (
    <button onClick={handleAdd}
      className="w-full py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: added || inCart ? ds.teal : ds.gold,
        color: added || inCart ? '#fff' : ds.onSurface,
        boxShadow: added || inCart ? '0 4px 20px rgba(43,168,162,0.4)' : '0 4px 20px rgba(255,210,63,0.4)',
      }}>
      {added || inCart ? <><Check size={16} /> {inCart && !added ? 'In Cart' : 'Added!'}</> : <><ShoppingCart size={16} /> Add to Cart</>}
    </button>
  )
}
