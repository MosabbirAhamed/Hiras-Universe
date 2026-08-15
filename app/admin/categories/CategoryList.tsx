"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '../../../src/types/models'

export default function CategoryList({ items }: { items: Category[] }) {
  async function handleDelete(id: string) {
    if (!confirm('Delete category?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    window.location.reload()
  }

  return (
    <div className="grid gap-3">
      {items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((c) => (
        <div key={c.id} className="p-3 bg-ivory border border-cream rounded flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={c.image ?? '/products/placeholder.svg'}
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded"
              alt={c.name}
            />
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-taupe">{c.active !== false ? 'Active' : 'Hidden'}</div>
              {c.slug && <div className="text-xs text-taupe">/{c.slug}</div>}
            </div>
          </div>
          <div className="space-x-2">
            <Link href={`/admin/categories/${c.id}`} className="px-3 py-1 border rounded">Edit</Link>
            <button onClick={() => handleDelete(c.id)} className="px-3 py-1 border rounded">Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
