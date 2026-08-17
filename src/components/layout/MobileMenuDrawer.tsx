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
        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-charcoal transition hover:bg-cream focus:outline-none focus:ring-2 focus:ring-gold md:hidden"
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
          className="fixed inset-0 z-50 bg-charcoal/55 backdrop-blur-xs animate-fade-in md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[88%] max-w-sm flex-col justify-between border-r border-black/10 bg-[#fbfaf7] px-5 pb-6 pt-5 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="space-y-7">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 pb-5">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="font-serif text-xl font-semibold text-charcoal"
            >
              Hira&apos;s Universe
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-taupe transition hover:bg-cream hover:text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Mobile navigation">
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-charcoal transition hover:bg-cream focus:outline-none focus:ring-2 focus:ring-gold"
            >
              All Products
            </Link>

            <Link
              href="/category"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-charcoal transition hover:bg-cream focus:outline-none focus:ring-2 focus:ring-gold"
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
                  className="block rounded-lg px-3 py-3 text-sm font-semibold text-charcoal transition hover:bg-cream focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  {n.label}
                </Link>
              ))}

            <Link
              href="/track-order"
              onClick={() => setIsOpen(false)}
              className="mt-3 block rounded-lg border border-black/10 bg-cream/55 px-3 py-3 text-sm font-semibold text-mocha transition hover:border-mocha/30 hover:bg-cream focus:outline-none focus:ring-2 focus:ring-gold"
            >
              Track Order
            </Link>
          </nav>
        </div>

        {/* Footer info */}
        <div className="space-y-1.5 border-t border-black/10 pt-5 text-xs text-taupe">
          <p className="font-serif text-base text-charcoal">A considered modest edit.</p>
          <p>© {new Date().getFullYear()} Hira&apos;s Universe</p>
        </div>
      </div>
    </>
  )
}
