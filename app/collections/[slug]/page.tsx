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
    <div className="site-container py-10 sm:py-12 md:py-16">
      <div className="mb-10 max-w-2xl sm:mb-12">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-mocha">Featured collection</p>
        <h1 className="text-3xl font-serif font-bold text-charcoal sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-taupe">
          Carefully tailored styles celebrating everyday elegance, comfort, and modest grace.
        </p>
      </div>

      {displayProducts.length > 0 ? (
        <ProductGrid products={displayProducts} categories={categories} />
      ) : (
        <div className="border border-cream bg-ivory px-6 py-16 text-center text-taupe sm:px-12">
          <p className="mb-2 font-serif text-lg text-charcoal">No Products in this Collection</p>
          <p className="text-xs">New arrivals will be dropping soon.</p>
        </div>
      )}
    </div>
  )
}
