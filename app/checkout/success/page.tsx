"use client"

import React, { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function formatPrice(val: number) {
  return `Tk ${val.toLocaleString('en-US')}`
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('orderNumber')

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderNumber) {
      setError('Order number not provided.')
      setLoading(false)
      return
    }

    fetch(`/api/orders/${orderNumber}?public=1&orderNumber=${encodeURIComponent(orderNumber)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.order) {
          setOrder(data.order)
        } else {
          setError(data.error || 'Unable to retrieve order details.')
        }
      })
      .catch(() => {
        setError('Failed to load order confirmation.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [orderNumber])

  if (loading) {
    return (
      <div className="storefront-shell site-container flex min-h-[65vh] items-center justify-center py-16">
        <div className="animate-pulse text-center font-serif text-lg text-taupe">
          Loading your order confirmation...
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="storefront-shell site-container flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </div>
        <p className="storefront-eyebrow mb-3">Order confirmation</p>
        <h1 className="mb-2 font-serif text-3xl font-semibold text-charcoal">Order Lookup</h1>
        <p className="mb-7 max-w-md text-sm leading-6 text-charcoal/60">{error || 'Order details could not be found.'}</p>
        <Link href="/products" className="storefront-button">
          Return to Store
        </Link>
      </div>
    )
  }

  return (
    <main className="storefront-shell">
      <div className="site-container max-w-4xl py-10 sm:py-12 lg:py-16">
        {/* Thank you Banner */}
        <div className="mb-8 space-y-4 rounded-[18px] border border-black/10 bg-[#fbfaf7] p-6 text-center shadow-[0_18px_45px_rgba(65,49,37,0.08)] sm:p-9">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M5 12.5l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="storefront-eyebrow">Order received</p>
          <h1 className="font-serif text-3xl font-semibold text-charcoal sm:text-4xl">
            Thank you for your order
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-6 text-charcoal/60 sm:text-base">
            We have received your order and our team is preparing it with care.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-black/10 bg-cream/70 px-4 py-2 text-sm font-semibold text-mocha">
            <span>Order Number:</span>
            <span className="tracking-wider">{order.orderNumber}</span>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Delivery Details */}
          <div className="storefront-card space-y-4 bg-white/60 p-5 text-sm sm:p-6">
            <h2 className="border-b border-black/10 pb-3 font-serif text-lg font-semibold text-charcoal">
              Delivery Details
            </h2>
            <div className="space-y-1.5 text-charcoal">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-taupe">Phone: {order.shippingAddress.phone}</p>
              {order.shippingAddress.email && <p className="text-taupe">Email: {order.shippingAddress.email}</p>}
              <p className="text-taupe pt-1">
                {order.shippingAddress.deliveryAddress}, {order.shippingAddress.thana},{' '}
                {order.shippingAddress.district}
              </p>
              {order.shippingAddress.deliveryNotes && (
                <p className="text-xs text-taupe italic pt-1">Note: {order.shippingAddress.deliveryNotes}</p>
              )}
            </div>
          </div>

          {/* Payment & Status */}
          <div className="storefront-card space-y-4 bg-white/60 p-5 text-sm sm:p-6">
            <h2 className="border-b border-black/10 pb-3 font-serif text-lg font-semibold text-charcoal">
              Order Status & Timeline
            </h2>
            <div className="space-y-2 text-charcoal">
              <div className="flex justify-between">
                <span className="text-taupe">Order Status:</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 uppercase tracking-wide">
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">Payment Method:</span>
                <span className="font-medium uppercase text-xs">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-taupe">Tracking:</span>
                <Link href="/track-order" className="font-medium text-mocha underline decoration-mocha/30 underline-offset-4">
                  Track order
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Order Snapshot */}
        <div className="storefront-card mb-8 space-y-4 bg-white/60 p-5 sm:p-6">
          <h2 className="border-b border-black/10 pb-3 font-serif text-xl font-semibold text-charcoal">
            Purchased Items
          </h2>

          <div className="divide-y divide-cream">
            {order.items.map((item: any, idx: number) => {
              const thumbnail = item.image || '/products/placeholder.svg'
              const itemSku = item.variantSku || item.productSku

              return (
                <div key={idx} className="flex items-center justify-between gap-3 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-black/10 bg-cream">
                      <Image src={thumbnail} alt={item.productName} fill sizes="56px" className="object-cover" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-charcoal">{item.productName}</div>
                      {item.selectedAttributes && (
                        <div className="text-xs text-taupe">
                          {Object.entries(item.selectedAttributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </div>
                      )}
                      {itemSku && <div className="text-xs text-taupe">SKU: {itemSku}</div>}
                      <div className="text-xs text-taupe mt-0.5">
                        Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="font-semibold text-sm text-charcoal whitespace-nowrap">
                    {formatPrice(item.lineTotal)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals Summary */}
          <div className="border-t border-cream pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-taupe">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-taupe">
              <span>Delivery Charge</span>
              <span>{formatPrice(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-charcoal border-t border-cream pt-2">
              <span>Total Payable</span>
              <span className="text-mocha text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-black/15 bg-transparent px-6 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-cream focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Print Receipt
          </button>

          <Link href="/products" className="storefront-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="storefront-shell site-container flex min-h-[65vh] items-center justify-center py-16">
          <div className="animate-pulse text-center font-serif text-lg text-taupe">
            Loading your order confirmation...
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
