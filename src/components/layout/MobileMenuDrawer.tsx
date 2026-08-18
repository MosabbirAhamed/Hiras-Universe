"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export type MobileNavItem = {
  id: string
  label: string
  url?: string
  active?: boolean
  mobileVisible?: boolean
  location?: string
  children?: MobileNavItem[]
}

export interface MobileNavProps {
  navItems: MobileNavItem[]
}

function visibleMobileItems(items: MobileNavItem[]): MobileNavItem[] {
  return items.filter((item) => item.active !== false && item.mobileVisible !== false)
}

function MobileNavGroup({ item, closeMenu, depth = 0 }: { item: MobileNavItem; closeMenu: () => void; depth?: number }) {
  const children = visibleMobileItems(item.children ?? [])
  const [expanded, setExpanded] = useState(false)
  const linkClass = "flex min-h-12 flex-1 items-center rounded px-3 py-3 text-sm font-semibold text-[#222222] transition hover:bg-[#F7F7F5] hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
  return (
    <div style={{ paddingLeft: `${Math.min(depth, 3) * 12}px` }}>
      <div className="flex items-center">
        {item.url ? <Link href={item.url} onClick={closeMenu} className={linkClass}>{item.label}</Link> : <span className={linkClass}>{item.label}</span>}
        {children.length > 0 && <button type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.label}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded hover:bg-[#F7F7F5]"><span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>⌄</span></button>}
      </div>
      {expanded && children.length > 0 && <div className="border-l border-[#EBEBEB]">{children.map((child) => <MobileNavGroup key={child.id} item={child} closeMenu={closeMenu} depth={depth + 1} />)}</div>}
    </div>
  )
}

export default function MobileMenuDrawer({ navItems }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuItems = visibleMobileItems((navItems || []).filter((item) => !item.location || item.location === 'mobile' || item.location === 'header'))

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    function handleKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <button type="button" aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} aria-controls="mobile-nav-drawer" onClick={() => setIsOpen((open) => !open)} className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-[var(--color-header-text)] transition hover:bg-[var(--color-section-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] md:hidden">
        <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{isOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h10" />}</svg>
      </button>
      <div onClick={() => setIsOpen(false)} aria-hidden="true" className={`fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden ${isOpen ? 'z-[120] opacity-100' : 'pointer-events-none -z-10 opacity-0'}`} />
      <div id="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu" className={`fixed bottom-0 left-0 top-0 z-[130] flex w-[86vw] max-w-[360px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[#EBEBEB] px-5 py-4">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex flex-col"><span className="font-serif text-lg font-semibold tracking-tight text-[#181817]">{"Hira's Universe"}</span><span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">Tradition. Refined.</span></Link>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Close navigation menu" className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[#F5F5F5] hover:text-[#181817] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile navigation">{menuItems.length > 0 ? menuItems.map((item) => <MobileNavGroup key={item.id} item={item} closeMenu={() => setIsOpen(false)} />) : <p className="px-3 py-4 text-sm text-[var(--color-muted)]">Navigation is not configured.</p>}</nav>
        <div className="border-t border-[#EBEBEB] px-5 py-5"><p className="text-xs text-[var(--color-muted)]">© {new Date().getFullYear()} {"Hira's Universe"}</p><p className="mt-1 text-[11px] text-[var(--color-muted)]/70">Modest essentials, thoughtfully chosen.</p></div>
      </div>
    </>
  )
}
