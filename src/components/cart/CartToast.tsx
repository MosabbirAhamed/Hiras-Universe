"use client"

import React from 'react'
import { useCart } from '../../context/CartContext'

export default function CartToast() {
  const { toastMessage, clearToast } = useCart()

  if (!toastMessage) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100%-2.5rem)] sm:w-auto animate-fade-in pointer-events-auto"
    >
      <div className="bg-charcoal text-ivory px-4 py-3 rounded-lg shadow-xl border border-cream/20 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-gold shrink-0" aria-hidden="true" />
          <p className="font-medium truncate sm:whitespace-normal">{toastMessage}</p>
        </div>
        <button
          type="button"
          onClick={clearToast}
          aria-label="Dismiss notification"
          className="text-ivory/70 hover:text-ivory p-1 rounded transition shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
