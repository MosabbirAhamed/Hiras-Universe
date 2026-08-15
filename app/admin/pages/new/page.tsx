"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../../../../src/components/admin/Toast'

type PageStatus = 'draft' | 'published' | 'archived'

export default function NewPage() {
  const router = useRouter()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<PageStatus>('draft')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content,
          status,
          seo: { title: seoTitle, description: seoDesc }
        }),
        headers: { 'content-type': 'application/json' }
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not create page')
      toast?.show('Page created successfully')
      router.push('/admin/pages')
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not create page')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'min-h-10 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-mocha focus:ring-2 focus:ring-mocha/10'

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-2xl font-medium text-charcoal">New page</h1>
        <p className="mt-1 text-sm text-taupe">Create a storefront content page and choose when it is published.</p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-lg border border-cream bg-white p-4 sm:p-6">
        {error && (
          <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="page-title" className="mb-1.5 block text-sm font-medium">Title</label>
          <input id="page-title" required className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <label htmlFor="page-slug" className="mb-1.5 block text-sm font-medium">Slug</label>
          <input id="page-slug" required className={inputClass} value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="about-us" />
        </div>
        <div>
          <label htmlFor="page-content" className="mb-1.5 block text-sm font-medium">Content (HTML)</label>
          <textarea id="page-content" className={`${inputClass} min-h-48 resize-y`} value={content} onChange={(event) => setContent(event.target.value)} />
        </div>
        <div>
          <label htmlFor="page-status" className="mb-1.5 block text-sm font-medium">Status</label>
          <select id="page-status" value={status} onChange={(event) => setStatus(event.target.value as PageStatus)} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="seo-title" className="mb-1.5 block text-sm font-medium">SEO title</label>
            <input id="seo-title" className={inputClass} value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} />
          </div>
          <div>
            <label htmlFor="seo-description" className="mb-1.5 block text-sm font-medium">SEO description</label>
            <input id="seo-description" className={inputClass} value={seoDesc} onChange={(event) => setSeoDesc(event.target.value)} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-cream pt-5 sm:flex-row">
          <button type="button" onClick={() => router.push('/admin/pages')} className="min-h-10 rounded border border-gray-200 px-4 py-2 text-sm transition hover:bg-gray-50">
            Cancel
          </button>
          <button disabled={saving} className="min-h-10 rounded bg-mocha px-4 py-2 text-sm font-medium text-ivory transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Creating...' : 'Create page'}
          </button>
        </div>
      </form>
    </div>
  )
}
