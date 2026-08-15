import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
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
    <div className="site-container py-10 sm:py-12 md:py-16">
      <div className="mb-10 max-w-2xl sm:mb-12">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-mocha">Find your essentials</p>
        <h1 className="text-3xl font-serif font-bold text-charcoal sm:text-4xl">Categories</h1>
        <p className="mt-3 text-sm leading-6 text-taupe">
          Select a category to browse tailored styles and specialized collections.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug || cat.id}`}
            className="group flex min-h-[156px] flex-col justify-between border border-cream bg-ivory p-5 transition hover:border-mocha hover:shadow-[0_12px_28px_rgba(34,34,34,0.06)] sm:p-6"
          >
            <div className="font-serif font-semibold text-charcoal group-hover:text-mocha transition">
              {cat.name}
            </div>
            {cat.description && (
              <div className="text-xs text-taupe mt-1 line-clamp-2">{cat.description}</div>
            )}
            <span className="mt-5 inline-flex items-center gap-2 text-2xs font-semibold uppercase tracking-wider text-mocha">
              View Collection <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
