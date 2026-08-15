import React from 'react'
import Link from 'next/link'
import { getCategories } from '../../../src/lib/repositories/fileRepo'
import CategoryList from './CategoryList'

export default async function AdminCategories() {
  const categories = await getCategories()

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-charcoal">Categories</h1>
          <p className="mt-1 text-sm text-taupe">Organize products and control category visibility.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex min-h-10 items-center justify-center rounded bg-mocha px-4 py-2 text-sm font-medium text-ivory transition hover:opacity-90"
        >
          Add category
        </Link>
      </div>
      <CategoryList items={categories} />
    </div>
  )
}
