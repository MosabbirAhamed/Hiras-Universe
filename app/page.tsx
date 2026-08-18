import React from 'react'
import Hero from '../src/components/Hero/Hero'
import CategoryNavigation from '../src/components/Category/CategoryScroller'
import PromotionalCards from '../src/components/Editorial/PromotionalCards'
import FlashSale from '../src/components/Product/FlashSale'
import ProductCard from '../src/components/Product/ProductCard'
import TrustSection from '../src/components/Trust/TrustSection'
import Newsletter from '../src/components/Newsletter/Newsletter'
import Link from 'next/link'
import { getCategories, getHomepageSections, getProducts } from '../src/lib/repositories/fileRepo'

export const revalidate = 300

function formatPrice(val: number) {
  return `Tk ${val.toLocaleString('en-US')}`
}

export default async function Home() {
  const [allProducts, allCategories, homepageSections] = await Promise.all([
    getProducts(),
    getCategories(),
    getHomepageSections(),
  ])

  // Storefront-visible items only
  const products = allProducts
    .filter((product) => product.active !== false && product.visibility !== 'hidden')
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  const categories = allCategories
    .filter((category) => category.active !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  const hero = homepageSections.find(
    (section) => section.enabled !== false && section.type === 'hero'
  )?.data ?? {}

  // Filter sale products for Flash Sale section; fallback to featured or first 6 products
  const saleProducts = products.filter((p) => p.onSale)
  const flashSaleItems = saleProducts.length >= 3
    ? saleProducts
    : products.filter((p) => p.featured).length >= 3
      ? products.filter((p) => p.featured)
      : products.slice(0, 6)

  // Featured grid products (deduplicated)
  const featuredProductIds = homepageSections.find(
    (section) => section.enabled !== false && section.type === 'featured_products'
  )?.data?.productIds

  const featuredIds: string[] = Array.isArray(featuredProductIds) ? featuredProductIds : []
  const configuredFeatured = featuredIds.length
    ? featuredIds
      .map((id: string) => products.find((product) => product.id === id))
      .filter((product): product is (typeof products)[number] => Boolean(product))
    : products.filter((product) => product.featured)

  const featuredGridProducts = configuredFeatured.length
    ? configuredFeatured
    : products.slice(0, 8)

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  return (
    <div className="storefront-shell">
      <div className="site-container space-y-12 py-6 sm:space-y-16 sm:py-8 lg:space-y-20 lg:py-10">

        {/* 1. Split Hero Section */}
        <Hero
          headline={hero.headline}
          sub={hero.sub}
          image={hero.image}
        />

        {/* 2. Circular Category Navigation */}
        {categories.some((category) => !category.parentId && category.featured !== false) ? (
          <section aria-label="Categories">
            <CategoryNavigation categories={categories} />
          </section>
        ) : null}

        {/* 3. Three Promotional Cards */}
        <section aria-label="Featured Collections">
          <PromotionalCards />
        </section>

        {/* 4. Flash Sale with Live Countdown */}
        {flashSaleItems.length ? (
          <FlashSale
            products={flashSaleItems}
            categories={categories}
          />
        ) : null}

        {/* 5. Featured Products Grid */}
        {featuredGridProducts.length ? (
          <section aria-labelledby="featured-heading">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Curated Now
                </p>
                <h2
                  id="featured-heading"
                  className="mt-1 font-serif text-[22px] font-bold text-[var(--color-heading)] sm:text-[26px]"
                >
                  Featured Pieces
                </h2>
              </div>
              <Link
                href="/products"
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)] transition hover:text-[var(--color-heading)]"
              >
                View All
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
              {featuredGridProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  price={formatPrice(product.price)}
                  salePrice={product.salePrice ? formatPrice(product.salePrice) : undefined}
                  image={product.primaryImage || product.images?.[0]}
                  category={product.categoryId ? categoryMap[product.categoryId] : undefined}
                  onSale={product.onSale}
                  slug={product.slug}
                  stock={product.stock}
                  active={product.active}
                  hasVariants={product.hasVariants}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* 6. Trust / Value Proposition Section */}
        <section aria-label="Store Benefits">
          <TrustSection />
        </section>

        {/* 7. Newsletter Section */}
        <section aria-label="Newsletter">
          <Newsletter />
        </section>

      </div>
    </div>
  )
}
