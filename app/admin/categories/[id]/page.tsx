import React from 'react'
import CategoryForm from '../CategoryForm'
import { getCategoryById } from '../../../../src/lib/repositories/fileRepo'

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await getCategoryById(params.id)

  if (!category) {
    return (
      <div className="rounded border border-cream bg-ivory p-6">
        <h2 className="text-lg font-medium">Category not found</h2>
        <p className="mt-2 text-sm text-taupe">The requested category does not exist or has been deleted.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Edit Category</h2>
      <CategoryForm mode="edit" initialCategory={category} />
    </div>
  )
}
