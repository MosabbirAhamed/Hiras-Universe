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
    <main className="storefront-shell">
      <div className="site-container pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
        <header className="mb-10 border-b border-black/10 pb-8 sm:mb-12 sm:pb-10">
          <p className="storefront-eyebrow mb-4">Featured collection</p>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] text-charcoal sm:text-5xl lg:text-6xl">{title}</h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-charcoal/65 sm:text-base">Carefully tailored styles celebrating everyday elegance, comfort, and modest grace.</p>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-taupe">{displayProducts.length} {displayProducts.length === 1 ? 'piece' : 'pieces'}</p>
          </div>
        </header>

        {displayProducts.length > 0 ? (
          <ProductGrid products={displayProducts} categories={categories} />
        ) : (
          <div className="storefront-card flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center sm:px-12">
            <p className="storefront-eyebrow mb-4">A quiet interval</p>
            <h2 className="font-serif text-2xl font-semibold text-charcoal">The next edit is on its way</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-charcoal/60">There are no available pieces in this collection right now.</p>
          </div>
        )}
      </div>
    </main>
  )
}
