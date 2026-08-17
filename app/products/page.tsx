import React from 'react'
import type { Metadata } from 'next'
import { getProducts, getCategories } from '../../src/lib/repositories/fileRepo'
import ProductGrid from '../../src/components/Product/ProductGrid'

export const metadata: Metadata = {
  title: 'All Products & Collections',
  description: 'Explore the complete modest fashion collection at Hira\'s Universe. High quality hijabs, handcrafted tupis, abayas, and modest wardrobe essentials.',
  alternates: {
    canonical: '/products'
  },
  openGraph: {
    title: "All Products - Hira's Universe",
    description: 'Explore the complete modest fashion collection at Hira\'s Universe.',
    url: '/products',
    images: ['/og-image.jpg']
  }
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  const visibleProducts = products.filter((p) => p.active !== false && p.visibility !== 'hidden')

  return (
    <main className="storefront-shell">
      <div className="site-container pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
        <header className="mb-10 border-b border-black/10 pb-8 sm:mb-12 sm:flex sm:items-end sm:justify-between sm:gap-10 sm:pb-10">
          <div className="max-w-3xl">
            <p className="storefront-eyebrow mb-4">The full edit</p>
            <h1 className="font-serif text-4xl font-semibold leading-[1.05] text-charcoal sm:text-5xl lg:text-6xl">
              All products
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-charcoal/65 sm:text-base">
              Browse our current catalog of considered essentials and timeless modest styles.
            </p>
          </div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-taupe sm:mb-1 sm:mt-0">
            {visibleProducts.length} {visibleProducts.length === 1 ? 'piece' : 'pieces'}
          </p>
        </header>

        {visibleProducts.length > 0 ? (
          <ProductGrid products={visibleProducts} categories={categories} />
        ) : (
          <div className="storefront-card flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center sm:px-12">
            <p className="storefront-eyebrow mb-4">Catalog update</p>
            <h2 className="font-serif text-2xl font-semibold text-charcoal">The next edit is being prepared</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-charcoal/60">
              There are no available products at the moment. Please check back for the next collection.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
