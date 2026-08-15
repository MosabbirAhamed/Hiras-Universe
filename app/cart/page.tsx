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
      <div className="site-container py-12 min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-taupe">
          <div className="animate-pulse font-serif text-lg">Loading your shopping bag...</div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="site-container py-16 min-h-[65vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center text-taupe mb-6 border border-cream">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="19" cy="20" r="1" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-3">Your Shopping Bag is Empty</h1>
        <p className="text-taupe text-sm sm:text-base max-w-md mb-8">
          It looks like you haven&apos;t added any items to your bag yet. Explore our handcrafted collection to find modest essentials tailored for you.
        </p>
        <Link
          href="/products"
          className="px-8 py-3 bg-mocha text-ivory rounded-md font-medium text-sm hover:opacity-90 transition shadow-sm"
        >
          Explore Collection
        </Link>
      </div>
    )
  }

  return (
    <div className="site-container py-8 sm:py-10 md:py-12">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-3 border-b border-black/10 pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-charcoal sm:text-4xl">Shopping Bag</h1>
          <p className="text-sm text-taupe mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
          </p>
        </div>
        {!showClearConfirm ? (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            aria-label="Clear all items from shopping bag"
            className="text-xs sm:text-sm text-taupe hover:text-red-600 transition underline self-start sm:self-auto"
          >
            Clear entire bag
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-cream/90 px-3 py-1.5 rounded border border-taupe/20 text-xs sm:text-sm animate-fade-in self-start sm:self-auto">
            <span className="text-charcoal font-medium">Clear all items?</span>
            <button
              type="button"
              onClick={() => {
                clearCart()
                setShowClearConfirm(false)
              }}
              className="text-red-600 font-semibold hover:underline"
              aria-label="Confirm clear entire bag"
            >
              Yes, Clear
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="text-taupe hover:text-charcoal underline"
              aria-label="Cancel clearing bag"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-black/10 border-y border-black/10">
            {items.map((item) => {
              const product = item.product
              const variant = item.variant
              const isUnavailable = item.isUnavailable
              const productHref = !isUnavailable && product?.slug ? `/products/${product.slug}` : undefined
              const thumbnail = variant?.image || product?.primaryImage || product?.images?.[0] || '/products/placeholder.svg'
              const itemKey = getCartItemKey(item.productId, item.variantId)
              const currentSku = variant?.sku || product?.sku

              return (
                <div key={itemKey} className="py-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  {/* Item Image & Info */}
                  <div className="flex gap-4 items-center">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-black/10 bg-cream sm:h-24 sm:w-24">
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
                      <h2 className="text-base font-medium text-charcoal">
                        {productHref ? (
                          <Link href={productHref} className="hover:underline">
                            {product?.name || 'Product'}
                          </Link>
                        ) : (
                          product?.name || 'Product'
                        )}
                      </h2>

                      {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                        <div className="text-xs text-taupe font-medium mt-0.5">
                          {Object.entries(item.selectedAttributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </div>
                      )}

                      {!isUnavailable && currentSku && (
                        <div className="text-xs text-taupe/80 mt-0.5">SKU: {currentSku}</div>
                      )}

                      <div className="mt-1 flex items-baseline gap-2">
                        {isUnavailable ? (
                          <span className="text-xs text-red-600 font-medium">Currently Unavailable</span>
                        ) : (
                          <span className="text-sm font-medium text-mocha">
                            {formatPrice(item.effectivePrice)}
                          </span>
                        )}
                      </div>

                      {!isUnavailable && item.isOutOfStock && (
                        <div className="text-xs text-red-600 font-medium mt-1">Out of stock</div>
                      )}
                      {!isUnavailable && !item.isOutOfStock && item.isMaxStock && (
                        <div className="text-xs text-amber-700 mt-1">Max stock reached</div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls & Line Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-cream/50">
                    <div className="flex h-11 items-center overflow-hidden rounded-md border border-black/15 bg-white">
                      <button
                        type="button"
                        onClick={() => decrementQuantity(item.productId, item.variantId)}
                        aria-label={`Decrease quantity of ${product?.name || 'item'}`}
                        className="px-3 py-1.5 text-sm font-medium text-charcoal hover:bg-cream transition disabled:opacity-30"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-semibold text-charcoal min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementQuantity(item.productId, item.variantId, variant?.stock ?? product?.stock)}
                        disabled={item.isMaxStock || item.isOutOfStock || isUnavailable}
                        aria-label={`Increase quantity of ${product?.name || 'item'}`}
                        className="px-3 py-1.5 text-sm font-medium text-charcoal hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent transition"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <div className="text-base font-semibold text-charcoal">
                        {formatPrice(item.lineTotal)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      aria-label={`Remove ${product?.name || 'item'} from bag`}
                      className="text-taupe hover:text-red-600 p-2 transition"
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
              className="inline-flex items-center text-sm font-medium text-mocha hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-5 rounded-lg border border-black/10 bg-white/70 p-5 shadow-[0_12px_32px_rgba(34,34,34,0.06)] sm:p-6">
            <h2 className="font-serif text-xl font-semibold text-charcoal">Order Summary</h2>

            <div className="space-y-3 text-sm text-charcoal divide-y divide-taupe/20">
              <div className="flex justify-between pt-2 first:pt-0">
                <span className="text-taupe">Items Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-taupe">Estimated Delivery</span>
                <span className="text-taupe text-xs">Calculated at checkout</span>
              </div>
              <div className="flex justify-between pt-4 text-base font-bold text-charcoal">
                <span>Estimated Total</span>
                <span className="text-xl text-mocha">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary flex min-h-[50px] w-full items-center justify-center py-3.5 text-sm font-medium"
            >
              Proceed to Checkout
            </Link>

            <div className="border-t border-taupe/20 pt-4 space-y-2 text-xs text-taupe">
              <div className="flex items-center gap-2">
                <span>✓</span> Handcrafted modest fashion
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span> Authentic quality guaranteed
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span> Fast delivery across Bangladesh
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
