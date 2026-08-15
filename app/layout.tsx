import './globals.css'
import React from 'react'
import type { Metadata } from 'next'
import { Header } from '../src/components/layout/Header'
import { Footer } from '../src/components/layout/Footer'
import ThemeInjector from '../src/components/theme/ThemeInjector'
import { CartProvider } from '../src/context/CartContext'
import CartDrawer from '../src/components/cart/CartDrawer'
import { getSettings } from '../src/lib/repositories/fileRepo'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_BASE_URL)
  : new URL('https://hirasuniverse.com')

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: "Hira's Universe - Curated Modest Fashion & Essentials",
    template: "%s | Hira's Universe"
  },
  description: 'Premium curated modest fashion, hijabs, handcrafted tupis, abayas, and timeless modest essentials in Bangladesh.',
  keywords: [
    'modest fashion',
    'hijab bangladesh',
    'handcrafted tupi',
    'abaya dhaka',
    'modest clothing',
    'islamic wear',
    'hiras universe'
  ],
  authors: [{ name: "Hira's Universe" }],
  creator: "Hira's Universe",
  publisher: "Hira's Universe",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl.toString(),
    siteName: "Hira's Universe",
    title: "Hira's Universe - Curated Modest Fashion & Essentials",
    description: 'Curated modest fashion, handcrafted tupis, hijabs, and timeless lifestyle essentials.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "Hira's Universe Modest Fashion"
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hira's Universe - Curated Modest Fashion",
    description: 'Premium modest fashion, handcrafted tupis, and everyday essentials in Bangladesh.',
    images: ['/og-image.jpg']
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  const storeName = settings?.storeName || "Hira's Universe"
  const storeUrl = baseUrl.toString()

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${storeUrl}/#organization`,
        name: storeName,
        url: storeUrl,
        logo: settings?.logo ? `${storeUrl}${settings.logo}` : `${storeUrl}/logo.png`,
        sameAs: Object.values(settings?.social || {}).filter(Boolean),
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: settings?.phone || '+8801700000000',
          contactType: 'customer service',
          areaServed: 'BD',
          availableLanguage: ['Bengali', 'English']
        }
      },
      {
        '@type': 'WebSite',
        '@id': `${storeUrl}/#website`,
        url: storeUrl,
        name: storeName,
        publisher: {
          '@id': `${storeUrl}/#organization`
        }
      }
    ]
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="bg-ivory text-charcoal antialiased flex min-h-screen flex-col">
        <ThemeInjector />
        <CartProvider>
          <Header />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
