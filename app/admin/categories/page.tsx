import React from 'react'
import Link from 'next/link'
import { getCategories } from '../../../src/lib/repositories/fileRepo'
import CategoryList from './CategoryList'

export default async function AdminCategories() {
  const cats = await getCategories()
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Categories</h2>
        <Link href="/admin/categories/new" className="px-3 py-2 bg-mocha text-ivory rounded">Add category</Link>
      </div>
      <CategoryList items={cats} />
    </div>
  )
}
