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
    <div className="site-container py-8 md:py-12">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-sm text-taupe leading-relaxed">{category.description}</p>
        )}
      </div>

      {filtered.length > 0 ? (
        <ProductGrid products={filtered} categories={categories} />
      ) : (
        <div className="p-12 text-center text-taupe bg-ivory border border-cream rounded-lg">
          <p className="font-serif text-lg text-charcoal mb-2">No Products Available</p>
          <p className="text-xs">There are currently no active products in this collection.</p>
        </div>
      )}
    </div>
  )
}
