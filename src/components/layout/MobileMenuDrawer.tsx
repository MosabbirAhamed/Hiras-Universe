"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export interface MobileNavProps {
  navItems: { id: string; label: string; url: string; active?: boolean; order?: number }[]
}

export default function MobileMenuDrawer({ navItems }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const fallbackItems = [
    { label: 'Shop All', url: '/products' },
    { label: 'Women', url: '/collections/women' },
    { label: 'Men', url: '/collections/men' },
    { label: 'Tupi', url: '/category/tupi' },
    { label: 'Collections', url: '/category' },
    { label: 'Track Order', url: '/track-order' }
  ]
  const menuItems = navItems.filter(item => item.active !== false).length > 0
    ? navItems.filter(item => item.active !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : fallbackItems

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
        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-[var(--color-header-text)] transition hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] md:hidden"
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
          className="fixed inset-0 z-[60] bg-[var(--color-heading)]/60 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed bottom-0 left-0 top-0 z-[70] flex w-[88%] max-w-sm flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)] px-5 pb-6 pt-5 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="space-y-7">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-5">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="font-serif text-xl font-semibold text-[var(--color-heading)]"
            >
              Hira&apos;s Universe
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--color-muted)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Mobile navigation">
            {menuItems.map((item) => (
              <Link key={item.url} href={item.url} onClick={() => setIsOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="space-y-1.5 border-t border-[var(--color-border)] pt-5 text-xs text-[var(--color-muted)]">
          <p className="font-serif text-base text-[var(--color-heading)]">A considered modest edit.</p>
          <p>© {new Date().getFullYear()} Hira&apos;s Universe</p>
        </div>
      </div>
    </>
  )
}
