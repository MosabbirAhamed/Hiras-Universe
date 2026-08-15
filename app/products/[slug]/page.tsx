import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProducts, getCategories } from '../../../src/lib/repositories/fileRepo'
import ProductDetail from '../../../src/components/Product/ProductDetail'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const products = await getProducts()
  const product = products.find((p) => p.slug === params.slug && p.active !== false && p.visibility !== 'hidden')
  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: false }
    }
  }

  const effectivePrice =
    typeof product.salePrice === 'number' && product.salePrice > 0 && product.salePrice < product.price
      ? product.salePrice
      : product.price

  const title = product.seoTitle || `${product.name} - Tk ${effectivePrice}`
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description?.replace(/<[^>]*>/g, '').substring(0, 160) ||
    `Order ${product.name} online from Hira's Universe.`

  const ogImages = product.primaryImage
    ? [product.primaryImage]
    : Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['/og-image.jpg']

  return {
    title,
    description,
    keywords: product.seoKeywords || product.tags || [product.name, 'modest fashion'],
    alternates: {
      canonical: `/products/${encodeURIComponent(product.slug || product.id)}`
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/products/${encodeURIComponent(product.slug || product.id)}`,
      images: ogImages.map((img) => ({
        url: img,
        alt: product.name
      }))
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages
    }
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const product = products.find((p) => p.slug === params.slug && p.active !== false && p.visibility !== 'hidden')
  if (!product) return notFound()

  const category = categories.find((c) => c.id === product.categoryId)

  // Compute pricing and availability for schema
  const isAvailable = product.hasVariants
    ? Boolean(product.variants?.some((v) => v.active !== false && (v.stock ?? 0) > 0))
    : (product.stock ?? 0) > 0

  const effectivePrice =
    typeof product.salePrice === 'number' && product.salePrice > 0 && product.salePrice < product.price
      ? product.salePrice
      : product.price

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hirasuniverse.com'
  const productUrl = `${baseUrl}/products/${encodeURIComponent(product.slug || product.id)}`
  const primaryImage = product.primaryImage || (product.images && product.images[0]) || `${baseUrl}/og-image.jpg`

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, '') || product.shortDescription || product.name,
    image: primaryImage.startsWith('http') ? primaryImage : `${baseUrl}${primaryImage}`,
    sku: product.sku || `PROD-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: product.brand || "Hira's Universe"
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'BDT',
      price: effectivePrice,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: "Hira's Universe"
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetail product={product} category={category} categories={categories} />
    </>
  )
}
