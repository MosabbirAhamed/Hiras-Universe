"use client"

import React from 'react'
import { useCart } from '../../context/CartContext'

export default function CartButton() {
  const { openDrawer, getItemCount, isHydrated } = useCart()
  const count = getItemCount()

  return (
    <button
      onClick={openDrawer}
      aria-label={isHydrated && count > 0 ? `Shopping bag with ${count} items` : 'Shopping bag'}
      className="p-2 relative text-charcoal hover:opacity-75 transition focus:outline-none focus:ring-2 focus:ring-gold rounded-full"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6h15l-1.5 9h-12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="1" fill="currentColor" />
        <circle cx="19" cy="20" r="1" fill="currentColor" />
      </svg>
      {isHydrated && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-mocha text-ivory text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
