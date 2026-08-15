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
                    ? 'bg-taupe/20 text-taupe/70 border-cream cursor-not-allowed'
                    : 'text-charcoal bg-ivory hover:bg-mocha hover:text-ivory border-cream'
                }
      `}
        >
            {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
        </button>
    )
}
