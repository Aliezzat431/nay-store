'use client'

import Link from 'next/link'
import { ShoppingCart, Search } from 'lucide-react'
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs'
import { User } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

const ds = {
  tealDark: '#1E8C86',
  teal:     '#2BA8A2',
  gold:     '#FFD23F',
  cream:    '#FFF8E7',
  outline:  '#bcc9c7',
  onSurface:'#151d1d',
}

export default function Navbar() {
  const { isSignedIn } = useAuth()
  const { itemCount } = useCart()

  return (
    <header className="fixed top-0 w-full z-50 border-b" style={{ backgroundColor: ds.cream, borderColor: ds.outline }}>
      <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto gap-4">
        <Link href="/" className="font-black text-lg tracking-widest" style={{ color: ds.tealDark }}>
          FLIP7 MARKET
        </Link>

        <div className="flex-1 max-w-sm mx-4 hidden md:flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
          style={{ borderColor: ds.outline, backgroundColor: '#fff', color: '#9ca3af' }}>
          <Search size={14} />
          <span>Search the game board...</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative" style={{ color: ds.tealDark }}>
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-black flex items-center justify-center"
                style={{ backgroundColor: ds.gold, color: ds.onSurface }}>
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {isSignedIn ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="My Profile"
                  labelIcon={<User size={14} />}
                  href="/profile"
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-full font-bold text-sm border-2 transition-all hover:scale-105"
                  style={{ borderColor: ds.teal, color: ds.teal }}>
                  Sign In
                </button>
              </SignInButton>
              <Link href="/sign-up/choose-role"
                className="px-5 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
                style={{ backgroundColor: ds.teal, color: '#fff', boxShadow: '0 4px 20px rgba(43,168,162,0.3)' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
