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
    <div className="site-container py-8 md:py-12">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">All Products</h1>
        <p className="mt-2 text-sm text-taupe">
          Browse our curated catalog of handcrafted essentials and timeless modest styles.
        </p>
      </div>

      {visibleProducts.length > 0 ? (
        <ProductGrid products={visibleProducts} categories={categories} />
      ) : (
        <div className="p-12 text-center text-taupe bg-ivory border border-cream rounded-lg">
          <p className="font-serif text-lg text-charcoal mb-2">No Products Found</p>
          <p className="text-xs">Check back soon for new arrivals and upcoming drops.</p>
        </div>
      )}
    </div>
  )
}
