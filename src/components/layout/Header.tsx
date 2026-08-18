import React from 'react'
import Link from 'next/link'
import { getNavigation } from '../../lib/repositories/fileRepo'
import CartButton from './CartButton'
import MobileMenuDrawer from './MobileMenuDrawer'

const permanentLinks = [
  { label: 'Shop All', url: '/products' },
  { label: 'Collections', url: '/category' }
]

export const Header = async () => {
  const nav = await getNavigation()
  const configuredLinks = (nav || [])
    .filter((item: any) => item.active && item.location !== 'footer' && item.url)
    .sort((a: any, b: any) => a.order - b.order)
    .map((item: any) => ({ label: item.label, url: item.url }))
  const primaryLinks = [...permanentLinks.slice(0, 1), ...configuredLinks, ...permanentLinks.slice(1)]
    .filter((item, index, links) => links.findIndex((candidate) => candidate.url === item.url) === index)
    .slice(0, 5)

  return (
    <div className="sticky top-0 z-40 bg-[var(--color-header-background)] text-[var(--color-header-text)] shadow-[0_1px_12px_rgba(34,34,34,0.05)]">
      <div className="bg-[var(--color-announcement-background)] py-2.5 text-[10px] text-[var(--color-announcement-text)] sm:text-[11px]">
        <div className="site-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
            <span className="font-semibold uppercase tracking-[0.14em]">Free delivery over Tk 2,000</span>
            <span className="hidden text-[var(--color-announcement-text)]/55 md:inline">Thoughtful essentials, refined for everyday life</span>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-[var(--color-announcement-text)]/80">
            <Link
              href="/track-order"
              className="flex items-center gap-1.5 font-medium transition-colors hover:text-[var(--color-announcement-text)]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Track Your Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-header-background)]/95 backdrop-blur-md">
        <div className="site-container flex min-h-[72px] items-center justify-between py-3 md:min-h-[82px] md:py-4">
          {/* Left: Brand / Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <MobileMenuDrawer navItems={nav || []} />
            <Link href="/" className="group flex flex-col">
              <span className="font-serif text-[21px] font-semibold tracking-[-0.02em] text-[var(--color-header-text)] transition-colors group-hover:text-[var(--color-link)] sm:text-[25px]">
                Hira&apos;s Universe
              </span>
              <span className="mt-1 hidden text-[8px] font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)] sm:block">
                Modest essentials, thoughtfully chosen
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden items-center gap-5 text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--color-header-text)]/70 md:flex lg:gap-7" aria-label="Primary navigation">
            {primaryLinks.map((item, index) => (
              <Link
                key={item.url}
                href={item.url}
                className={`${index === primaryLinks.length - 1 ? 'hidden lg:block ' : ''}border-b border-transparent py-2 transition-colors hover:border-[var(--color-link)] hover:text-[var(--color-link)]`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Controls & Shopping Bag */}
          <div className="flex items-center gap-0.5 text-[var(--color-header-text)] sm:gap-1.5">
            <Link
              href="/products"
              aria-label="Search products"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-header-text)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-link)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
              title="Search Products"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>

            <Link
              href="/admin/login"
              aria-label="Account Login"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-[var(--color-header-text)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-link)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] sm:inline-flex"
              title="Account"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            <CartButton />
          </div>
        </div>
      </header>
    </div>
  )
}

export default Header
