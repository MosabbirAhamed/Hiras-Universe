"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export interface MobileNavProps {
  navItems: { id: string; label: string; url: string; active?: boolean; order?: number }[]
}

const fallbackItems = [
  { id: 'f-1', label: 'Shop All', url: '/products' },
  { id: 'f-2', label: 'Women', url: '/collections/women' },
  { id: 'f-3', label: 'Men', url: '/collections/men' },
  { id: 'f-4', label: 'Tupi', url: '/category/tupi' },
  { id: 'f-5', label: 'Collections', url: '/category' },
  { id: 'f-6', label: 'Track Order', url: '/track-order' },
]

export default function MobileMenuDrawer({ navItems }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeItems = (navItems || []).filter(item => item.active !== false)
  const menuItems = activeItems.length > 0
    ? activeItems.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : fallbackItems

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        type="button"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-[var(--color-header-text)] transition hover:bg-[var(--color-section-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] md:hidden"
      >
        <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        )}
      </button>

      {/* Backdrop — sits above page content, below drawer */}
      <div
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden ${isOpen ? 'z-[120] opacity-100' : 'pointer-events-none -z-10 opacity-0'}`}
      />

      {/* Slide-out Drawer — fully opaque white background, above backdrop */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed bottom-0 left-0 top-0 z-[130] flex w-[82vw] max-w-[320px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#EBEBEB] px-5 py-4">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex flex-col"
          >
            <span className="font-serif text-lg font-semibold tracking-tight text-[#181817]">
              Hira&apos;s Universe
            </span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Tradition. Refined.
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[#F5F5F5] hover:text-[#181817] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile navigation">
          {menuItems.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3.5 text-sm font-semibold text-[#222222] transition hover:bg-[#F7F7F5] hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom info */}
        <div className="border-t border-[#EBEBEB] px-5 py-5">
          <p className="text-xs text-[var(--color-muted)]">
            © {new Date().getFullYear()} Hira&apos;s Universe
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-muted)]/70">
            Modest essentials, thoughtfully chosen.
          </p>
        </div>
      </div>
    </>
  )
}
