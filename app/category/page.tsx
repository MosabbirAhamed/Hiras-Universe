import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '../../src/lib/repositories/fileRepo'

export const metadata: Metadata = {
  title: 'Categories & Collections',
  description: 'Explore all product categories at Hira\'s Universe. Find handcrafted tupis, hijabs, modest wear, and signature accessories.',
  alternates: {
    canonical: '/category'
  },
  openGraph: {
    title: "Categories - Hira's Universe",
    description: 'Explore all modest product categories at Hira\'s Universe.',
    url: '/category',
    images: ['/og-image.jpg']
  }
}

export default async function CategoryListPage() {
  const categories = (await getCategories()).filter((c) => c.active !== false)

  return (
    <main className="storefront-shell">
      <div className="site-container pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
        <header className="mb-10 max-w-3xl border-b border-[var(--color-border)] pb-8 sm:mb-12 sm:pb-10">
          <p className="storefront-eyebrow mb-4">Find your essentials</p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.05] text-[var(--color-heading)] sm:text-5xl lg:text-6xl">Categories</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            Explore focused edits shaped around the pieces you reach for most.
          </p>
        </header>

        {categories.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug || cat.id}`}
                className="group storefront-card overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-section-background)]">
                  <Image
                    src={cat.image || '/products/placeholder.svg'}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-heading)]/75 to-transparent px-5 pb-5 pt-12 text-[var(--color-on-primary)] sm:px-6">
                    <h2 className="font-serif text-2xl font-semibold">{cat.name}</h2>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
                  <p className="line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">
                    {cat.description || 'Explore the considered collection.'}
                  </p>
                  <span className="shrink-0 text-xl text-[var(--color-link)] transition-transform group-hover:translate-x-1" aria-hidden="true">↗</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="storefront-card px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-[var(--color-heading)]">Collections are being prepared</h2>
            <p className="mt-3 text-sm text-[var(--color-muted)]">Please check back soon for the next category edit.</p>
          </div>
        )}
      </div>
    </main>
  )
}
