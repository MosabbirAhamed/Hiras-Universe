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
    <div className="site-container py-10 sm:py-12 md:py-16">
      <div className="mb-10 max-w-2xl sm:mb-12">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-mocha">The full edit</p>
        <h1 className="text-3xl font-serif font-bold text-charcoal sm:text-4xl">All Products</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-taupe">
          Browse our curated catalog of handcrafted essentials and timeless modest styles.
        </p>
      </div>

      {visibleProducts.length > 0 ? (
        <ProductGrid products={visibleProducts} categories={categories} />
      ) : (
        <div className="border border-cream bg-ivory px-6 py-16 text-center text-taupe sm:px-12">
          <p className="mb-2 font-serif text-lg text-charcoal">No Products Found</p>
          <p className="text-xs">Check back soon for new arrivals and upcoming drops.</p>
        </div>
      )}
    </div>
  )
}
