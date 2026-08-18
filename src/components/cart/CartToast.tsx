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
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-footer-background)] px-4 py-3 text-sm text-[var(--color-footer-text)] shadow-xl">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
          <p className="font-medium truncate sm:whitespace-normal">{toastMessage}</p>
        </div>
        <button
          type="button"
          onClick={clearToast}
          aria-label="Dismiss notification"
          className="shrink-0 rounded p-1 text-[var(--color-footer-text)] opacity-70 transition hover:opacity-100"
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
