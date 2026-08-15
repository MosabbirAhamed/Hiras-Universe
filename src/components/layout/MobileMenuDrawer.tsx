"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export interface MobileNavProps {
  navItems: { id: string; label: string; url: string; active?: boolean; order?: number }[]
}

export default function MobileMenuDrawer({ navItems }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Handle escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 md:hidden text-charcoal hover:opacity-75 transition cursor-pointer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-4/5 max-w-xs bg-ivory border-r border-cream p-6 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cream pb-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="font-serif text-lg font-bold text-charcoal"
            >
              Hira&apos;s Universe
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="p-1 text-taupe hover:text-charcoal text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded text-sm font-medium text-charcoal hover:bg-cream transition"
            >
              All Products
            </Link>

            <Link
              href="/category"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded text-sm font-medium text-charcoal hover:bg-cream transition"
            >
              Categories
            </Link>

            {navItems
              ?.filter((n) => n.active !== false)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((n) => (
                <Link
                  key={n.id}
                  href={n.url}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2.5 rounded text-sm font-medium text-charcoal hover:bg-cream transition"
                >
                  {n.label}
                </Link>
              ))}

            <Link
              href="/track-order"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded text-sm font-medium text-mocha hover:bg-cream transition"
            >
              Track Order
            </Link>
          </nav>
        </div>

        {/* Footer info */}
        <div className="border-t border-cream pt-4 text-xs text-taupe space-y-1">
          <p className="font-serif italic text-charcoal">Curated Modest Fashion</p>
          <p>© {new Date().getFullYear()} Hira&apos;s Universe</p>
        </div>
      </div>
    </>
  )
}
