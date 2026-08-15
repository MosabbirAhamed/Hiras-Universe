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
    <div className="site-container py-8 md:py-12">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">Categories</h1>
        <p className="mt-2 text-sm text-taupe">
          Select a category to browse tailored styles and specialized collections.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug || cat.id}`}
            className="group block p-6 rounded-lg bg-ivory border border-cream hover:border-mocha hover:shadow-xs transition"
          >
            <div className="font-serif font-semibold text-charcoal group-hover:text-mocha transition">
              {cat.name}
            </div>
            {cat.description && (
              <div className="text-xs text-taupe mt-1 line-clamp-2">{cat.description}</div>
            )}
            <span className="text-2xs font-semibold text-mocha uppercase tracking-wider mt-4 inline-block">
              View Collection →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
