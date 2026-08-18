"use client"

import React, { useRef, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart, getCartItemKey } from '../../src/context/CartContext'
import { BANGLADESH_DISTRICTS, getDeliveryCharge } from '../../src/lib/geo/bangladesh'
import type { PaymentMethod } from '../../src/types/models'

function formatPrice(val: number) {
  return `Tk ${val.toLocaleString('en-US')}`
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getEnrichedItems, getSubtotal, clearCart, isHydrated } = useCart()

  const enrichedItems = useMemo(() => getEnrichedItems(), [getEnrichedItems])
  const subtotal = useMemo(() => getSubtotal(), [getSubtotal])

  // Form State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [district, setDistrict] = useState('Dhaka')
  const [thana, setThana] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [senderNumber, setSenderNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')

  // UI state
  const submissionLock = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  // Estimated delivery charge based on district selection
  const deliveryCharge = useMemo(() => getDeliveryCharge(district), [district])
  const total = subtotal + deliveryCharge

  if (!isHydrated) {
    return (
      <div className="storefront-shell site-container flex min-h-[60vh] items-center justify-center py-16">
        <div className="animate-pulse text-center font-serif text-lg text-[var(--color-muted)]">
          Loading checkout...
        </div>
      </div>
    )
  }

  if (enrichedItems.length === 0) {
    return (
      <div className="storefront-shell site-container flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="19" cy="20" r="1" />
          </svg>
        </div>
        <p className="storefront-eyebrow mb-3">Checkout is waiting</p>
        <h1 className="mb-3 font-serif text-2xl font-semibold text-[var(--color-heading)] sm:text-3xl">Your Shopping Bag is Empty</h1>
        <p className="mb-8 max-w-md text-sm leading-6 text-[var(--color-text)]/60 sm:text-base">
          You must add at least one item to your shopping bag before proceeding to checkout.
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

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submissionLock.current) return

    submissionLock.current = true
    setSubmitting(true)
    setServerError('')
    setFormErrors({})

    const payload = {
      fullName,
      phone,
      email: email || undefined,
      district,
      thana,
      deliveryAddress,
      deliveryNotes: deliveryNotes || undefined,
      paymentMethod,
      paymentDetails:
        paymentMethod === 'bkash' || paymentMethod === 'nagad'
          ? {
            senderNumber: senderNumber || undefined,
            transactionId: transactionId || undefined
          }
          : undefined,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity
      }))
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        if (data.errors) {
          setFormErrors(data.errors)
        }
        setServerError(data.error || 'Your order could not be completed. Please try again in a moment.')
        submissionLock.current = false
        setSubmitting(false)
        return
      }

      // Order created successfully: Clear cart and redirect
      clearCart()
      router.push(`/checkout/success?orderNumber=${encodeURIComponent(data.orderNumber)}`)
    } catch {
      setServerError('Unable to place your order right now. Please check your connection and try again.')
      submissionLock.current = false
      setSubmitting(false)
    }
  }

  return (
    <main className="storefront-shell">
      <div className="site-container py-10 sm:py-12 lg:py-16">
        <div className="mb-10 border-b border-[var(--color-border)] pb-7">
          <p className="storefront-eyebrow mb-2">A considered final step</p>
          <h1 className="font-serif text-3xl font-semibold text-[var(--color-heading)] sm:text-4xl">Checkout</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Share your delivery details and choose how you would like to pay.</p>
        </div>

        {serverError && (
          <div role="alert" aria-live="assertive" className="mb-6 flex items-start justify-between rounded-[var(--radius-button)] border border-[var(--color-error)]/25 bg-[var(--color-error)]/10 p-4 text-sm text-[var(--color-error)] animate-fade-in">
            <div>
              <span className="font-semibold">We could not place your order. </span>
              {serverError}
            </div>
            <button
              type="button"
              onClick={() => setServerError('')}
              className="ml-4 font-bold text-[var(--color-error)] transition hover:opacity-70"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Contact Information */}
            <section className="storefront-card space-y-5 p-5 sm:p-6">
              <h2 className="border-b border-[var(--color-border)] pb-3 font-serif text-xl font-semibold text-[var(--color-heading)]">
                1. Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-heading)]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asif Ahmed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full rounded-[var(--radius-button)] border bg-[var(--color-input-background)] p-2.5 text-sm text-[var(--color-text)] transition focus:outline-none focus:ring-1 focus:ring-[var(--color-input-focus)] ${formErrors.fullName ? 'border-[var(--color-error)]' : 'border-[var(--color-input-border)]'
                      }`}
                  />
                  {formErrors.fullName && <p className="mt-1 text-xs text-[var(--color-error)]">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-heading)]">
                    Mobile Number (Bangladesh) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full rounded-[var(--radius-button)] border bg-[var(--color-input-background)] p-2.5 text-sm text-[var(--color-text)] transition focus:outline-none focus:ring-1 focus:ring-[var(--color-input-focus)] ${formErrors.phone ? 'border-[var(--color-error)]' : 'border-[var(--color-input-border)]'
                      }`}
                  />
                  {formErrors.phone && <p className="mt-1 text-xs text-[var(--color-error)]">{formErrors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-heading)]">
                  Email Address <span className="font-normal text-[var(--color-muted)]">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-[var(--radius-button)] border bg-[var(--color-input-background)] p-2.5 text-sm text-[var(--color-text)] transition focus:outline-none focus:ring-1 focus:ring-[var(--color-input-focus)] ${formErrors.email ? 'border-[var(--color-error)]' : 'border-[var(--color-input-border)]'
                    }`}
                />
                {formErrors.email && <p className="mt-1 text-xs text-[var(--color-error)]">{formErrors.email}</p>}
              </div>
            </section>

            {/* 2. Delivery Address */}
            <section className="storefront-card space-y-5 p-5 sm:p-6">
              <h2 className="border-b border-[var(--color-border)] pb-3 font-serif text-xl font-semibold text-[var(--color-heading)]">
                2. Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-heading)]">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={`w-full rounded-[var(--radius-button)] border bg-[var(--color-input-background)] p-2.5 text-sm text-[var(--color-text)] transition focus:outline-none focus:ring-1 focus:ring-[var(--color-input-focus)] ${formErrors.district ? 'border-[var(--color-error)]' : 'border-[var(--color-input-border)]'
                      }`}
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.division})
                      </option>
                    ))}
                  </select>
                  {formErrors.district && <p className="mt-1 text-xs text-[var(--color-error)]">{formErrors.district}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-heading)]">
                    Thana / Upazila / Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhanmondi, Uttara, Mirpur"
                    value={thana}
                    onChange={(e) => setThana(e.target.value)}
                    className={`w-full rounded-[var(--radius-button)] border bg-[var(--color-input-background)] p-2.5 text-sm text-[var(--color-text)] transition focus:outline-none focus:ring-1 focus:ring-[var(--color-input-focus)] ${formErrors.thana ? 'border-[var(--color-error)]' : 'border-[var(--color-input-border)]'
                      }`}
                  />
                  {formErrors.thana && <p className="mt-1 text-xs text-[var(--color-error)]">{formErrors.thana}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-heading)]">
                  Full Street Address *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House / Flat No., Road No., Sector / Village"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className={`w-full rounded-[var(--radius-button)] border bg-[var(--color-input-background)] p-2.5 text-sm text-[var(--color-text)] transition focus:outline-none focus:ring-1 focus:ring-[var(--color-input-focus)] ${formErrors.deliveryAddress ? 'border-[var(--color-error)]' : 'border-[var(--color-input-border)]'
                    }`}
                />
                {formErrors.deliveryAddress && (
                  <p className="mt-1 text-xs text-[var(--color-error)]">{formErrors.deliveryAddress}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-heading)]">
                  Delivery Notes / Special Instructions <span className="font-normal text-[var(--color-muted)]">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please call before delivery"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="min-h-[48px] w-full rounded-[var(--radius-button)] border border-[var(--color-input-border)] bg-[var(--color-input-background)] p-3 text-sm text-[var(--color-text)] transition focus:outline-none focus:ring-1 focus:ring-[var(--color-input-focus)]"
                />
              </div>
            </section>

            {/* 3. Payment Method */}
            <section className="storefront-card space-y-5 p-5 sm:p-6">
              <h2 className="border-b border-[var(--color-border)] pb-3 font-serif text-xl font-semibold text-[var(--color-heading)]">
                3. Payment Method
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-button)] border p-3.5 transition ${paymentMethod === 'cod'
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface)] shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-card-background)] hover:border-[var(--color-primary)]'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 text-[var(--color-primary)] focus:ring-[var(--color-input-focus)]"
                  />
                  <div className="text-sm">
                    <span className="block font-medium text-[var(--color-heading)]">Cash on Delivery (COD)</span>
                    <span className="text-xs text-[var(--color-muted)]">Pay with cash when your parcel is delivered to your doorstep.</span>
                  </div>
                </label>

                {/* bKash Manual */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-button)] border p-3.5 transition ${paymentMethod === 'bkash'
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface)] shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-card-background)] hover:border-[var(--color-primary)]'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bkash"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="mt-0.5 text-[var(--color-primary)] focus:ring-[var(--color-input-focus)]"
                  />
                  <div className="text-sm">
                    <span className="block font-medium text-[var(--color-heading)]">bKash (Manual Payment)</span>
                    <span className="text-xs text-[var(--color-muted)]">Send money to our bKash merchant/personal number.</span>
                  </div>
                </label>

                {/* Nagad Manual */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-button)] border p-3.5 transition ${paymentMethod === 'nagad'
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface)] shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-card-background)] hover:border-[var(--color-primary)]'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="nagad"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="mt-0.5 text-[var(--color-primary)] focus:ring-[var(--color-input-focus)]"
                  />
                  <div className="text-sm">
                    <span className="block font-medium text-[var(--color-heading)]">Nagad (Manual Payment)</span>
                    <span className="text-xs text-[var(--color-muted)]">Send money to our Nagad number.</span>
                  </div>
                </label>
              </div>

              {/* If bKash or Nagad is chosen, show optional transaction reference inputs */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                <div className="mt-3 space-y-3 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-card-background)] p-4 animate-fade-in">
                  <p className="text-xs font-medium text-[var(--color-primary)]">
                    {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} payment reference: enter the sender number and transaction ID after completing payment through your chosen service.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-[var(--color-muted)]">Sender Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full rounded border border-[var(--color-input-border)] bg-[var(--color-input-background)] p-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-input-focus)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-[var(--color-muted)]">Transaction ID (TrxID)</label>
                      <input
                        type="text"
                        placeholder="e.g. 9J87AKL2"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full rounded border border-[var(--color-input-border)] bg-[var(--color-input-background)] p-2 text-xs text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-input-focus)]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Order Summary & Placement */}
          <div className="lg:col-span-5">
            <div className="storefront-card sticky top-32 space-y-5 p-5 sm:p-6">
              <div>
                <p className="storefront-eyebrow mb-1">Review your edit</p>
                <h2 className="font-serif text-xl font-semibold text-[var(--color-heading)]">Order Summary</h2>
              </div>

              {/* Items review */}
              <div className="max-h-72 divide-y divide-[var(--color-border)] overflow-y-auto pr-1">
                {enrichedItems.map((item) => {
                  const product = item.product
                  const variant = item.variant
                  const thumbnail = variant?.image || product?.primaryImage || product?.images?.[0] || '/products/placeholder.svg'
                  const itemKey = getCartItemKey(item.productId, item.variantId)

                  return (
                    <div key={itemKey} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-section-background)]">
                        <Image src={thumbnail} alt={product?.name || 'Product'} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium text-[var(--color-heading)]">{product?.name || 'Product'}</div>
                        {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                          <div className="text-xs text-[var(--color-muted)]">
                            {Object.entries(item.selectedAttributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </div>
                        )}
                        <div className="mt-0.5 text-xs text-[var(--color-muted)]">
                          Qty: {item.quantity} × {formatPrice(item.effectivePrice)}
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-sm font-semibold text-[var(--color-heading)]">
                        {formatPrice(item.lineTotal)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pricing totals */}
              <div className="space-y-2.5 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text)]">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">
                    Delivery Charge ({district === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                  </span>
                  <span className="font-medium">{formatPrice(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-base font-bold text-[var(--color-heading)]">
                  <span>Total Payable</span>
                  <span className="text-xl text-[var(--color-primary)]">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="storefront-button flex min-h-[50px] w-full items-center justify-center gap-2 py-3.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>

              <div className="space-y-2 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-muted)]">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> Cash on delivery is available across Bangladesh
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> Delivery charge is calculated from your district
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> Track your order after it has been placed
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
