"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import MediaPicker from '../../../src/components/admin/MediaPicker'
import type { Category } from '../../../src/types/models'
import { slugify } from '../../../src/lib/productValidation'

type CategoryFormProps = {
  initialCategory?: Category
  mode: 'create' | 'edit'
}

export default function CategoryForm({ initialCategory, mode }: CategoryFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialCategory?.name || '')
  const [slug, setSlug] = useState(initialCategory?.slug || '')
  const [description, setDescription] = useState(initialCategory?.description || '')
  const [image, setImage] = useState(initialCategory?.image || '')
  const [active, setActive] = useState(initialCategory?.active ?? true)
  const [sortOrder, setSortOrder] = useState(String(initialCategory?.sortOrder ?? 0))
  const [slugTouched, setSlugTouched] = useState(Boolean(initialCategory?.slug))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(nextName: string) {
    setName(nextName)
    if (!slugTouched) {
      setSlug(slugify(nextName))
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      name: name.trim(),
      slug: (slug || slugify(name)).trim(),
      description: description.trim() || undefined,
      image: image || '/products/placeholder.svg',
      active,
      sortOrder: Number(sortOrder) || 0
    }

    const url = mode === 'create' ? '/api/categories' : `/api/categories/${initialCategory?.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' }
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Failed to save category.')
      setSaving(false)
      return
    }

    setSaving(false)
    router.push('/admin/categories')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="grid gap-4 max-w-md bg-ivory border border-cream p-6 rounded">
      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          className="w-full border p-2 rounded"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true)
            setSlug(slugify(e.target.value))
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full border p-2 rounded min-h-[80px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image</label>
        <MediaPicker value={image ? [image] : []} onChange={(v: string[]) => setImage(v[0] || '')} />
        {image && (
          <div className="mt-2 relative w-32 h-32 rounded overflow-hidden border border-cream bg-white">
            <Image src={image} alt="Category preview" fill style={{ objectFit: 'cover' }} />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sort Order</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="category-active"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        <label htmlFor="category-active" className="text-sm">Active</label>
      </div>

      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-mocha text-ivory rounded disabled:opacity-60"
        >
          {saving ? 'Saving...' : mode === 'create' ? 'Create Category' : 'Save Category'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/categories')}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
