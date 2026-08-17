"use client"
import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '../../../src/components/admin/Toast'
import type { Category, Product } from '../../../src/types/models'

function formatPrice(product: Product) {
  const value = typeof product.salePrice === 'number' ? product.salePrice : product.price
  return `Tk ${value.toLocaleString('en-US')}`
}

function stockLabel(product: Product) {
  if (product.stockStatus === 'out_of_stock') return 'Out of stock'
  if (product.stockStatus === 'low_stock') return 'Low stock'
  return 'In stock'
}

export default function ProductList({ items, categories }: { items: Product[]; categories: Category[] }) {
  const toast = useToast()
  const [products, setProducts] = useState(items)
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')

  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((product) => {
      const matchesQuery = !q || [product.name, product.sku, product.slug, product.brand].some((item) => item?.toLowerCase().includes(q))
      const matchesCategory = !categoryId || product.categoryId === categoryId
      const matchesStatus = !status ||
        (status === 'active' && product.active !== false) ||
        (status === 'hidden' && product.active === false) ||
        (status === 'featured' && product.featured) ||
        (status === 'newArrival' && product.newArrival) ||
        (status === 'bestseller' && product.bestseller) ||
        product.stockStatus === status
      return matchesQuery && matchesCategory && matchesStatus
    })
  }, [categoryId, products, query, status])

  async function handleDelete(id: string) {
    if (!confirm('Delete product? This will not delete media files.')) return
    setDeletingId(id)
    setError('')

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Could not delete product.')
      setProducts((current) => current.filter((product) => product.id !== id))
      toast?.show('Product deleted successfully.')
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Could not delete product.'
      setError(message)
      toast?.show(message, 'error')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="grid gap-4">
      <div className="rounded border border-cream bg-ivory p-3">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            Search
            <input className="mt-1 w-full rounded border border-cream px-3 py-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, SKU, slug, brand" />
          </label>
          <label className="text-sm">
            Category
            <select className="mt-1 w-full rounded border border-cream px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="text-sm">
            Status
            <select className="mt-1 w-full rounded border border-cream px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="featured">Featured</option>
              <option value="newArrival">New arrival</option>
              <option value="bestseller">Bestseller</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {!products.length && (
        <div className="rounded border border-cream bg-ivory p-6 text-sm text-taupe">No products have been created yet.</div>
      )}
      {products.length > 0 && !filtered.length && (
        <div className="rounded border border-cream bg-ivory p-6 text-sm text-taupe">No products match the current filters.</div>
      )}

      {filtered.map((p) => (
        <div key={p.id} className="p-3 bg-ivory border border-cream rounded flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src={p.primaryImage || p.images?.[0] || '/products/placeholder.svg'} width={64} height={64} className="w-16 h-16 object-cover rounded" alt={p.name} />
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-taupe">
                {formatPrice(p)}
                {typeof p.salePrice === 'number' && <span className="ml-2 line-through">Tk {p.price.toLocaleString('en-US')}</span>}
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-taupe">
                {p.sku && <span>SKU: {p.sku}</span>}
                {p.categoryId && <span>{categoryNames.get(p.categoryId) || 'Unknown category'}</span>}
                {p.hasVariants && p.variants && p.variants.length > 0 && (
                  <span className="bg-cream px-1.5 py-0.5 rounded text-mocha font-medium">
                    {p.variants.length} variants ({p.stock ?? 0} stock)
                  </span>
                )}
                {!p.hasVariants && <span>{stockLabel(p)} ({p.stock ?? 0})</span>}
                {p.featured && <span>Featured</span>}
                {p.newArrival && <span>New</span>}
                {p.bestseller && <span>Bestseller</span>}
                {p.active === false && <span>Hidden</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/products/${p.id}`} className="px-3 py-1 border rounded">Edit</Link>
            <button onClick={() => handleDelete(p.id)} disabled={Boolean(deletingId)} className="px-3 py-1 border rounded disabled:cursor-not-allowed disabled:opacity-60">{deletingId === p.id ? 'Deleting...' : 'Delete'}</button>
          </div>
        </div>
      ))}
    </div>
  )
}
