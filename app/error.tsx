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
    <div className="site-container py-20 text-center max-w-md mx-auto space-y-6">
      <span className="text-xs font-semibold uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
        System Notice
      </span>
      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
        Something went wrong
      </h1>
      <p className="text-xs text-taupe leading-relaxed">
        An unexpected issue occurred while processing your request. Please try again or return to the main store.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 bg-mocha text-ivory rounded-md text-xs font-medium hover:opacity-90 transition shadow-xs cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 border border-cream bg-ivory rounded-md text-xs font-medium text-charcoal hover:bg-cream transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
