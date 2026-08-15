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
    <div className="sticky top-0 z-40 bg-ivory shadow-[0_1px_12px_rgba(34,34,34,0.05)]">
      {/* Top Announcement Bar */}
      <div className="bg-[#292724] text-[#f6f1eb] text-[11px] sm:text-xs py-2 border-b border-black/10">
        <div className="site-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
            <span className="flex items-center gap-2 font-medium">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c5a059]" aria-hidden="true" />
              Free delivery over Tk 2,000
            </span>
            <span className="hidden md:inline text-white/65">Premium quality, thoughtfully selected</span>
          </div>
          <div className="flex items-center gap-3 text-white/80 flex-shrink-0">
            <Link
              href="/track-order"
              className="hover:text-white transition-colors flex items-center gap-1.5 font-medium"
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
      <header className="border-b border-black/5 bg-ivory/95 backdrop-blur-md">
        <div className="site-container flex min-h-[68px] items-center justify-between py-2.5 md:min-h-[76px] md:py-3">
          {/* Left: Brand / Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <MobileMenuDrawer navItems={nav || []} />
            <Link href="/" className="group flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-charcoal group-hover:text-mocha transition-colors">
                Hira&apos;s Universe
              </span>
              <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-taupe">
                Tradition. Refined.
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden items-center gap-5 text-[13px] font-medium text-charcoal/75 md:flex lg:gap-7" aria-label="Primary navigation">
            {primaryLinks.map((item, index) => (
              <Link
                key={item.url}
                href={item.url}
                className={`${index === primaryLinks.length - 1 ? 'hidden lg:block ' : ''}border-b border-transparent py-2 transition-colors hover:border-mocha hover:text-mocha`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Controls & Shopping Bag */}
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            <Link
              href="/products"
              aria-label="Search products"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-charcoal hover:bg-cream hover:text-mocha transition-colors"
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
              className="hidden h-11 w-11 items-center justify-center rounded-full text-charcoal hover:bg-cream hover:text-mocha transition-colors sm:inline-flex"
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
