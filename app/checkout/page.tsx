"use client"

import React, { useState, useMemo } from 'react'
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
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  // Estimated delivery charge based on district selection
  const deliveryCharge = useMemo(() => getDeliveryCharge(district), [district])
  const total = subtotal + deliveryCharge

  if (!isHydrated) {
    return (
      <div className="site-container py-16 min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-taupe animate-pulse font-serif text-lg">
          Loading checkout...
        </div>
      </div>
    )
  }

  if (enrichedItems.length === 0) {
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
          You must add at least one item to your shopping bag before proceeding to checkout.
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

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault()
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
        setServerError(data.error || 'Failed to place order. Please check the form and try again.')
        setSubmitting(false)
        return
      }

      // Order created successfully: Clear cart and redirect
      clearCart()
      router.push(`/checkout/success?orderNumber=${encodeURIComponent(data.orderNumber)}`)
    } catch (err: any) {
      setServerError('An unexpected network error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="site-container py-8 sm:py-10 md:py-12">
      <div className="mb-8 border-b border-black/10 pb-5">
        <h1 className="font-serif text-3xl font-semibold text-charcoal sm:text-4xl">Checkout</h1>
        <p className="text-sm text-taupe mt-1">Please provide your delivery information to complete your order.</p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in flex items-start justify-between">
          <div>
            <span className="font-semibold">Order Notice: </span>
            {serverError}
          </div>
          <button
            type="button"
            onClick={() => setServerError('')}
            className="text-red-500 hover:text-red-700 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Contact Information */}
          <section className="space-y-4 rounded-lg border border-black/10 bg-white/65 p-5 sm:p-6">
            <h2 className="font-serif text-lg font-semibold text-charcoal border-b border-cream pb-2">
              1. Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Ahmed"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full border rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-mocha transition ${formErrors.fullName ? 'border-red-500' : 'border-taupe/30'
                    }`}
                />
                {formErrors.fullName && <p className="text-xs text-red-600 mt-1">{formErrors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  Mobile Number (Bangladesh) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full border rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-mocha transition ${formErrors.phone ? 'border-red-500' : 'border-taupe/30'
                    }`}
                />
                {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Email Address <span className="text-taupe font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-mocha transition ${formErrors.email ? 'border-red-500' : 'border-taupe/30'
                  }`}
              />
              {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
            </div>
          </section>

          {/* 2. Delivery Address */}
          <section className="space-y-4 rounded-lg border border-black/10 bg-white/65 p-5 sm:p-6">
            <h2 className="font-serif text-lg font-semibold text-charcoal border-b border-cream pb-2">
              2. Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  District *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className={`w-full border rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-mocha transition ${formErrors.district ? 'border-red-500' : 'border-taupe/30'
                    }`}
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({d.division})
                    </option>
                  ))}
                </select>
                {formErrors.district && <p className="text-xs text-red-600 mt-1">{formErrors.district}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  Thana / Upazila / Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhanmondi, Uttara, Mirpur"
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  className={`w-full border rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-mocha transition ${formErrors.thana ? 'border-red-500' : 'border-taupe/30'
                    }`}
                />
                {formErrors.thana && <p className="text-xs text-red-600 mt-1">{formErrors.thana}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Full Street Address *
              </label>
              <textarea
                required
                rows={2}
                placeholder="House / Flat No., Road No., Sector / Village"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className={`w-full border rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-mocha transition ${formErrors.deliveryAddress ? 'border-red-500' : 'border-taupe/30'
                  }`}
              />
              {formErrors.deliveryAddress && (
                <p className="text-xs text-red-600 mt-1">{formErrors.deliveryAddress}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Delivery Notes / Special Instructions <span className="text-taupe font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Please call before delivery"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="min-h-[48px] w-full rounded-md border border-taupe/30 bg-white p-3 text-sm transition focus:outline-none focus:ring-1 focus:ring-mocha"
              />
            </div>
          </section>

          {/* 3. Payment Method */}
          <section className="space-y-4 rounded-lg border border-black/10 bg-white/65 p-5 sm:p-6">
            <h2 className="font-serif text-lg font-semibold text-charcoal border-b border-cream pb-2">
              3. Payment Method
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition ${paymentMethod === 'cod'
                  ? 'border-mocha bg-cream/50 shadow-xs'
                  : 'border-taupe/30 bg-white hover:border-taupe'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-0.5 text-mocha focus:ring-mocha"
                />
                <div className="text-sm">
                  <span className="font-medium text-charcoal block">Cash on Delivery (COD)</span>
                  <span className="text-xs text-taupe">Pay with cash when your parcel is delivered to your doorstep.</span>
                </div>
              </label>

              {/* bKash Manual */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition ${paymentMethod === 'bkash'
                  ? 'border-mocha bg-cream/50 shadow-xs'
                  : 'border-taupe/30 bg-white hover:border-taupe'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="mt-0.5 text-mocha focus:ring-mocha"
                />
                <div className="text-sm">
                  <span className="font-medium text-charcoal block">bKash (Manual Payment)</span>
                  <span className="text-xs text-taupe">Send money to our bKash merchant/personal number.</span>
                </div>
              </label>

              {/* Nagad Manual */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-md border cursor-pointer transition ${paymentMethod === 'nagad'
                  ? 'border-mocha bg-cream/50 shadow-xs'
                  : 'border-taupe/30 bg-white hover:border-taupe'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="nagad"
                  checked={paymentMethod === 'nagad'}
                  onChange={() => setPaymentMethod('nagad')}
                  className="mt-0.5 text-mocha focus:ring-mocha"
                />
                <div className="text-sm">
                  <span className="font-medium text-charcoal block">Nagad (Manual Payment)</span>
                  <span className="text-xs text-taupe">Send money to our Nagad number.</span>
                </div>
              </label>
            </div>

            {/* If bKash or Nagad is chosen, show optional transaction reference inputs */}
            {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
              <div className="p-4 bg-white border border-taupe/30 rounded-md space-y-3 mt-3 animate-fade-in">
                <p className="text-xs text-mocha font-medium">
                  {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Payment Instructions: Please send total amount to our official number <span className="font-semibold">01700-000000</span> and enter your details below.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-taupe mb-1">Sender Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full border border-taupe/30 rounded p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-taupe mb-1">Transaction ID (TrxID)</label>
                    <input
                      type="text"
                      placeholder="e.g. 9J87AKL2"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full border border-taupe/30 rounded p-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 space-y-5 rounded-lg border border-black/10 bg-white/70 p-5 shadow-[0_12px_32px_rgba(34,34,34,0.06)] sm:p-6">
            <h2 className="font-serif text-xl font-semibold text-charcoal">Order Summary</h2>

            {/* Items review */}
            <div className="divide-y divide-taupe/20 max-h-72 overflow-y-auto pr-1">
              {enrichedItems.map((item) => {
                const product = item.product
                const variant = item.variant
                const thumbnail = variant?.image || product?.primaryImage || product?.images?.[0] || '/products/placeholder.svg'
                const itemKey = getCartItemKey(item.productId, item.variantId)

                return (
                  <div key={itemKey} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white">
                      <Image src={thumbnail} alt={product?.name || 'Product'} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-charcoal truncate">{product?.name || 'Product'}</div>
                      {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                        <div className="text-xs text-taupe">
                          {Object.entries(item.selectedAttributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </div>
                      )}
                      <div className="text-xs text-taupe mt-0.5">
                        Qty: {item.quantity} × {formatPrice(item.effectivePrice)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-charcoal whitespace-nowrap">
                      {formatPrice(item.lineTotal)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pricing totals */}
            <div className="space-y-2.5 text-sm text-charcoal border-t border-taupe/20 pt-4">
              <div className="flex justify-between">
                <span className="text-taupe">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-taupe">
                  Delivery Charge ({district === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                </span>
                <span className="font-medium">{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between border-t border-taupe/20 pt-3 text-base font-bold text-charcoal">
                <span>Total Payable</span>
                <span className="text-xl text-mocha">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-mocha text-ivory font-medium text-sm rounded-md hover:opacity-90 transition shadow-sm flex items-center justify-center min-h-[48px] disabled:opacity-60"
            >
              {submitting ? 'Placing Order...' : 'Confirm Order'}
            </button>

            <div className="border-t border-taupe/20 pt-4 space-y-2 text-xs text-taupe">
              <div className="flex items-center gap-2">
                <span>✓</span> Cash on delivery available across all 64 districts
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span> Estimated delivery: {district === 'Dhaka' ? '2-3 days' : '3-5 days'}
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span> 100% authentic quality guaranteed
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
