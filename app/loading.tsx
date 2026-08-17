import React from 'react'

export default function Loading() {
  return (
    <div className="storefront-shell site-container flex min-h-[55vh] flex-col items-center justify-center space-y-5 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-mocha/20 border-t-mocha" aria-hidden="true" />
      <div className="text-center">
        <p className="storefront-eyebrow animate-pulse">
          Hira&apos;s Universe
        </p>
        <p className="mt-2 font-serif text-lg text-charcoal">Preparing the edit</p>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}
