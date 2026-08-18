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
        <div className="animate-pulse text-center font-serif text-lg text-[var(--color-muted)]">
          Loading your order confirmation...
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="storefront-shell site-container flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-error)]/25 bg-[var(--color-error)]/10 text-[var(--color-error)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </div>
        <p className="storefront-eyebrow mb-3">Order confirmation</p>
        <h1 className="mb-2 font-serif text-3xl font-semibold text-[var(--color-heading)]">Order Lookup</h1>
        <p className="mb-7 max-w-md text-sm leading-6 text-[var(--color-muted)]">{error || 'Order details could not be found.'}</p>
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
        <div className="storefront-card mb-8 space-y-4 p-6 text-center shadow-[0_18px_45px_rgba(34,34,34,0.06)] sm:p-9">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-success)]/25 bg-[var(--color-success)]/10 text-[var(--color-success)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="M5 12.5l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="storefront-eyebrow">Order received</p>
          <h1 className="font-serif text-3xl font-semibold text-[var(--color-heading)] sm:text-4xl">
            Thank you for your order
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-6 text-[var(--color-muted)] sm:text-base">
            We have received your order and our team is preparing it with care.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
            <span>Order Number:</span>
            <span className="tracking-wider">{order.orderNumber}</span>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Delivery Details */}
          <div className="storefront-card space-y-4 p-5 text-sm sm:p-6">
            <h2 className="border-b border-[var(--color-border)] pb-3 font-serif text-lg font-semibold text-[var(--color-heading)]">
              Delivery Details
            </h2>
            <div className="space-y-1.5 text-[var(--color-text)]">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-[var(--color-muted)]">Phone: {order.shippingAddress.phone}</p>
              {order.shippingAddress.email && <p className="text-[var(--color-muted)]">Email: {order.shippingAddress.email}</p>}
              <p className="pt-1 text-[var(--color-muted)]">
                {order.shippingAddress.deliveryAddress}, {order.shippingAddress.thana},{' '}
                {order.shippingAddress.district}
              </p>
              {order.shippingAddress.deliveryNotes && (
                <p className="pt-1 text-xs italic text-[var(--color-muted)]">Note: {order.shippingAddress.deliveryNotes}</p>
              )}
            </div>
          </div>

          {/* Payment & Status */}
          <div className="storefront-card space-y-4 p-5 text-sm sm:p-6">
            <h2 className="border-b border-[var(--color-border)] pb-3 font-serif text-lg font-semibold text-[var(--color-heading)]">
              Order Status & Timeline
            </h2>
            <div className="space-y-2 text-[var(--color-text)]">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Order Status:</span>
                <span className="rounded bg-[var(--color-accent)]/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-heading)]">
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Payment Method:</span>
                <span className="font-medium uppercase text-xs">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[var(--color-muted)]">Tracking:</span>
                <Link href="/track-order" className="font-medium text-[var(--color-link)] underline decoration-[var(--color-link)]/30 underline-offset-4">
                  Track order
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Order Snapshot */}
        <div className="storefront-card mb-8 space-y-4 p-5 sm:p-6">
          <h2 className="border-b border-[var(--color-border)] pb-3 font-serif text-xl font-semibold text-[var(--color-heading)]">
            Purchased Items
          </h2>

          <div className="divide-y divide-[var(--color-border)]">
            {order.items.map((item: any, idx: number) => {
              const thumbnail = item.image || '/products/placeholder.svg'
              const itemSku = item.variantSku || item.productSku

              return (
                <div key={idx} className="flex items-center justify-between gap-3 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-section-background)]">
                      <Image src={thumbnail} alt={item.productName} fill sizes="56px" className="object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--color-heading)]">{item.productName}</div>
                      {item.selectedAttributes && (
                        <div className="text-xs text-[var(--color-muted)]">
                          {Object.entries(item.selectedAttributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </div>
                      )}
                      {itemSku && <div className="text-xs text-[var(--color-muted)]">SKU: {itemSku}</div>}
                      <div className="mt-0.5 text-xs text-[var(--color-muted)]">
                        Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="whitespace-nowrap text-sm font-semibold text-[var(--color-heading)]">
                    {formatPrice(item.lineTotal)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals Summary */}
          <div className="space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
            <div className="flex justify-between text-[var(--color-muted)]">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-muted)]">
              <span>Delivery Charge</span>
              <span>{formatPrice(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-bold text-[var(--color-heading)]">
              <span>Total Payable</span>
              <span className="text-lg text-[var(--color-primary)]">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-transparent px-6 py-2.5 text-sm font-semibold text-[var(--color-heading)] transition hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
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
          <div className="animate-pulse text-center font-serif text-lg text-[var(--color-muted)]">
            Loading your order confirmation...
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
