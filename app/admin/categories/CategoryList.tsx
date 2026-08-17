"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '../../../src/components/admin/Toast'
import type { Category } from '../../../src/types/models'

export default function CategoryList({ items }: { items: Category[] }) {
  const toast = useToast()
  const [categories, setCategories] = useState(items)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? This action cannot be undone.')) return

    setDeletingId(id)
    setError('')
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not delete category.')
      setCategories((current) => current.filter((category) => category.id !== id))
      toast?.show('Category deleted successfully.')
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Could not delete category.'
      setError(message)
      toast?.show(message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const sortedCategories = [...categories].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  )

  if (!sortedCategories.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
        No categories have been created yet.
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {sortedCategories.map((category) => (
        <article
          key={category.id}
          className="flex flex-col gap-4 rounded-lg border border-cream bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src={category.image ?? '/products/placeholder.svg'}
              width={64}
              height={64}
              className="h-16 w-16 shrink-0 rounded object-cover"
              alt={category.name}
            />
            <div className="min-w-0">
              <div className="truncate font-medium text-charcoal">{category.name}</div>
              <div className="text-sm text-taupe">{category.active !== false ? 'Active' : 'Hidden'}</div>
              {category.slug && <div className="truncate text-xs text-taupe">/{category.slug}</div>}
            </div>
          </div>

          <div className="flex gap-2 sm:shrink-0">
            <Link
              href={`/admin/categories/${category.id}`}
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded border border-gray-200 px-3 py-2 text-sm transition hover:bg-gray-50 sm:flex-none"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(category.id)}
              disabled={deletingId !== null}
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded border border-red-200 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {deletingId === category.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
