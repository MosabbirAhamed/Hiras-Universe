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
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-header-text)] transition hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6h15l-1.5 9h-12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="1" fill="currentColor" />
        <circle cx="19" cy="20" r="1" fill="currentColor" />
      </svg>
      {isHydrated && count > 0 && (
        <span className="absolute right-0 top-0 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-[var(--color-on-primary)] shadow-xs">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
