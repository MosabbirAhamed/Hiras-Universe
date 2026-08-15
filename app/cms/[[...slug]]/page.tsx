import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPages } from '../../../src/lib/repositories/fileRepo'
import { sanitizeHtml } from '../../../src/lib/sanitizeHtml'

export async function generateMetadata({ params }: { params: { slug?: string[] } }): Promise<Metadata> {
  const slugArr: string[] = params?.slug || []
  const slug = slugArr.join('/') || ''
  const pages = await getPages()
  const page = pages.find((p) => p.slug === slug)

  if (!page || page.status !== 'published') {
    return {
      title: 'Page Not Found',
      robots: { index: false, follow: false }
    }
  }

  const title = page.seo?.title || page.title
  const description = page.seo?.description || `Read ${page.title} on Hira's Universe.`

  return {
    title,
    description,
    alternates: {
      canonical: `/cms/${page.slug}`
    },
    openGraph: {
      title: `${page.title} - Hira's Universe`,
      description,
      url: `/cms/${page.slug}`
    }
  }
}

export default async function CmsPage({ params }: { params: { slug?: string[] } }) {
  const slugArr: string[] = params?.slug || []
  const slug = slugArr.join('/') || ''
  const pages = await getPages()
  const page = pages.find((p) => p.slug === slug)

  if (!page || page.status !== 'published') {
    return notFound()
  }

  return (
    <div className="site-container py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal mb-6 border-b border-cream pb-4">
        {page.title}
      </h1>
      <div
        className="prose prose-stone max-w-none text-charcoal leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content || '') }}
      />
    </div>
  )
}
