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
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-ivory h-full shadow-2xl flex flex-col z-10 animate-slide-left border-l border-cream">
        {/* Drawer Header */}
        <div className="p-4 md:p-5 border-b border-cream flex items-center justify-between bg-ivory">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg md:text-xl font-medium text-charcoal">Shopping Bag</h2>
            {isHydrated && itemCount > 0 && (
              <span className="text-xs bg-cream px-2 py-0.5 rounded-full text-taupe font-medium">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close shopping bag"
            className="p-2 rounded-full hover:bg-cream text-taupe hover:text-charcoal transition focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          {!isHydrated || items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-taupe mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="19" cy="20" r="1" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-medium text-charcoal mb-1">Your bag is empty</h3>
              <p className="text-sm text-taupe max-w-xs mb-6">
                Discover our curated collection of premium modest wear and essentials.
              </p>
              <Link
                href="/products"
                onClick={closeDrawer}
                className="px-6 py-2.5 bg-mocha text-ivory text-sm font-medium rounded-md hover:opacity-90 transition shadow-sm"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-cream">
              {items.map((item) => {
                const product = item.product
                const variant = item.variant
                const isUnavailable = item.isUnavailable
                const productHref = !isUnavailable && product?.slug ? `/products/${product.slug}` : undefined
                const thumbnail = variant?.image || product?.primaryImage || product?.images?.[0] || '/products/placeholder.svg'
                const itemKey = getCartItemKey(item.productId, item.variantId)

                return (
                  <div key={itemKey} className="py-4 first:pt-0 last:pb-0 flex gap-3 sm:gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-cream rounded-md overflow-hidden flex-shrink-0 border border-cream">
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
                        <div className="flex items-center border border-cream rounded bg-white">
                          <button
                            onClick={() => decrementQuantity(item.productId, item.variantId)}
                            aria-label={`Decrease quantity of ${product?.name || 'item'}`}
                            className="px-2.5 py-1 text-xs text-charcoal hover:bg-cream transition disabled:opacity-30"
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
                            className="px-2.5 py-1 text-xs text-charcoal hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent transition"
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
          <div className="p-4 md:p-5 border-t border-cream bg-ivory space-y-3">
            <div className="flex items-center justify-between text-base">
              <span className="text-taupe">Subtotal</span>
              <span className="font-semibold text-charcoal text-lg">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-taupe">Taxes and shipping calculated at checkout.</p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="w-full text-center px-4 py-2.5 border border-taupe/40 text-charcoal font-medium text-sm rounded-md hover:bg-cream transition flex items-center justify-center min-h-[44px]"
              >
                View Bag
              </Link>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="w-full px-4 py-2.5 bg-mocha text-ivory font-medium text-sm rounded-md hover:opacity-90 transition flex items-center justify-center min-h-[44px] text-center"
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
