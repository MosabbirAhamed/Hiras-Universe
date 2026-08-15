import React from 'react'
import CategoryForm from '../CategoryForm'

export default function NewCategoryPage() {
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">New Category</h2>
      <CategoryForm mode="create" />
    </div>
  )
}
