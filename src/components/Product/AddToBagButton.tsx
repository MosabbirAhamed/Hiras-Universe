"use client"

import React from 'react'
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
    const isOutOfStock = (typeof stock === 'number' && stock <= 0) || active === false

    function handleAdd() {
        if (id && !isOutOfStock && !hasVariants) {
            addItem(id, 1, undefined, stock)
        }
    }

    return (
        <button
            type="button"
            onClick={handleAdd}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${title} is out of stock` : `Add ${title} to bag`}
            className={`
        w-full
        text-sm
        font-medium
        border
        rounded-md
        px-3
        py-2
        min-h-[44px]
        transition
        active:scale-[0.99]
        ${isOutOfStock
                    ? 'cursor-not-allowed border-[var(--color-border)] bg-[var(--color-muted)]/15 text-[var(--color-muted)]'
                    : 'border-[var(--color-border)] bg-[var(--color-card-background)] text-[var(--color-heading)] hover:border-[var(--color-primary)] hover:bg-[var(--color-button-background)] hover:text-[var(--color-button-text)]'
                }
      `}
        >
            {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
        </button>
    )
}
