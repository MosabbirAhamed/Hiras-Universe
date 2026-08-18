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
    <main className="storefront-shell">
      <div className="site-container max-w-4xl py-10 sm:py-12 lg:py-16">
        {/* Page Header */}
        <div className="mx-auto mb-8 max-w-xl space-y-3 text-center sm:mb-10">
          <p className="storefront-eyebrow">Order progress</p>
          <h1 className="font-serif text-3xl font-semibold text-[var(--color-heading)] sm:text-4xl">Track Your Order</h1>
          <p className="text-sm leading-6 text-[var(--color-muted)]">
            Enter your order number and mobile number to view its current delivery progress.
          </p>
        </div>

        {/* Tracking Form Card */}
        <div className="storefront-card mx-auto mb-10 max-w-xl p-5 sm:p-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="tracking-order-number" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text)]/75">
                Order Number *
              </label>
              <input
                id="tracking-order-number"
                type="text"
                required
                placeholder="e.g. HN-1001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className={`w-full rounded-[var(--radius-button)] border bg-[var(--color-input-background)] p-3 text-sm text-[var(--color-text)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] ${fieldErrors.orderNumber ? 'border-[var(--color-error)]' : 'border-[var(--color-input-border)]'
                  }`}
              />
              {fieldErrors.orderNumber && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{fieldErrors.orderNumber}</p>
              )}
            </div>

            <div>
              <label htmlFor="tracking-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text)]/75">
                Mobile Number (Bangladesh) *
              </label>
              <input
                id="tracking-phone"
                type="tel"
                required
                placeholder="e.g. 01712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full rounded-[var(--radius-button)] border bg-[var(--color-input-background)] p-3 text-sm text-[var(--color-text)] transition focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] ${fieldErrors.phone ? 'border-[var(--color-error)]' : 'border-[var(--color-input-border)]'
                  }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-[var(--color-error)]">{fieldErrors.phone}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="storefront-button w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Verifying & Tracking...' : 'Track Order'}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-start justify-between rounded-[var(--radius-button)] border border-[var(--color-error)]/25 bg-[var(--color-error)]/10 p-3.5 text-xs text-[var(--color-error)] animate-fade-in sm:text-sm">
              <div>{error}</div>
              <button
                type="button"
                onClick={() => setError('')}
                className="ml-3 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--color-error)] transition hover:bg-[var(--color-error)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-error)]"
                aria-label="Dismiss error"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Result Section */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Order Header Summary */}
            <div className="storefront-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-serif text-xl font-semibold text-[var(--color-heading)] sm:text-2xl">
                    Order #{result.orderNumber}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border uppercase tracking-wider ${result.orderStatus === 'cancelled'
                      ? 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/25'
                      : result.orderStatus === 'delivered'
                        ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/25'
                        : 'bg-[var(--color-accent)]/15 text-[var(--color-heading)] border-[var(--color-accent)]/30'
                      }`}
                  >
                    {result.orderStatus}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Placed on {formatDate(result.createdAt)} • Recipient: <span className="font-medium text-[var(--color-heading)]">{result.customerName}</span> ({result.maskedPhone})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="inline-flex min-h-11 self-start items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-heading)] transition hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] sm:self-auto"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                View / Print Invoice
              </button>
            </div>

            {/* Visual Status Timeline */}
            <div className="storefront-card p-5 sm:p-8">
              <h3 className="mb-6 border-b border-[var(--color-border)] pb-3 font-serif text-lg font-semibold text-[var(--color-heading)]">
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
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition ${step.key === 'cancelled'
                              ? 'bg-[var(--color-error)] text-[var(--color-button-text)]'
                              : isCompleted
                                ? 'bg-[var(--color-success)] text-[var(--color-button-text)]'
                                : 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]'
                              }`}
                          >
                            {step.key === 'cancelled' ? '✕' : isCompleted ? '✓' : idx + 1}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className={`text-sm font-semibold ${isCurrent ? 'text-[var(--color-primary)]' : isCompleted ? 'text-[var(--color-heading)]' : 'text-[var(--color-muted)]'}`}>
                            {step.label}
                          </div>
                          {step.timestamp && (
                            <div className="mt-0.5 text-xs text-[var(--color-muted)]">
                              {formatDate(step.timestamp)}
                            </div>
                          )}
                          {!step.timestamp && !isCompleted && (
                            <div className="mt-0.5 text-2xs text-[var(--color-muted)]/70">Pending</div>
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
              <div className="storefront-card space-y-3 p-5 text-sm">
                <h4 className="border-b border-[var(--color-border)] pb-3 font-serif text-lg font-semibold text-[var(--color-heading)]">
                  Destination Summary
                </h4>
                <div className="space-y-1 text-[var(--color-text)]">
                  <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Recipient</div>
                  <div className="font-medium">{result.customerName}</div>
                  <div className="pt-2 text-xs uppercase tracking-wider text-[var(--color-muted)]">Delivery Area</div>
                  <div>{result.shippingAddress.thana}, {result.shippingAddress.district}</div>
                </div>
              </div>

              <div className="storefront-card space-y-3 p-5 text-sm">
                <h4 className="border-b border-[var(--color-border)] pb-3 font-serif text-lg font-semibold text-[var(--color-heading)]">
                  Payment Summary
                </h4>
                <div className="space-y-2 text-[var(--color-text)]">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Method:</span>
                    <span className="font-medium uppercase text-xs">
                      {result.paymentMethod === 'cod' ? 'Cash on Delivery' : result.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Status:</span>
                    <span className="text-xs font-semibold uppercase text-[var(--color-primary)]">{result.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--color-border)] pt-2 font-semibold">
                    <span>Total Payable:</span>
                    <span className="text-[var(--color-primary)]">{formatPrice(result.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="storefront-card space-y-4 p-5 sm:p-6">
              <h3 className="border-b border-[var(--color-border)] pb-3 font-serif text-lg font-semibold text-[var(--color-heading)]">
                Purchased Items ({result.items.reduce((s, it) => s + it.quantity, 0)})
              </h3>

              <div className="divide-y divide-[var(--color-border)]">
                {result.items.map((item, idx) => {
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
                              {Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                            </div>
                          )}
                          {itemSku && <div className="text-xs text-[var(--color-muted)]/80">SKU: {itemSku}</div>}
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
            </div>
          </div>
        )}

        {/* Verified Invoice Modal */}
        {showInvoiceModal && result && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[var(--color-heading)]/65 p-3 backdrop-blur-xs sm:p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative my-8 max-h-[90vh] w-full max-w-3xl space-y-6 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card-background)] p-5 shadow-2xl animate-fade-in sm:p-8">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 print:hidden">
                <h2 className="font-serif text-lg font-semibold text-[var(--color-heading)]">Customer Receipt / Invoice</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="storefront-button inline-flex min-h-9 items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)]"
                    aria-label="Close invoice"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Invoice Content */}
              <div className="space-y-6 text-sm text-[var(--color-text)]">
                <div className="flex items-start justify-between border-b border-[var(--color-border)] pb-4">
                  <div>
                    <div className="font-serif text-xl font-bold text-[var(--color-primary)]">Hira&apos;s Universe</div>
                    <div className="text-xs text-[var(--color-muted)]">Curated Modest Fashion & Essentials</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">INVOICE #{result.orderNumber}</div>
                    <div className="text-xs text-[var(--color-muted)]">{formatDate(result.createdAt)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block font-semibold text-[var(--color-muted)]">CUSTOMER:</span>
                    <div>{result.customerName}</div>
                    <div>{result.maskedPhone}</div>
                  </div>
                  <div>
                    <span className="block font-semibold text-[var(--color-muted)]">DELIVERY DESTINATION:</span>
                    <div>{result.shippingAddress.thana}, {result.shippingAddress.district}</div>
                    <div className="uppercase font-medium pt-1">Payment: {result.paymentMethod}</div>
                  </div>
                </div>

                {/* Items */}
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] uppercase font-semibold text-[var(--color-muted)]">
                      <th className="py-2">Item</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]/60">
                    {result.items.map((it, i) => (
                      <tr key={i}>
                        <td className="py-2">
                          <strong>{it.productName}</strong>
                          {it.selectedAttributes && (
                            <span className="block text-2xs text-[var(--color-muted)]">
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

                <div className="space-y-1 border-t border-[var(--color-border)] pt-3 text-right text-xs">
                  <div className="text-[var(--color-muted)]">Subtotal: <span className="font-medium text-[var(--color-heading)]">{formatPrice(result.subtotal)}</span></div>
                  <div className="text-[var(--color-muted)]">Delivery Charge: <span className="font-medium text-[var(--color-heading)]">{formatPrice(result.deliveryCharge)}</span></div>
                  <div className="pt-1 text-sm font-bold text-[var(--color-primary)]">Total: {formatPrice(result.total)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 border-t border-[var(--color-border)] pt-6 text-center">
          <Link
            href="/products"
            className="storefront-link inline-flex items-center gap-1 text-xs sm:text-sm"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}
