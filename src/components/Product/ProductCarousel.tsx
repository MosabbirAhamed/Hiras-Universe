import React from 'react'
import ProductCard from './ProductCard'
import type { Category, Product } from '../../types/models'

function formatPrice(value?: number | null) {
  return typeof value === 'number' ? `Tk ${value.toLocaleString('en-US')}` : undefined
}

const ProductCarousel = ({ products, categories = [] }: { products: Product[]; categories?: Category[] }) => {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]))
  return (
    <div className="mt-3 -mx-4 px-4">
      <div className="flex gap-3 overflow-x-auto pb-3 hide-scrollbar">
        {products.map((p) => {
          const hasVariants = Boolean(p.hasVariants && Array.isArray(p.variants) && p.variants.length > 0)
          const activeVariants = hasVariants ? (p.variants || []).filter((v) => v.active) : []
          const prices = activeVariants.map((v) => (typeof v.salePrice === 'number' && v.salePrice < v.price ? v.salePrice : v.price))
          const hasPriceVariation = prices.length > 1 && Math.min(...prices) !== Math.max(...prices)

          return (
            <div key={p.id} className="w-44 flex-shrink-0">
              <ProductCard
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
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProductCarousel
