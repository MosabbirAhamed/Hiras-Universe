import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found | Hira\'s Universe'
}

export default function NotFound() {
  return (
    <main className="storefront-shell">
      <div className="site-container flex min-h-[60vh] items-center justify-center py-16 sm:py-20">
        <div className="storefront-card mx-auto max-w-xl space-y-6 bg-[var(--color-card-background)]/60 p-7 text-center sm:p-10">
          <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
            404 - Not Found
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[var(--color-heading)] sm:text-4xl">
            Page Not Found
          </h1>
          <p className="text-sm leading-6 text-[var(--color-muted)]">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/" className="storefront-button">
              Return to Home
            </Link>
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-2.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              Browse Products
            </Link>
            <Link
              href="/track-order"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 py-2.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
