import React from 'react'
import Link from 'next/link'
import { getNavigation } from '../../lib/repositories/fileRepo'
import CartButton from './CartButton'
import MobileMenuDrawer from './MobileMenuDrawer'

type NavItem = {
  id: string
  label: string
  url?: string
  active?: boolean
  desktopVisible?: boolean
  mobileVisible?: boolean
  location?: string
  children?: NavItem[]
}

function visibleDesktopItems(items: NavItem[]): NavItem[] {
  return items.filter((item) => item.active !== false && item.desktopVisible !== false)
}

function DesktopNavItem({ item }: { item: NavItem }) {
  const children = visibleDesktopItems(item.children ?? [])
  const label = (
    <span className="flex items-center gap-1.5">
      {item.label}
      {children.length > 0 && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </span>
  )

  return (
    <div className="group relative">
      {item.url ? (
        <Link href={item.url} className="relative flex items-center px-2.5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-header-text)]/72 transition-colors hover:text-[var(--color-heading)] lg:px-3.5">
          {label}
        </Link>
      ) : (
        <span className="relative flex items-center px-2.5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--color-header-text)]/72 lg:px-3.5">
          {label}
        </span>
      )}
      {children.length > 0 && (
        <div className="invisible absolute left-0 top-full z-50 min-w-56 translate-y-1 rounded-[var(--radius-base)] border border-[var(--color-border)] bg-[var(--color-card-background)] p-2 opacity-0 shadow-[0_16px_40px_rgba(0,0,0,0.12)] transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {children.map((child) => <DesktopNavItem key={child.id} item={child} />)}
        </div>
      )}
    </div>
  )
}

export const Header = async () => {
  const nav = (await getNavigation()) as NavItem[]
  const navLinks = visibleDesktopItems((nav || []).filter((item) => !item.location || item.location === 'header'))

  return (
    <div className="sticky top-0 z-40 bg-[var(--color-header-background)] shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      {/* Announcement Bar */}
      <div
        className="bg-[var(--color-announcement-background)] py-2 text-[var(--color-announcement-text)]"
        role="banner"
        aria-label="Store announcement"
      >
        <div className="site-container flex items-center justify-between gap-2">
          {/* Left: delivery info */}
          <div className="flex items-center gap-4 overflow-hidden text-[10px] sm:text-[11px]">
            <span className="flex items-center gap-1.5 whitespace-nowrap font-medium">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Free delivery over Tk 2,000
            </span>
            <span className="hidden items-center gap-1.5 whitespace-nowrap font-medium opacity-80 sm:flex">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Premium quality, thoughtfully selected
            </span>
          </div>
          {/* Right: links */}
          <div className="flex shrink-0 items-center gap-3 text-[10px] font-medium opacity-85 sm:text-[11px]">
            <Link href="/track-order" className="whitespace-nowrap transition-opacity hover:opacity-100 focus:outline-none">Track Order</Link>
            <span className="opacity-40" aria-hidden="true">|</span>
            <Link href="/track-order" className="hidden whitespace-nowrap transition-opacity hover:opacity-100 focus:outline-none sm:inline">Help</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className="border-b border-[var(--color-border)] bg-[var(--color-header-background)]"
        role="banner"
        aria-label="Main navigation"
      >
        <div className="site-container flex h-[62px] items-center justify-between gap-2 md:h-[68px]">

          {/* Left: Mobile hamburger + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <MobileMenuDrawer navItems={nav || []} />

            <Link href="/" className="group flex flex-col" aria-label="Hira's Universe — home">
              <span className="font-serif text-[19px] font-bold leading-none text-[var(--color-heading)] transition-colors group-hover:text-[var(--color-primary)] sm:text-[22px]">
                Hira&apos;s Universe
              </span>
              <span className="mt-[3px] hidden text-[7.5px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted)] sm:block">
                Tradition. Refined.
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav
            className="hidden flex-1 items-center justify-center md:flex"
            aria-label="Primary navigation"
          >
            {navLinks.map((item) => <DesktopNavItem key={item.id} item={item} />)}
          </nav>

          {/* Right: Icons */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            {/* Search */}
            <Link
              href="/products"
              aria-label="Search products"
              title="Search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-header-text)]/70 transition hover:bg-[var(--color-section-background)] hover:text-[var(--color-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>

            {/* Account */}
            <Link
              href="/admin/login"
              aria-label="My account"
              title="Account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-header-text)]/70 transition hover:bg-[var(--color-section-background)] hover:text-[var(--color-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Cart */}
            <CartButton />
          </div>

        </div>
      </header>
    </div>
  )
}

export default Header
