import React from 'react'
import ProductForm from '../ProductForm'
import { getCategories } from '../../../../src/lib/repositories/fileRepo'

export default async function NewProduct() {
  const categories = await getCategories()
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">New Product</h2>
      <ProductForm mode="create" categories={categories} />
    </div>
  )
}
