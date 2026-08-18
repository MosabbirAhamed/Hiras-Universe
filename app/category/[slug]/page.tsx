import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProducts, getCategories } from '../../../src/lib/repositories/fileRepo'
import ProductGrid from '../../../src/components/Product/ProductGrid'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const categories = await getCategories()
  const category = categories.find((c) => (c.slug === params.slug || c.id === params.slug) && c.active !== false)
  if (!category) {
    return {
      title: 'Category Not Found',
      robots: { index: false, follow: false }
    }
  }

  const title = `${category.name} Collection`
  const description = category.description || `Browse the exclusive ${category.name} collection at Hira's Universe.`
  const ogImages = category.image ? [category.image] : ['/og-image.jpg']

  return {
    title,
    description,
    alternates: {
      canonical: `/category/${encodeURIComponent(category.slug || category.id)}`
    },
    openGraph: {
      title: `${category.name} - Hira's Universe`,
      description,
      type: 'website',
      url: `/category/${encodeURIComponent(category.slug || category.id)}`,
      images: ogImages.map((img) => ({
        url: img,
        alt: category.name
      }))
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - Hira's Universe`,
      description,
      images: ogImages
    }
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const category = categories.find((c) => (c.slug === params.slug || c.id === params.slug) && c.active !== false)
  if (!category) return notFound()

  const filtered = products.filter(
    (p) => p.categoryId === category.id && p.active !== false && p.visibility !== 'hidden'
  )

  return (
    <main className="storefront-shell">
      <div className="site-container pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
        <header className="mb-10 border-b border-[var(--color-border)] pb-8 sm:mb-12 sm:pb-10">
          <p className="storefront-eyebrow mb-4">Curated collection</p>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] text-[var(--color-heading)] sm:text-5xl lg:text-6xl">{category.name}</h1>
              {category.description && <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">{category.description}</p>}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}</p>
          </div>
        </header>

        {filtered.length > 0 ? (
          <ProductGrid products={filtered} categories={categories} />
        ) : (
          <div className="storefront-card flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center sm:px-12">
            <p className="storefront-eyebrow mb-4">A quiet interval</p>
            <h2 className="font-serif text-2xl font-semibold text-[var(--color-heading)]">This collection is being refreshed</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)]">There are no available pieces in this category right now.</p>
          </div>
        )}
      </div>
    </main>
  )
}
