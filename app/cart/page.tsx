"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart, getCartItemKey } from '../../src/context/CartContext'

function formatPrice(val: number) {
  return `Tk ${val.toLocaleString('en-US')}`
}

export default function CartPage() {
  const {
    getEnrichedItems,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getItemCount,
    isHydrated
  } = useCart()

  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const items = getEnrichedItems()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()

  if (!isHydrated) {
    return (
      <div className="storefront-shell site-container flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center text-[var(--color-muted)]">
          <div className="animate-pulse font-serif text-lg">Loading your shopping bag...</div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="storefront-shell site-container flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="19" cy="20" r="1" />
          </svg>
        </div>
        <p className="storefront-eyebrow mb-3">Your edit awaits</p>
        <h1 className="mb-3 font-serif text-2xl font-semibold text-[var(--color-heading)] sm:text-3xl">Your Shopping Bag is Empty</h1>
        <p className="mb-8 max-w-md text-sm leading-6 text-[var(--color-muted)] sm:text-base">
          It looks like you haven&apos;t added any items to your bag yet. Explore our handcrafted collection to find modest essentials tailored for you.
        </p>
        <Link
          href="/products"
          className="storefront-button"
        >
          Explore Collection
        </Link>
      </div>
    )
  }

  return (
    <main className="storefront-shell">
      <div className="site-container py-10 sm:py-12 lg:py-16">
        {/* Page Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-[var(--color-border)] pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="storefront-eyebrow mb-2">Your considered edit</p>
            <h1 className="font-serif text-3xl font-semibold text-[var(--color-heading)] sm:text-4xl">Shopping Bag</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
            </p>
          </div>
          {!showClearConfirm ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              aria-label="Clear all items from shopping bag"
              className="text-xs text-[var(--color-muted)] transition hover:text-[var(--color-error)] sm:text-sm self-start underline sm:self-auto"
            >
              Clear entire bag
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-[var(--radius-button)] border border-[var(--color-primary)]/20 bg-[var(--color-surface)]/70 px-3 py-2 text-xs sm:text-sm animate-fade-in self-start sm:self-auto">
              <span className="font-medium text-[var(--color-text)]">Clear all items?</span>
              <button
                type="button"
                onClick={() => {
                  clearCart()
                  setShowClearConfirm(false)
                }}
                className="font-semibold text-[var(--color-error)] hover:underline"
                aria-label="Confirm clear entire bag"
              >
                Yes, Clear
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="text-[var(--color-muted)] underline hover:text-[var(--color-text)]"
                aria-label="Cancel clearing bag"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="divide-y divide-[var(--color-border)] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card-background)]/75 px-4 sm:px-6">
              {items.map((item) => {
                const product = item.product
                const variant = item.variant
                const isUnavailable = item.isUnavailable
                const productHref = !isUnavailable && product?.slug ? `/products/${product.slug}` : undefined
                const thumbnail = variant?.image || product?.primaryImage || product?.images?.[0] || '/products/placeholder.svg'
                const itemKey = getCartItemKey(item.productId, item.variantId)
                const currentSku = variant?.sku || product?.sku

                return (
                  <div key={itemKey} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center">
                    {/* Item Image & Info */}
                    <div className="flex gap-4 items-center">
                      <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface)] sm:h-28 sm:w-24">
                        {productHref ? (
                          <Link href={productHref}>
                            <Image
                              src={thumbnail}
                              alt={product?.name || 'Product thumbnail'}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </Link>
                        ) : (
                          <Image
                            src={thumbnail}
                            alt={product?.name || 'Product thumbnail'}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-base font-medium text-[var(--color-text)]">
                          {productHref ? (
                            <Link href={productHref} className="hover:underline">
                              {product?.name || 'Product'}
                            </Link>
                          ) : (
                            product?.name || 'Product'
                          )}
                        </h2>

                        {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                          <div className="mt-0.5 text-xs font-medium text-[var(--color-muted)]">
                            {Object.entries(item.selectedAttributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </div>
                        )}

                        {!isUnavailable && currentSku && (
                          <div className="mt-0.5 text-xs text-[var(--color-muted)]">SKU: {currentSku}</div>
                        )}

                        <div className="mt-1 flex items-baseline gap-2">
                          {isUnavailable ? (
                            <span className="text-xs font-medium text-[var(--color-error)]">Currently Unavailable</span>
                          ) : (
                            <span className="text-sm font-medium text-[var(--color-primary)]">
                              {formatPrice(item.effectivePrice)}
                            </span>
                          )}
                        </div>

                        {!isUnavailable && item.isOutOfStock && (
                          <div className="mt-1 text-xs font-medium text-[var(--color-error)]">Out of stock</div>
                        )}
                        {!isUnavailable && !item.isOutOfStock && item.isMaxStock && (
                          <div className="mt-1 text-xs text-[var(--color-accent)]">Max stock reached</div>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Line Total */}
                    <div className="flex items-center justify-between gap-6 border-t border-[var(--color-border)]/50 pt-2 sm:justify-end sm:border-t-0 sm:pt-0">
                      <div className="flex h-11 items-center overflow-hidden rounded-full border border-[var(--color-input-border)] bg-[var(--color-input-background)]">
                        <button
                          type="button"
                          onClick={() => decrementQuantity(item.productId, item.variantId)}
                          aria-label={`Decrease quantity of ${product?.name || 'item'}`}
                          className="inline-flex h-11 w-10 items-center justify-center text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface)] disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="min-w-[28px] px-3 text-center text-sm font-semibold text-[var(--color-text)]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementQuantity(item.productId, item.variantId, variant?.stock ?? product?.stock)}
                          disabled={item.isMaxStock || item.isOutOfStock || isUnavailable}
                          aria-label={`Increase quantity of ${product?.name || 'item'}`}
                          className="inline-flex h-11 w-10 items-center justify-center text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface)] disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <div className="text-base font-semibold text-[var(--color-text)]">
                          {formatPrice(item.lineTotal)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.variantId)}
                        aria-label={`Remove ${product?.name || 'item'} from bag`}
                        className="p-2 text-[var(--color-muted)] transition hover:text-[var(--color-error)]"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-4 flex justify-between items-center">
              <Link
                href="/products"
                className="inline-flex items-center text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4">
            <div className="storefront-card sticky top-32 space-y-5 p-5 sm:p-6">
              <h2 className="font-serif text-xl font-semibold text-[var(--color-heading)]">Order Summary</h2>

              <div className="space-y-3 divide-y divide-[var(--color-border)] text-sm text-[var(--color-text)]">
                <div className="flex justify-between pt-2 first:pt-0">
                  <span className="text-[var(--color-muted)]">Items Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-[var(--color-muted)]">Estimated Delivery</span>
                  <span className="text-xs text-[var(--color-muted)]">Calculated at checkout</span>
                </div>
                <div className="flex justify-between pt-4 text-base font-bold text-[var(--color-heading)]">
                  <span>Estimated Total</span>
                  <span className="text-xl text-[var(--color-primary)]">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="storefront-button flex min-h-[50px] w-full items-center justify-center py-3.5 text-sm font-medium"
              >
                Proceed to Checkout
              </Link>

              <div className="space-y-2 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-muted)]">
                <div className="flex items-center gap-2">
                  <span>✓</span> Handcrafted modest fashion
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-primary)]">•</span> Payment options are available at checkout
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-primary)]">•</span> Delivery is available across Bangladesh
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
