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

  return (
    <div className="site-container pb-16 sm:pb-24">
      <Hero headline={hero.headline} sub={hero.sub} image={hero.image} />

      <section className="mt-12 sm:mt-16">
        <SectionHeading title="Shop by Category" />
        <CategoryScroller categories={categories} />
      </section>

      <section className="mt-14 sm:mt-20">
        <SectionHeading title="Premium Tupi Collection" subtitle="Tradition, refined." />
        <ProductCarousel products={featuredProducts.length ? featuredProducts : products.slice(0, 5)} categories={categories} />
      </section>

      <section className="mt-14 sm:mt-20">
        <SectionHeading title="New Arrivals" />
        <ProductGrid products={(newArrivals.length ? newArrivals : products).slice(0, 8)} categories={categories} />
      </section>

      <section className="mt-14 sm:mt-20">
        <SectionHeading title="Women's Collection" />
        <EditorialBanner />
      </section>

      <section className="mt-14 sm:mt-20">
        <SectionHeading title="Islamic Gift Sets" subtitle="Thoughtful gifts. Timeless blessings." />
        <ProductGrid products={products.slice(0, 4)} categories={categories} />
      </section>

      <section className="mt-14 sm:mt-20">
        <SectionHeading title="Best Sellers" />
        <ProductCarousel products={products.slice(0, 6)} categories={categories} />
      </section>

      <section className="mt-16 sm:mt-24">
        <TrustSection />
      </section>

      <section className="mt-10 sm:mt-12">
        <Newsletter />
      </section>
    </div>
  )
}
