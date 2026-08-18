import React from 'react'
import Link from 'next/link'
import { getNavigation } from '../../lib/repositories/fileRepo'
import CartButton from './CartButton'
import MobileMenuDrawer from './MobileMenuDrawer'

const PERMANENT_LINKS = [
  { label: 'Shop All', url: '/products' },
  { label: 'Women', url: '/collections/women' },
  { label: 'Men', url: '/collections/men' },
  { label: 'Tupi', url: '/category/tupi' },
  { label: 'Collections', url: '/category' },
  { label: 'Track Order', url: '/track-order' },
]

export const Header = async () => {
  const nav = await getNavigation()

  // Merge DB nav with permanent links, deduplicate by URL
  const dbLinks = (nav || [])
    .filter((item: any) => item.active && item.location !== 'footer' && item.url)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    .map((item: any) => ({ label: item.label, url: item.url }))

  // Use DB links if configured, otherwise use permanent links
  const navLinks = dbLinks.length > 0
    ? [...dbLinks, ...PERMANENT_LINKS.filter(p => !dbLinks.some((d: any) => d.url === p.url))].slice(0, 7)
    : PERMANENT_LINKS

  return (
    <div className="sticky top-0 z-40 bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
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
            <Link href="/track-order" className="whitespace-nowrap transition-opacity hover:opacity-100 focus:outline-none">
              Track Order
            </Link>
            <span className="opacity-40" aria-hidden="true">|</span>
            <Link href="/products" className="hidden whitespace-nowrap transition-opacity hover:opacity-100 focus:outline-none sm:inline">
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className="border-b border-[#F0F0F0] bg-white"
        role="banner"
        aria-label="Main navigation"
      >
        <div className="site-container flex h-[68px] items-center justify-between gap-4 md:h-[76px]">

          {/* Left: Mobile hamburger + Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <MobileMenuDrawer navItems={nav || []} />

            <Link href="/" className="group flex flex-col" aria-label="Hira's Universe — home">
              <span className="font-serif text-[20px] font-bold leading-none tracking-tight text-[var(--color-heading)] transition-colors group-hover:text-[var(--color-primary)] sm:text-[23px]">
                Hira&apos;s Universe
              </span>
              <span className="mt-[3px] hidden text-[7.5px] font-bold uppercase tracking-[0.3em] text-[var(--color-muted)] sm:block">
                Tradition. Refined.
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav
            className="hidden flex-1 items-center justify-center gap-1 md:flex lg:gap-0.5"
            aria-label="Primary navigation"
          >
            {navLinks.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className="relative px-3 py-2 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[var(--color-header-text)]/70 transition-colors hover:text-[var(--color-heading)] lg:px-4"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Icons */}
          <div className="flex shrink-0 items-center gap-0.5">
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
              className="hidden h-10 w-10 items-center justify-center rounded-lg text-[var(--color-header-text)]/70 transition hover:bg-[var(--color-section-background)] hover:text-[var(--color-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] sm:inline-flex"
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
