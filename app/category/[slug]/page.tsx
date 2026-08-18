import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProducts, getCategories } from '../../../src/lib/repositories/fileRepo'
import ProductGrid from '../../../src/components/Product/ProductGrid'
import type { Category } from '../../../src/types/models'

function getCategoryPath(category: Category, categories: Category[]) {
  const path: Category[] = []
  const seen = new Set<string>()
  let current: Category | undefined = category

  while (current && !seen.has(current.id)) {
    path.unshift(current)
    seen.add(current.id)
    current = current.parentId
      ? categories.find((candidate) => candidate.id === current?.parentId)
      : undefined
  }

  return path
}

function getDescendantIds(categoryId: string, categories: Category[]) {
  const descendants = new Set<string>([categoryId])
  const pending = [categoryId]

  while (pending.length) {
    const parentId = pending.shift() as string
    categories.forEach((candidate) => {
      if (candidate.parentId === parentId && !descendants.has(candidate.id)) {
        descendants.add(candidate.id)
        pending.push(candidate.id)
      }
    })
  }

  return descendants
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const categories = await getCategories()
  const category = categories.find((c) => (c.slug === params.slug || c.id === params.slug) && c.active !== false)
  if (!category) {
    return {
      title: 'Category Not Found',
      robots: { index: false, follow: false }
    }
  }

  const title = category.seoTitle || `${category.name} Collection`
  const description = category.seoDescription || category.description || `Browse the exclusive ${category.name} collection at Hira's Universe.`
  const ogImages = category.bannerImage || category.image ? [category.bannerImage || category.image as string] : ['/og-image.jpg']

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

  const path = getCategoryPath(category, categories)
  const categoryIds = getDescendantIds(category.id, categories)
  const availableProducts = products.filter(
    (product) => product.categoryId && categoryIds.has(product.categoryId) && product.active !== false && product.visibility !== 'hidden'
  )
  const availableById = new Map(availableProducts.map((product) => [product.id, product]))
  const curated = (category.selectedProductIds || [])
    .map((id) => availableById.get(id))
    .filter((product): product is (typeof availableProducts)[number] => Boolean(product))
  const curatedIds = new Set(curated.map((product) => product.id))
  const filtered = [
    ...curated,
    ...availableProducts
      .filter((product) => !curatedIds.has(product.id))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)),
  ]
  const childCategories = categories
    .filter((candidate) => candidate.parentId === category.id && candidate.active !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))

  return (
    <main className="storefront-shell">
      <div className="site-container pb-16 pt-8 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14">
        <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
          <Link href="/" className="transition hover:text-[var(--color-heading)]">Home</Link>
          {path.map((item, index) => (
            <React.Fragment key={item.id}>
              <span aria-hidden="true">/</span>
              {index === path.length - 1 ? (
                <span className="text-[var(--color-heading)]">{item.name}</span>
              ) : (
                <Link href={`/category/${item.slug || item.id}`} className="transition hover:text-[var(--color-heading)]">{item.name}</Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        <header className="mb-9 border-b border-[var(--color-border)] pb-8 sm:mb-12 sm:pb-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="storefront-eyebrow mb-4">Curated collection</p>
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] text-[var(--color-heading)] sm:text-5xl lg:text-6xl">{category.name}</h1>
              {category.description && <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">{category.description}</p>}
            </div>
            <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}</p>
          </div>
          {category.bannerImage || category.image ? (
            <div className="relative mt-8 aspect-[3/1] min-h-[150px] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-section-background)] sm:min-h-[210px]">
              <Image src={(category.bannerImage || category.image) as string} alt={category.name} fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
            </div>
          ) : null}
        </header>

        {childCategories.length ? (
          <nav aria-label={`${category.name} subcategories`} className="mb-9 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {childCategories.map((child) => (
              <Link key={child.id} href={`/category/${child.slug || child.id}`} className="shrink-0 border border-[var(--color-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--color-heading)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                {child.name}
              </Link>
            ))}
          </nav>
        ) : null}

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
