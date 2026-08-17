"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log safe error trace to console in dev
    console.error('[ApplicationError]', error)
  }, [error])

  return (
    <main className="storefront-shell">
      <div className="site-container flex min-h-[60vh] items-center justify-center py-16 sm:py-20">
        <div className="storefront-card mx-auto max-w-lg space-y-6 bg-white/60 p-7 text-center sm:p-10">
          <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
            System Notice
          </span>
          <h1 className="font-serif text-3xl font-semibold text-charcoal sm:text-4xl">
            Something went wrong
          </h1>
          <p className="text-sm leading-6 text-charcoal/60">
            An unexpected issue occurred while processing your request. Please try again or return to the main store.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button type="button" onClick={() => reset()} className="storefront-button">
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/15 px-5 py-2.5 text-xs font-semibold text-charcoal transition hover:bg-cream focus:outline-none focus:ring-2 focus:ring-gold"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
