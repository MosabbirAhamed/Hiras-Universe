import React from 'react'
import Link from 'next/link'
import { getNavigation } from '../../lib/repositories/fileRepo'
import CartButton from './CartButton'
import MobileMenuDrawer from './MobileMenuDrawer'

export const Header = async () => {
  const nav = await getNavigation()

  return (
    <div className="sticky top-0 z-40 bg-ivory shadow-2xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#3e2e24] text-[#f6f1eb] text-2xs sm:text-xs py-2 border-b border-[#2e2017]">
        <div className="site-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden whitespace-nowrap">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="text-[#c5a059]">✦</span> Free Delivery on orders over Tk 2,000
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-cream/80">
              <span>•</span> Premium Quality
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-cream/80">
              <span>•</span> Easy Returns
            </span>
          </div>
          <div className="flex items-center gap-3 text-cream/90 flex-shrink-0">
            <Link
              href="/track-order"
              className="hover:text-white transition flex items-center gap-1 font-medium"
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
      <header className="border-b border-cream bg-ivory/95 backdrop-blur-sm">
        <div className="site-container flex items-center justify-between py-3.5 md:py-4">
          {/* Left: Brand / Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <MobileMenuDrawer navItems={nav || []} />
            <Link href="/" className="group flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-charcoal group-hover:text-mocha transition">
                Hira&apos;s Universe
              </span>
              <span className="text-[10px] tracking-widest uppercase text-taupe -mt-1 font-sans">
                Tradition. Refined.
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm tracking-wide font-medium text-charcoal/80">
            <Link href="/products" className="hover:text-mocha transition py-1">
              Products
            </Link>
            <Link href="/category" className="hover:text-mocha transition py-1">
              Categories
            </Link>
            <Link href="/collections/women" className="hover:text-mocha transition py-1">
              Women
            </Link>
            <Link href="/collections/men" className="hover:text-mocha transition py-1">
              Men
            </Link>
            <Link href="/category/tupi" className="hover:text-mocha transition py-1">
              Tupi
            </Link>
            <Link href="/category" className="hover:text-mocha transition py-1">
              Collections
            </Link>
            <Link href="/track-order" className="hover:text-mocha transition py-1 text-mocha font-semibold">
              Track Order
            </Link>
          </nav>

          {/* Right: Controls & Shopping Bag */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/products"
              aria-label="Search products"
              className="p-2 text-charcoal hover:text-mocha transition"
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
              className="p-2 hidden sm:inline-flex text-charcoal hover:text-mocha transition"
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
