import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hirasuniverse.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/cart',
          '/checkout',
          '/track-order',
          '/api/'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
