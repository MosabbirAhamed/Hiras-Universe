"use client"

import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart, getCartItemKey } from '../../context/CartContext'

function formatPrice(val: number) {
  return `Tk ${val.toLocaleString('en-US')}`
}

export default function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    getEnrichedItems,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    getSubtotal,
    getItemCount,
    isHydrated
  } = useCart()

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, closeDrawer])

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  if (!isDrawerOpen) return null

  const items = getEnrichedItems()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Bag">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/55 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-[440px] flex-col border-l border-black/10 bg-[#fbfaf7] shadow-2xl animate-slide-left">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-black/10 bg-[#fbfaf7] px-5 py-4 md:px-6 md:py-5">
          <div>
            <p className="storefront-eyebrow mb-1">Your edit</p>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-semibold text-charcoal md:text-2xl">Shopping Bag</h2>
              {isHydrated && itemCount > 0 && (
                <span className="text-xs bg-cream px-2 py-0.5 rounded-full text-taupe font-medium">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close shopping bag"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-taupe transition-colors hover:bg-cream hover:text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-6">
          {!isHydrated || items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-cream text-taupe">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="19" cy="20" r="1" />
                </svg>
              </div>
              <p className="storefront-eyebrow mb-2">Your edit awaits</p>
              <h3 className="mb-1 font-serif text-xl font-semibold text-charcoal">Your bag is empty</h3>
              <p className="mb-6 max-w-xs text-sm leading-6 text-charcoal/60">
                Discover our curated collection of premium modest wear and essentials.
              </p>
              <Link
                href="/products"
                onClick={closeDrawer}
                className="storefront-button"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {items.map((item) => {
                const product = item.product
                const variant = item.variant
                const isUnavailable = item.isUnavailable
                const productHref = !isUnavailable && product?.slug ? `/products/${product.slug}` : undefined
                const thumbnail = variant?.image || product?.primaryImage || product?.images?.[0] || '/products/placeholder.svg'
                const itemKey = getCartItemKey(item.productId, item.variantId)

                return (
                  <div key={itemKey} className="flex gap-3 py-5 first:pt-0 last:pb-0 sm:gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-black/10 bg-cream sm:h-28 sm:w-24">
                      {productHref ? (
                        <Link href={productHref} onClick={closeDrawer}>
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

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-medium text-charcoal truncate">
                            {productHref ? (
                              <Link href={productHref} onClick={closeDrawer} className="hover:underline">
                                {product?.name || 'Product'}
                              </Link>
                            ) : (
                              product?.name || 'Product'
                            )}
                          </h4>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            aria-label={`Remove ${product?.name || 'item'} from bag`}
                            className="text-taupe hover:text-red-600 transition p-1"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>

                        {/* Selected Variant Attributes Badge */}
                        {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                          <div className="text-xs text-taupe mt-0.5 font-medium">
                            {Object.entries(item.selectedAttributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </div>
                        )}

                        {/* Price Display */}
                        <div className="mt-1 flex items-baseline gap-2">
                          {isUnavailable ? (
                            <span className="text-xs text-red-600 font-medium">Currently Unavailable</span>
                          ) : (
                            <span className="text-xs sm:text-sm font-medium text-mocha">
                              {formatPrice(item.effectivePrice)}
                            </span>
                          )}
                        </div>

                        {/* Stock warning if applicable */}
                        {!isUnavailable && item.isOutOfStock && (
                          <div className="text-xs text-red-600 font-medium mt-1">Out of stock</div>
                        )}
                        {!isUnavailable && !item.isOutOfStock && item.isMaxStock && (
                          <div className="text-xs text-amber-700 mt-1">Max stock reached</div>
                        )}
                      </div>

                      {/* Quantity Controls & Line Total */}
                      <div className="flex items-center justify-between mt-3 pt-1">
                        <div className="flex h-9 items-center overflow-hidden rounded-full border border-black/15 bg-white">
                          <button
                            onClick={() => decrementQuantity(item.productId, item.variantId)}
                            aria-label={`Decrease quantity of ${product?.name || 'item'}`}
                            className="inline-flex h-9 w-9 items-center justify-center text-xs text-charcoal transition hover:bg-cream disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-medium text-charcoal min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => incrementQuantity(item.productId, item.variantId, variant?.stock ?? product?.stock)}
                            disabled={item.isMaxStock || item.isOutOfStock || isUnavailable}
                            aria-label={`Increase quantity of ${product?.name || 'item'}`}
                            className="inline-flex h-9 w-9 items-center justify-center text-xs text-charcoal transition hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-xs sm:text-sm font-semibold text-charcoal">
                          {formatPrice(item.lineTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {isHydrated && items.length > 0 && (
          <div className="space-y-3 border-t border-black/10 bg-cream/35 p-5 md:p-6">
            <div className="flex items-center justify-between text-base">
              <span className="text-taupe">Subtotal</span>
              <span className="font-semibold text-charcoal text-lg">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-taupe">Taxes and shipping calculated at checkout.</p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="flex min-h-[48px] w-full items-center justify-center rounded-full border border-charcoal/20 px-4 py-2.5 text-center text-sm font-semibold text-charcoal transition hover:border-charcoal/40 hover:bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                View Bag
              </Link>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="storefront-button flex min-h-[48px] w-full items-center justify-center px-4 py-2.5 text-center text-sm font-medium"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
