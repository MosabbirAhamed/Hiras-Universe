import React from 'react'
import ProductList from './ProductList'
import { getCategories, getProducts } from '../../../src/lib/repositories/fileRepo'

export default async function AdminProducts() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Products</h2>
        <a href="/admin/products/new" className="px-3 py-2 bg-mocha text-ivory rounded">Add product</a>
      </div>
      <ProductList items={products} categories={categories} />
    </div>
  )
}
