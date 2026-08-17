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
    <main className="storefront-shell">
      <article className="site-container max-w-3xl py-10 sm:py-14 lg:py-20">
        <header className="mb-8 border-b border-black/10 pb-8 sm:mb-10 sm:pb-10">
          <p className="storefront-eyebrow mb-3">{"Hira's Universe"}</p>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-charcoal sm:text-4xl">
            {page.title}
          </h1>
        </header>
        <div
          className="prose prose-stone max-w-none space-y-4 leading-relaxed text-charcoal prose-headings:font-serif prose-headings:font-semibold prose-a:text-mocha prose-a:underline prose-a:decoration-mocha/30 prose-a:underline-offset-4"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content || '') }}
        />
      </article>
    </main>
  )
}
