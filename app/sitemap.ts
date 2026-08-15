import { MetadataRoute } from 'next'
import { getProducts, getCategories, getPages } from '../src/lib/repositories/fileRepo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hirasuniverse.com'

  const [products, categories, pages] = await Promise.all([
    getProducts(),
    getCategories(),
    getPages()
  ])

  const now = new Date()

  // 1. Static Core Storefront Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/category`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8
    }
  ]

  // 2. Active Public Product Pages
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => p.active !== false && p.visibility !== 'hidden' && p.slug)
    .map((p) => ({
      url: `${baseUrl}/products/${encodeURIComponent(p.slug as string)}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'daily',
      priority: p.featured ? 0.9 : 0.8
    }))

  // 3. Active Category Pages
  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((c) => c.active !== false)
    .map((c) => ({
      url: `${baseUrl}/category/${encodeURIComponent(c.slug || c.id)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7
    }))

  // 4. Published CMS Pages
  const cmsRoutes: MetadataRoute.Sitemap = pages
    .filter((p) => p.status === 'published' && p.slug)
    .map((p) => ({
      url: `${baseUrl}/cms/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.5
    }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...cmsRoutes]
}
