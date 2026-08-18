"use client"

import React from 'react'
import { useCart } from '../../context/CartContext'

export default function CartButton() {
  const { openDrawer, getItemCount, isHydrated } = useCart()
  const count = getItemCount()

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={isHydrated && count > 0 ? `Shopping bag with ${count} items` : 'Shopping bag'}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-header-text)]/75 transition hover:bg-[var(--color-section-background)] hover:text-[var(--color-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8h12l1 13H5L6 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </svg>
      {isHydrated && count > 0 && (
        <span className="absolute right-0 top-0 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[9px] font-bold text-[var(--color-on-primary)] shadow-sm">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
