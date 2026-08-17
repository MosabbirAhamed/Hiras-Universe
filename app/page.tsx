import React from 'react'
import Hero from '../src/components/Hero/Hero'
import CategoryScroller from '../src/components/Category/CategoryScroller'
import SectionHeading from '../src/components/SectionHeading'
import ProductGrid from '../src/components/Product/ProductGrid'
import ProductCarousel from '../src/components/Product/ProductCarousel'
import EditorialBanner from '../src/components/Editorial/EditorialBanner'
import TrustSection from '../src/components/Trust/TrustSection'
import Newsletter from '../src/components/Newsletter/Newsletter'
import { getCategories, getHomepageSections, getProducts } from '../src/lib/repositories/fileRepo'

export const revalidate = 300

export default async function Home() {
  const [allProducts, allCategories, homepageSections] = await Promise.all([
    getProducts(),
    getCategories(),
    getHomepageSections()
  ])

  const products = allProducts
    .filter((product) => product.active !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const categories = allCategories
    .filter((category) => category.active !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const hero = homepageSections.find((section) => section.enabled !== false && section.type === 'hero')?.data ?? {}
  const featuredProductIds = homepageSections.find((section) => section.enabled !== false && section.type === 'featured_products')?.data?.productIds
  const featuredIds: string[] = Array.isArray(featuredProductIds) ? featuredProductIds : []
  const featuredProducts = featuredIds.length
    ? featuredIds
      .map((id: string) => products.find((product) => product.id === id))
      .filter((product): product is (typeof products)[number] => Boolean(product))
    : products.filter((product) => product.featured)
  const newArrivals = products.filter((product) => product.newArrival)

  const primaryProducts = featuredProducts.length ? featuredProducts : products.slice(0, 6)
  const arrivalProducts = newArrivals.slice(0, 8)

  return (
    <main className="storefront-shell">
      <div className="site-container pb-16 sm:pb-24">
        <Hero headline={hero.headline} sub={hero.sub} image={hero.image} />

        {categories.length ? (
          <section className="mt-16 sm:mt-24">
            <SectionHeading title="Shop by category" eyebrow="Find your edit" href="/category" />
            <CategoryScroller categories={categories} />
          </section>
        ) : null}

        {primaryProducts.length ? (
          <section className="mt-16 sm:mt-24">
            <SectionHeading title="Featured pieces" subtitle="A focused selection from the current collection." eyebrow="Curated now" href="/products" />
            <ProductCarousel products={primaryProducts} categories={categories} />
          </section>
        ) : null}

        {arrivalProducts.length ? (
          <section className="mt-16 sm:mt-24">
            <SectionHeading title="New arrivals" subtitle="The latest additions to Hira's Universe." eyebrow="Just in" href="/products" />
            <ProductGrid products={arrivalProducts} categories={categories} />
          </section>
        ) : null}

        <section className="mt-16 sm:mt-24">
          <EditorialBanner />
        </section>

        {products.length ? (
          <section className="mt-16 sm:mt-24">
            <SectionHeading title="The current selection" subtitle="Every active piece, brought together for considered browsing." eyebrow="Explore more" href="/products" />
            <ProductCarousel products={products.slice(0, 8)} categories={categories} />
          </section>
        ) : null}

        <section className="mt-16 sm:mt-24">
          <TrustSection />
        </section>

        <section className="mt-8 sm:mt-10">
          <Newsletter />
        </section>
      </div>
    </main>
  )
}
