"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '../../../src/components/admin/Toast'
import type { Category } from '../../../src/types/models'

type CategoryRow = { category: Category; depth: number }

function flattenCategories(categories: Category[], parentId: string | null = null, depth = 0): CategoryRow[] {
  return categories
    .filter((category) => (category.parentId || null) === parentId)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
    .flatMap((category) => [
      { category, depth },
      ...flattenCategories(categories, category.id, depth + 1),
    ])
}

export default function CategoryList({ items }: { items: Category[] }) {
  const toast = useToast()
  const [categories, setCategories] = useState(items)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Child categories will become top-level categories.')) return
    setBusyId(id)
    setError('')
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not delete category.')
      setCategories((current) => current
        .filter((category) => category.id !== id)
        .map((category) => category.parentId === id ? { ...category, parentId: null } : category))
      toast?.show('Category deleted successfully.')
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Could not delete category.'
      setError(message)
      toast?.show(message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function moveCategory(category: Category, direction: -1 | 1) {
    const siblings = categories
      .filter((item) => (item.parentId || null) === (category.parentId || null))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
    const index = siblings.findIndex((item) => item.id === category.id)
    const swapWith = siblings[index + direction]
    if (!swapWith) return
    setBusyId(category.id)
    setError('')
    const categoryOrder = category.sortOrder ?? index
    const swapOrder = swapWith.sortOrder ?? index + direction
    try {
      const responses = await Promise.all([
        fetch(`/api/categories/${category.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...category, sortOrder: swapOrder }) }),
        fetch(`/api/categories/${swapWith.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...swapWith, sortOrder: categoryOrder }) }),
      ])
      if (responses.some((response) => !response.ok)) throw new Error('Could not reorder categories.')
      setCategories((current) => current.map((item) => {
        if (item.id === category.id) return { ...item, sortOrder: swapOrder }
        if (item.id === swapWith.id) return { ...item, sortOrder: categoryOrder }
        return item
      }))
      toast?.show('Category order updated successfully.')
    } catch (moveError) {
      const message = moveError instanceof Error ? moveError.message : 'Could not reorder categories.'
      setError(message)
      toast?.show(message, 'error')
    } finally {
      setBusyId(null)
    }
  }

  const rows = flattenCategories(categories)
  if (!rows.length) return <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No categories have been created yet.</div>

  return (
    <div className="grid gap-3">
      {error && <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {rows.map(({ category, depth }) => {
        const siblings = categories.filter((item) => (item.parentId || null) === (category.parentId || null)).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name))
        const siblingIndex = siblings.findIndex((item) => item.id === category.id)
        const parent = categories.find((item) => item.id === category.parentId)
        return (
          <article key={category.id} className="flex flex-col gap-4 rounded-lg border border-cream bg-white p-3 sm:flex-row sm:items-center sm:justify-between" style={{ marginLeft: `${Math.min(depth, 3) * 16}px` }}>
            <div className="flex min-w-0 items-center gap-3">
              <Image src={category.image || '/products/placeholder.svg'} width={64} height={64} className="h-16 w-16 shrink-0 rounded object-cover" alt={category.name} />
              <div className="min-w-0">
                <div className="truncate font-medium text-charcoal">{category.name}</div>
                <div className="flex flex-wrap gap-x-2 text-sm text-taupe"><span>{category.active !== false ? 'Active' : 'Hidden'}</span>{category.featured && <span>Featured</span>}{parent && <span>Under {parent.name}</span>}</div>
                {category.slug && <div className="truncate text-xs text-taupe">/{category.slug}</div>}
                <div className="text-xs text-taupe">{category.selectedProductIds?.length ?? 0} curated products</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:shrink-0">
              <button type="button" title="Move up" aria-label={`Move ${category.name} up`} onClick={() => moveCategory(category, -1)} disabled={busyId !== null || siblingIndex === 0} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded border px-2 disabled:opacity-40">↑</button>
              <button type="button" title="Move down" aria-label={`Move ${category.name} down`} onClick={() => moveCategory(category, 1)} disabled={busyId !== null || siblingIndex === siblings.length - 1} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded border px-2 disabled:opacity-40">↓</button>
              <Link href={`/admin/categories/${category.id}`} className="inline-flex min-h-10 items-center justify-center rounded border border-gray-200 px-3 py-2 text-sm transition hover:bg-gray-50">Edit</Link>
              <button type="button" onClick={() => handleDelete(category.id)} disabled={busyId !== null} className="inline-flex min-h-10 items-center justify-center rounded border border-red-200 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60">{busyId === category.id ? 'Working...' : 'Delete'}</button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
