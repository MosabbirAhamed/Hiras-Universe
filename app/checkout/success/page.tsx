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
      <div className="site-container py-16 min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-taupe animate-pulse font-serif text-lg">
          Loading your order confirmation...
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="site-container py-16 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 text-2xl">
          ✕
        </div>
        <h1 className="font-serif text-2xl font-bold text-charcoal mb-2">Order Lookup</h1>
        <p className="text-taupe text-sm max-w-md mb-6">{error || 'Order details could not be found.'}</p>
        <Link
          href="/products"
          className="px-6 py-2.5 bg-mocha text-ivory text-sm font-medium rounded-md hover:opacity-90 transition"
        >
          Return to Store
        </Link>
      </div>
    )
  }

  const isDhaka = order.shippingAddress.district?.toLowerCase() === 'dhaka'
  const estimatedDays = isDhaka ? '2–3 business days' : '3–5 business days'

  return (
    <div className="site-container py-8 md:py-12 max-w-4xl">
      {/* Thank you Banner */}
      <div className="bg-ivory border border-cream rounded-lg p-6 sm:p-8 text-center space-y-3 mb-8 shadow-xs">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          ✓
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
          Thank you for your order!
        </h1>
        <p className="text-sm sm:text-base text-taupe max-w-lg mx-auto">
          We have received your order and our team is preparing it with care.
        </p>

        <div className="pt-2 inline-flex items-center gap-2 bg-cream px-4 py-2 rounded-full text-sm font-semibold text-mocha">
          <span>Order Number:</span>
          <span className="tracking-wider">{order.orderNumber}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Delivery Details */}
        <div className="bg-ivory border border-cream rounded-lg p-5 space-y-3 text-sm">
          <h2 className="font-serif text-base font-semibold text-charcoal border-b border-cream pb-2">
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
        <div className="bg-ivory border border-cream rounded-lg p-5 space-y-3 text-sm">
          <h2 className="font-serif text-base font-semibold text-charcoal border-b border-cream pb-2">
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
            <div className="flex justify-between">
              <span className="text-taupe">Estimated Delivery:</span>
              <span className="font-medium text-mocha">{estimatedDays}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Order Snapshot */}
      <div className="bg-ivory border border-cream rounded-lg p-5 sm:p-6 space-y-4 mb-8">
        <h2 className="font-serif text-lg font-semibold text-charcoal border-b border-cream pb-2">
          Purchased Items
        </h2>

        <div className="divide-y divide-cream">
          {order.items.map((item: any, idx: number) => {
            const thumbnail = item.image || '/products/placeholder.svg'
            const itemSku = item.variantSku || item.productSku

            return (
              <div key={idx} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-cream rounded border border-cream overflow-hidden flex-shrink-0">
                    <Image src={thumbnail} alt={item.productName} fill style={{ objectFit: 'cover' }} />
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
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-6 py-2.5 border border-taupe/30 text-charcoal font-medium text-sm rounded-md hover:bg-cream transition flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Print Receipt
        </button>

        <Link
          href="/products"
          className="px-6 py-2.5 bg-mocha text-ivory font-medium text-sm rounded-md hover:opacity-90 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="site-container py-16 min-h-[60vh] flex items-center justify-center">
          <div className="text-center text-taupe animate-pulse font-serif text-lg">
            Loading your order confirmation...
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
