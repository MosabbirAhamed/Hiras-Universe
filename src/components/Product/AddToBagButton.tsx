"use client"

import React, { useState } from 'react'
import { useCart } from '../../context/CartContext'

type Props = {
  id?: string
  title: string
  stock?: number
  active?: boolean
  hasVariants?: boolean
}

export default function AddToBagButton({ id, title, stock, active, hasVariants }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const isOutOfStock = (typeof stock === 'number' && stock <= 0) || active === false

  function handleAdd() {
    if (id && !isOutOfStock && !hasVariants) {
      addItem(id, 1, undefined, stock)
      setAdded(true)
      setTimeout(() => setAdded(false), 1400)
    }
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={isOutOfStock}
      aria-label={isOutOfStock ? `${title} is out of stock` : `Add ${title} to bag`}
      className={`
        flex w-full items-center justify-center
        min-h-[40px] px-3 py-2
        rounded-[var(--radius-button)]
        text-[11px] font-bold uppercase tracking-[0.1em]
        transition active:scale-[0.99]
        ${isOutOfStock
          ? 'cursor-not-allowed border border-[var(--color-border)] bg-[var(--color-section-background)] text-[var(--color-muted)]'
          : added
            ? 'bg-[var(--color-success)] text-white shadow-sm'
            : 'bg-[var(--color-button-background)] text-[var(--color-button-text)] hover:bg-[var(--color-button-hover)] shadow-sm'
        }
      `}
    >
      {isOutOfStock ? 'Out of Stock' : added ? 'Added ✓' : 'Add to Bag'}
    </button>
  )
}
