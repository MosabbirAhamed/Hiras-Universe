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
    <div className="site-container py-10 sm:py-12 md:py-16">
      <div className="mb-10 max-w-2xl sm:mb-12">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-mocha">Curated collection</p>
        <h1 className="text-3xl font-serif font-bold text-charcoal sm:text-4xl">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-sm text-taupe leading-relaxed">{category.description}</p>
        )}
      </div>

      {filtered.length > 0 ? (
        <ProductGrid products={filtered} categories={categories} />
      ) : (
        <div className="border border-cream bg-ivory px-6 py-16 text-center text-taupe sm:px-12">
          <p className="mb-2 font-serif text-lg text-charcoal">No Products Available</p>
          <p className="text-xs">There are currently no active products in this collection.</p>
        </div>
      )}
    </div>
  )
}
