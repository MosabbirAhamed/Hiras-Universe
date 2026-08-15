import React from 'react'
import type { Metadata } from 'next'
import { getProducts, getCategories } from '../../../src/lib/repositories/fileRepo'
import ProductGrid from '../../../src/components/Product/ProductGrid'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const title = params.slug === 'women'
    ? "Women's Modest Collection"
    : params.slug === 'men'
    ? "Men's Modest Collection"
    : `${params.slug.charAt(0).toUpperCase() + params.slug.slice(1)} Collection`

  return {
    title: `${title} | Hira's Universe`,
    description: `Browse the curated ${title} at Hira's Universe. Timeless modest clothing and essentials.`,
    alternates: {
      canonical: `/collections/${params.slug}`
    }
  }
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  const slug = params.slug.toLowerCase()
  const title = slug === 'women'
    ? "Women's Collection"
    : slug === 'men'
    ? "Men's Collection"
    : `${slug.charAt(0).toUpperCase() + slug.slice(1)} Collection`

  // Filter products by tags or category match if available, otherwise show active catalog items
  const activeProducts = products.filter((p) => p.active !== false && p.visibility !== 'hidden')
  const matched = activeProducts.filter((p) => {
    if (p.tags?.some((t) => t.toLowerCase() === slug)) return true
    if (slug === 'men' && (p.categoryId === 'c-1' || p.name.toLowerCase().includes('tupi') || p.tags?.includes('men'))) return true
    if (slug === 'women' && (p.categoryId === 'c-2' || p.name.toLowerCase().includes('hijab') || p.tags?.includes('women'))) return true
    return false
  })

  const displayProducts = matched.length > 0 ? matched : activeProducts

  return (
    <div className="site-container py-8 md:py-12">
      <div className="mb-8 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-mocha bg-cream px-3 py-1 rounded-full">
          Featured Collection
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal mt-3">{title}</h1>
        <p className="mt-2 text-sm text-taupe leading-relaxed">
          Carefully tailored styles celebrating everyday elegance, comfort, and modest grace.
        </p>
      </div>

      {displayProducts.length > 0 ? (
        <ProductGrid products={displayProducts} categories={categories} />
      ) : (
        <div className="p-12 text-center text-taupe bg-ivory border border-cream rounded-lg">
          <p className="font-serif text-lg text-charcoal mb-2">No Products in this Collection</p>
          <p className="text-xs">New arrivals will be dropping soon.</p>
        </div>
      )}
    </div>
  )
}
