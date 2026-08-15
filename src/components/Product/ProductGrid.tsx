import React from 'react'
import ProductCard from './ProductCard'
import type { Category, Product } from '../../types/models'

function formatPrice(value?: number | null) {
  return typeof value === 'number' ? `Tk ${value.toLocaleString('en-US')}` : undefined
}

const ProductGrid = ({ products, categories = [] }: { products: Product[]; categories?: Category[] }) => {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]))
  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => {
        const hasVariants = Boolean(p.hasVariants && Array.isArray(p.variants) && p.variants.length > 0)
        const activeVariants = hasVariants ? (p.variants || []).filter((v) => v.active) : []
        const prices = activeVariants.map((v) => (typeof v.salePrice === 'number' && v.salePrice < v.price ? v.salePrice : v.price))
        const hasPriceVariation = prices.length > 1 && Math.min(...prices) !== Math.max(...prices)

        return (
          <ProductCard
            key={p.id}
            id={p.id}
            title={p.name}
            slug={p.slug}
            stock={p.stock}
            price={formatPrice(p.price) ?? ''}
            salePrice={formatPrice(p.salePrice)}
            image={p.primaryImage || p.images?.[0]}
            category={p.categoryId ? categoryNames.get(p.categoryId) : undefined}
            onSale={p.onSale}
            hasVariants={hasVariants}
            pricePrefix={hasVariants && hasPriceVariation ? 'From' : undefined}
          />
        )
      })}
    </div>
  )
}

export default ProductGrid
