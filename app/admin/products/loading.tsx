import React from 'react'

export default function ProductsLoading() {
  return (
    <div className="grid gap-3">
      <div className="h-8 w-40 rounded bg-cream" />
      <div className="rounded border border-cream bg-ivory p-6 text-sm text-taupe">Loading products...</div>
    </div>
  )
}
