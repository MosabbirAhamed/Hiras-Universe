"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { PublicTrackingOrder } from '../../src/types/models'

function formatPrice(val: number) {
  return `Tk ${val.toLocaleString('en-US')}`
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<PublicTrackingOrder | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setResult(null)

    const cleanOrderNum = orderNumber.trim().toUpperCase()
    const cleanPhone = phone.trim()

    const errors: Record<string, string> = {}
    if (!cleanOrderNum || !/^HN-\d+$/i.test(cleanOrderNum)) {
      errors.orderNumber = 'Please enter a valid order number in format HN-1001.'
    }
    if (!cleanPhone || cleanPhone.length < 11) {
      errors.phone = 'Please enter a valid 11-digit Bangladesh mobile number.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: cleanOrderNum,
          phone: cleanPhone
        })
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        setError(data.error || 'No order found matching the provided details.')
        setLoading(false)
        return
      }

      setResult(data.order)
    } catch {
      setError('A network error occurred. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="site-container py-8 md:py-14 max-w-4xl">
      {/* Page Header */}
      <div className="text-center max-w-lg mx-auto mb-8 sm:mb-10 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">Track Your Order</h1>
        <p className="text-sm text-taupe">
          Enter your Order Number and Mobile Number to view real-time delivery progress.
        </p>
      </div>

      {/* Tracking Form Card */}
      <div className="bg-ivory border border-cream rounded-lg p-5 sm:p-8 shadow-xs max-w-xl mx-auto mb-10">
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
              Order Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HN-1001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className={`w-full border rounded-md p-2.5 text-sm bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha transition ${
                fieldErrors.orderNumber ? 'border-red-500' : 'border-taupe/30'
              }`}
            />
            {fieldErrors.orderNumber && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.orderNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
              Mobile Number (Bangladesh) *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 01712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full border rounded-md p-2.5 text-sm bg-white text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha transition ${
                fieldErrors.phone ? 'border-red-500' : 'border-taupe/30'
              }`}
            />
            {fieldErrors.phone && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-mocha text-ivory text-sm font-medium rounded-md hover:opacity-90 transition shadow-xs flex items-center justify-center min-h-[44px] disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Verifying & Tracking...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm animate-fade-in flex items-start justify-between">
            <div>{error}</div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 ml-3 font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-8 animate-fade-in">
          {/* Order Header Summary */}
          <div className="bg-ivory border border-cream rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal">
                  Order #{result.orderNumber}
                </h2>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border uppercase tracking-wider ${
                    result.orderStatus === 'cancelled'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : result.orderStatus === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {result.orderStatus}
                </span>
              </div>
              <p className="text-xs text-taupe mt-1">
                Placed on {formatDate(result.createdAt)} • Recipient: <span className="font-medium text-charcoal">{result.customerName}</span> ({result.maskedPhone})
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="px-4 py-2 border border-taupe/30 text-charcoal text-xs font-medium rounded hover:bg-cream transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              View / Print Invoice
            </button>
          </div>

          {/* Visual Status Timeline */}
          <div className="bg-ivory border border-cream rounded-lg p-6 sm:p-8 shadow-2xs">
            <h3 className="font-serif text-base font-semibold text-charcoal border-b border-cream pb-3 mb-6">
              Delivery Progress
            </h3>

            <div className="relative">
              {/* Timeline Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                {result.timeline.map((step, idx) => {
                  const isCurrent = step.current
                  const isCompleted = step.completed

                  return (
                    <div key={step.key} className="flex md:flex-col items-start gap-4 md:gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition ${
                            step.key === 'cancelled'
                              ? 'bg-red-600 text-white'
                              : isCompleted
                              ? 'bg-mocha text-ivory'
                              : 'bg-cream text-taupe border border-taupe/30'
                          }`}
                        >
                          {step.key === 'cancelled' ? '✕' : isCompleted ? '✓' : idx + 1}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className={`text-sm font-semibold ${isCurrent ? 'text-mocha' : isCompleted ? 'text-charcoal' : 'text-taupe'}`}>
                          {step.label}
                        </div>
                        {step.timestamp && (
                          <div className="text-xs text-taupe mt-0.5">
                            {formatDate(step.timestamp)}
                          </div>
                        )}
                        {!step.timestamp && !isCompleted && (
                          <div className="text-2xs text-taupe/70 mt-0.5">Pending</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Delivery & Payment Information (Privacy Filtered) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-ivory border border-cream rounded-lg p-5 space-y-2 text-sm shadow-2xs">
              <h4 className="font-serif text-base font-semibold text-charcoal border-b border-cream pb-2">
                Destination Summary
              </h4>
              <div className="space-y-1 text-charcoal">
                <div className="text-xs text-taupe uppercase tracking-wider">Recipient</div>
                <div className="font-medium">{result.customerName}</div>
                <div className="text-xs text-taupe pt-2 uppercase tracking-wider">Delivery Area</div>
                <div>{result.shippingAddress.thana}, {result.shippingAddress.district}</div>
              </div>
            </div>

            <div className="bg-ivory border border-cream rounded-lg p-5 space-y-2 text-sm shadow-2xs">
              <h4 className="font-serif text-base font-semibold text-charcoal border-b border-cream pb-2">
                Payment Summary
              </h4>
              <div className="space-y-2 text-charcoal">
                <div className="flex justify-between">
                  <span className="text-taupe">Method:</span>
                  <span className="font-medium uppercase text-xs">
                    {result.paymentMethod === 'cod' ? 'Cash on Delivery' : result.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-taupe">Status:</span>
                  <span className="font-semibold uppercase text-xs text-mocha">{result.paymentStatus}</span>
                </div>
                <div className="flex justify-between border-t border-cream pt-2 font-semibold">
                  <span>Total Payable:</span>
                  <span className="text-mocha">{formatPrice(result.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="bg-ivory border border-cream rounded-lg p-6 space-y-4 shadow-2xs">
            <h3 className="font-serif text-base font-semibold text-charcoal border-b border-cream pb-2">
              Purchased Items ({result.items.reduce((s, it) => s + it.quantity, 0)})
            </h3>

            <div className="divide-y divide-cream">
              {result.items.map((item, idx) => {
                const thumbnail = item.image || '/products/placeholder.svg'
                const itemSku = item.variantSku || item.productSku

                return (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded border border-cream bg-white overflow-hidden flex-shrink-0">
                        <Image src={thumbnail} alt={item.productName} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-charcoal">{item.productName}</div>
                        {item.selectedAttributes && (
                          <div className="text-xs text-taupe">
                            {Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                          </div>
                        )}
                        {itemSku && <div className="text-xs text-taupe/80">SKU: {itemSku}</div>}
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
          </div>
        </div>
      )}

      {/* Verified Invoice Modal */}
      {showInvoiceModal && result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cream pb-3 print:hidden">
              <h2 className="font-serif text-lg font-bold text-charcoal">Customer Receipt / Invoice</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-mocha text-ivory text-xs font-medium rounded hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1 text-taupe hover:text-charcoal text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Invoice Content */}
            <div className="space-y-6 text-sm text-charcoal">
              <div className="flex justify-between items-start border-b border-cream pb-4">
                <div>
                  <div className="font-serif text-xl font-bold text-mocha">Hira&apos;s Universe</div>
                  <div className="text-xs text-taupe">Curated Modest Fashion & Essentials</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">INVOICE #{result.orderNumber}</div>
                  <div className="text-xs text-taupe">{formatDate(result.createdAt)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-taupe block">CUSTOMER:</span>
                  <div>{result.customerName}</div>
                  <div>{result.maskedPhone}</div>
                </div>
                <div>
                  <span className="font-semibold text-taupe block">DELIVERY DESTINATION:</span>
                  <div>{result.shippingAddress.thana}, {result.shippingAddress.district}</div>
                  <div className="uppercase font-medium pt-1">Payment: {result.paymentMethod}</div>
                </div>
              </div>

              {/* Items */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-cream text-taupe uppercase font-semibold">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream/60">
                  {result.items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2">
                        <strong>{it.productName}</strong>
                        {it.selectedAttributes && (
                          <span className="text-taupe block text-2xs">
                            {Object.entries(it.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-center">{it.quantity}</td>
                      <td className="py-2 text-right">{formatPrice(it.unitPrice)}</td>
                      <td className="py-2 text-right font-semibold">{formatPrice(it.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-cream pt-3 space-y-1 text-xs text-right">
                <div className="text-taupe">Subtotal: <span className="font-medium text-charcoal">{formatPrice(result.subtotal)}</span></div>
                <div className="text-taupe">Delivery Charge: <span className="font-medium text-charcoal">{formatPrice(result.deliveryCharge)}</span></div>
                <div className="font-bold text-sm text-mocha pt-1">Total: {formatPrice(result.total)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 text-center pt-6 border-t border-cream">
        <Link
          href="/products"
          className="text-xs sm:text-sm font-medium text-mocha hover:underline inline-flex items-center gap-1"
        >
          ← Continue Shopping
        </Link>
      </div>
    </div>
  )
}
