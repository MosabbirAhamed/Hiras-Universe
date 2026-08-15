"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus, PaymentStatus } from '../../../../src/types/models'

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

function getOrderStatusBadge(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'shipped':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    case 'delivered':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getPaymentStatusBadge(status: PaymentStatus) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'refunded':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function OrderDetailClient({ initialOrder }: { initialOrder: Order }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order>(initialOrder)
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<OrderStatus>(initialOrder.orderStatus)
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>(initialOrder.paymentStatus)
  const [adminNotes, setAdminNotes] = useState(initialOrder.adminNotes || '')

  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  async function handleUpdate(newStatus?: OrderStatus, newPaymentStatus?: PaymentStatus, notes?: string) {
    setSaving(true)
    setFeedback(null)

    const statusToSave = newStatus || selectedOrderStatus
    const paymentToSave = newPaymentStatus || selectedPaymentStatus
    const notesToSave = typeof notes === 'string' ? notes : adminNotes

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: statusToSave,
          paymentStatus: paymentToSave,
          adminNotes: notesToSave
        })
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to update order status.'
        })
        setSaving(false)
        return
      }

      setOrder(data.order)
      setSelectedOrderStatus(data.order.orderStatus)
      setSelectedPaymentStatus(data.order.paymentStatus)
      setFeedback({
        type: 'success',
        message: 'Order updated successfully.'
      })
      setShowCancelModal(false)
      router.refresh()
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred while saving.'
      })
    } finally {
      setSaving(false)
    }
  }

  function handleStatusChangeClick() {
    if (selectedOrderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
      setShowCancelModal(true)
    } else {
      handleUpdate(selectedOrderStatus, selectedPaymentStatus, adminNotes)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-xs font-medium text-mocha hover:underline"
        >
          ← Back to All Orders
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/orders/${order.id}/invoice`}
            className="px-3 py-1.5 border border-cream rounded text-xs text-charcoal hover:bg-cream transition flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Official Invoice
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-ivory border border-cream rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-charcoal">
              Order {order.orderNumber}
            </h1>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border uppercase tracking-wider ${getOrderStatusBadge(
                order.orderStatus
              )}`}
            >
              {order.orderStatus}
            </span>
          </div>
          <p className="text-xs text-taupe mt-1">
            Placed on {formatDate(order.createdAt)} • Last updated {formatDate(order.updatedAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-taupe">Stock Status:</span>
          {order.stockDeducted ? (
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded font-medium">
              ✓ Inventory Deducted
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 text-xs rounded font-medium">
              Inventory Restored / None
            </span>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-sm flex items-start justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div>{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-bold text-sm ml-4 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Details & Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Order Items & Customer Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items Table */}
          <div className="bg-ivory border border-cream rounded-lg overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-cream bg-cream/40 flex items-center justify-between">
              <h2 className="font-serif text-base font-semibold text-charcoal">
                Order Items ({order.items.reduce((s, it) => s + it.quantity, 0)})
              </h2>
              <span className="text-xs text-taupe">Immutable Snapshot</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-charcoal">
                <thead className="bg-cream/20 text-xs uppercase font-semibold text-taupe tracking-wider border-b border-cream">
                  <tr>
                    <th className="px-4 py-3">Item Details</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream">
                  {order.items.map((item, idx) => {
                    const thumbnail = item.image || '/products/placeholder.svg'
                    const itemSku = item.variantSku || item.productSku || '—'

                    return (
                      <tr key={idx} className="hover:bg-cream/10">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded border border-cream bg-white overflow-hidden flex-shrink-0">
                              <Image src={thumbnail} alt={item.productName} fill style={{ objectFit: 'cover' }} />
                            </div>
                            <div>
                              <div className="font-medium text-charcoal">{item.productName}</div>
                              {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                                <div className="text-xs text-taupe font-medium mt-0.5">
                                  {Object.entries(item.selectedAttributes)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(' • ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-taupe whitespace-nowrap">{itemSku}</td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {formatPrice(item.unitPrice)}
                          {item.regularPrice > item.unitPrice && (
                            <span className="text-xs text-taupe line-through block">
                              {formatPrice(item.regularPrice)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center font-semibold">{item.quantity}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-charcoal whitespace-nowrap">
                          {formatPrice(item.lineTotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-4 border-t border-cream bg-cream/20 flex justify-end">
              <div className="w-full max-w-xs space-y-2 text-sm text-charcoal">
                <div className="flex justify-between text-taupe">
                  <span>Subtotal:</span>
                  <span className="font-medium text-charcoal">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-taupe">
                  <span>Delivery Charge:</span>
                  <span className="font-medium text-charcoal">{formatPrice(order.deliveryCharge)}</span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-medium">-{formatPrice(order.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-cream pt-2 text-base font-bold text-charcoal">
                  <span>Total Payable:</span>
                  <span className="text-mocha">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-ivory border border-cream rounded-lg p-5 space-y-3 shadow-2xs text-sm">
              <h3 className="font-serif text-base font-semibold text-charcoal border-b border-cream pb-2">
                Customer Information
              </h3>
              <div className="space-y-1.5">
                <div>
                  <span className="text-xs text-taupe uppercase tracking-wider block">Full Name</span>
                  <span className="font-medium text-charcoal">{order.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-taupe uppercase tracking-wider block">Mobile Phone</span>
                  <span className="font-medium text-charcoal">{order.customer.phone}</span>
                </div>
                <div>
                  <span className="text-xs text-taupe uppercase tracking-wider block">Email Address</span>
                  <span className="text-charcoal">{order.customer.email || 'None provided'}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-ivory border border-cream rounded-lg p-5 space-y-3 shadow-2xs text-sm">
              <h3 className="font-serif text-base font-semibold text-charcoal border-b border-cream pb-2">
                Shipping Address
              </h3>
              <div className="space-y-1.5">
                <div>
                  <span className="text-xs text-taupe uppercase tracking-wider block">District & Thana</span>
                  <span className="font-medium text-charcoal">
                    {order.shippingAddress.thana}, {order.shippingAddress.district}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-taupe uppercase tracking-wider block">Street Address</span>
                  <span className="text-charcoal">{order.shippingAddress.deliveryAddress}</span>
                </div>
                {order.shippingAddress.deliveryNotes && (
                  <div>
                    <span className="text-xs text-taupe uppercase tracking-wider block">Delivery Notes</span>
                    <span className="text-xs italic text-taupe">{order.shippingAddress.deliveryNotes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Status Controls & Payment Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Status Management Box */}
          <div className="bg-ivory border border-cream rounded-lg p-5 space-y-4 shadow-2xs">
            <h3 className="font-serif text-base font-semibold text-charcoal border-b border-cream pb-2">
              Update Order Status
            </h3>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Order Lifecycle Status
              </label>
              <select
                value={selectedOrderStatus}
                onChange={(e) => setSelectedOrderStatus(e.target.value as OrderStatus)}
                disabled={order.orderStatus === 'cancelled'}
                className="w-full rounded border border-cream bg-white p-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha disabled:opacity-60"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {order.orderStatus === 'cancelled' && (
                <p className="text-xs text-red-600 mt-1">
                  Cancelled orders cannot be reopened directly.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Payment Status
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full rounded border border-cream bg-white p-2.5 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Admin Notes / Internal Remarks
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes, courier tracking ID, customer communication..."
                className="w-full rounded border border-cream bg-white p-2.5 text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha"
              />
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleStatusChangeClick}
              className="w-full py-2.5 bg-mocha text-ivory text-sm font-medium rounded hover:opacity-90 transition shadow-xs disabled:opacity-60 min-h-[40px]"
            >
              {saving ? 'Saving Changes...' : 'Save Updates'}
            </button>
          </div>

          {/* Payment Information Box */}
          <div className="bg-ivory border border-cream rounded-lg p-5 space-y-3 shadow-2xs text-sm">
            <h3 className="font-serif text-base font-semibold text-charcoal border-b border-cream pb-2">
              Payment Information
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-taupe uppercase tracking-wider">Method:</span>
                <span className="font-semibold uppercase text-xs text-charcoal">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-xs text-taupe uppercase tracking-wider">Status:</span>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded border uppercase tracking-wider ${getPaymentStatusBadge(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              {order.paymentDetails && (
                <div className="border-t border-cream pt-2 space-y-1 text-xs">
                  {order.paymentDetails.senderNumber && (
                    <div className="flex justify-between">
                      <span className="text-taupe">Sender Number:</span>
                      <span className="font-mono">{order.paymentDetails.senderNumber}</span>
                    </div>
                  )}
                  {order.paymentDetails.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-taupe">TrxID:</span>
                      <span className="font-mono font-semibold text-mocha">
                        {order.paymentDetails.transactionId}
                      </span>
                    </div>
                  )}
                  {order.paymentDetails.notes && (
                    <div>
                      <span className="text-taupe block">Notes:</span>
                      <span className="text-charcoal italic">{order.paymentDetails.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Cancellation */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-ivory border border-cream rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl animate-fade-in">
            <h3 className="font-serif text-lg font-bold text-red-700">Cancel Order #{order.orderNumber}?</h3>
            <p className="text-sm text-charcoal leading-relaxed">
              Cancelling this order will mark it as cancelled and{' '}
              <strong className="font-semibold">automatically restore deducted inventory</strong> back to the product catalog.
            </p>
            <p className="text-xs text-taupe">
              This action is idempotent and cannot be undone directly.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-cream rounded text-sm text-charcoal hover:bg-cream transition"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleUpdate('cancelled', selectedPaymentStatus, adminNotes)}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition disabled:opacity-60"
              >
                {saving ? 'Cancelling...' : 'Confirm Cancellation & Restock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
