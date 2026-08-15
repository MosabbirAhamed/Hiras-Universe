import React from 'react'
import ProductForm from '../ProductForm'
import { getCategories, getProductById } from '../../../../src/lib/repositories/fileRepo'

export default async function EditProduct({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    getProductById(params.id),
    getCategories()
  ])

  if (!product) {
    return (
      <div className="rounded border border-cream bg-ivory p-6">
        <h2 className="text-lg font-medium">Product not found</h2>
        <p className="mt-2 text-sm text-taupe">The requested product does not exist or has been deleted.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Edit Product</h2>
      <ProductForm mode="edit" initialProduct={product} categories={categories} />
    </div>
  )
}
