"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../../../../src/components/admin/Toast'

type EditablePage = {
  id: string
  title: string
  slug: string
  content: string
  status: 'draft' | 'published' | 'archived'
  seo?: { title?: string; description?: string }
}

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const toast = useToast()
  const [page, setPage] = useState<EditablePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/pages/${params.id}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.error || 'Could not load page')
        setPage(data)
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load page'))
      .finally(() => setLoading(false))
  }, [params.id])

  async function save() {
    if (!page || saving) return
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        body: JSON.stringify(page),
        headers: { 'content-type': 'application/json' }
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not save page.')
      if (!data?.id) throw new Error('The server returned an invalid page response.')

      setPage(data)
      toast?.show('Page saved successfully.')
      router.push('/admin/pages')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Could not save page.'
      setError(message)
      toast?.show(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'min-h-10 w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-mocha focus:ring-2 focus:ring-mocha/10'

  if (loading) return <div className="py-12 text-center text-sm text-taupe">Loading page...</div>

  if (!page) {
    return (
      <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error || 'Page not found'}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h1 className="text-2xl font-medium text-charcoal">Edit page</h1>
        <p className="mt-1 text-sm text-taupe">Update page content, publishing status, and search metadata.</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
        className="space-y-5 rounded-lg border border-cream bg-white p-4 sm:p-6"
      >
        {error && (
          <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="page-title" className="mb-1.5 block text-sm font-medium">Title</label>
          <input id="page-title" required className={inputClass} value={page.title || ''} onChange={(event) => setPage({ ...page, title: event.target.value })} />
        </div>
        <div>
          <label htmlFor="page-slug" className="mb-1.5 block text-sm font-medium">Slug</label>
          <input id="page-slug" required className={inputClass} value={page.slug || ''} onChange={(event) => setPage({ ...page, slug: event.target.value })} />
        </div>
        <div>
          <label htmlFor="page-content" className="mb-1.5 block text-sm font-medium">Content (HTML)</label>
          <textarea id="page-content" className={`${inputClass} min-h-48 resize-y`} value={page.content || ''} onChange={(event) => setPage({ ...page, content: event.target.value })} />
        </div>
        <div>
          <label htmlFor="page-status" className="mb-1.5 block text-sm font-medium">Status</label>
          <select id="page-status" value={page.status || 'draft'} onChange={(event) => setPage({ ...page, status: event.target.value as EditablePage['status'] })} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="seo-title" className="mb-1.5 block text-sm font-medium">SEO title</label>
            <input
              id="seo-title"
              className={inputClass}
              value={page.seo?.title || ''}
              onChange={(event) => setPage({ ...page, seo: { ...page.seo, title: event.target.value } })}
            />
          </div>
          <div>
            <label htmlFor="seo-description" className="mb-1.5 block text-sm font-medium">SEO description</label>
            <input
              id="seo-description"
              className={inputClass}
              value={page.seo?.description || ''}
              onChange={(event) => setPage({ ...page, seo: { ...page.seo, description: event.target.value } })}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-cream pt-5 sm:flex-row">
          <button type="button" onClick={() => router.push('/admin/pages')} className="min-h-10 rounded border border-gray-200 px-4 py-2 text-sm transition hover:bg-gray-50">
            Cancel
          </button>
          <button disabled={saving} className="min-h-10 rounded bg-mocha px-4 py-2 text-sm font-medium text-ivory transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
