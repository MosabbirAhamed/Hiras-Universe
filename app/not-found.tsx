import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found | Hira\'s Universe'
}

export default function NotFound() {
  return (
    <div className="site-container py-20 md:py-32 text-center max-w-lg mx-auto space-y-6">
      <span className="text-xs font-semibold uppercase tracking-widest text-mocha bg-cream px-3 py-1 rounded-full">
        404 — Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal">
        Page Not Found
      </h1>
      <p className="text-sm text-taupe leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="px-5 py-2.5 bg-mocha text-ivory rounded-md text-xs font-medium hover:opacity-90 transition shadow-xs"
        >
          Return to Home
        </Link>
        <Link
          href="/products"
          className="px-5 py-2.5 border border-cream bg-ivory rounded-md text-xs font-medium text-charcoal hover:bg-cream transition"
        >
          Browse Products
        </Link>
        <Link
          href="/track-order"
          className="px-5 py-2.5 border border-cream bg-ivory rounded-md text-xs font-medium text-charcoal hover:bg-cream transition"
        >
          Track Order
        </Link>
      </div>
    </div>
  )
}
