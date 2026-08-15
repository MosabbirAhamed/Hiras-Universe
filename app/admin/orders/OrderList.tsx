"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus, PaymentStatus } from '../../../src/types/models'

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

export default function OrderList({ items: initialItems }: { items: Order[] }) {
  const router = useRouter()
  const [items, setItems] = useState<Order[]>(initialItems)
  const [query, setQuery] = useState('')
  const [orderStatus, setOrderStatus] = useState<string>('all')
  const [paymentStatus, setPaymentStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'total_desc' | 'total_asc'>('newest')

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error'
    message: string
    details?: string[]
  } | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = items.filter((order) => {
      const matchesQuery =
        !q ||
        [
          order.orderNumber,
          order.customer.fullName,
          order.customer.phone,
          order.customer.email,
          order.shippingAddress.district,
          order.shippingAddress.thana
        ].some((val) => val?.toLowerCase().includes(q))

      const matchesOrderStatus = orderStatus === 'all' || order.orderStatus === orderStatus
      const matchesPaymentStatus = paymentStatus === 'all' || order.paymentStatus === paymentStatus

      return matchesQuery && matchesOrderStatus && matchesPaymentStatus
    })

    // Sort
    return result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === 'total_desc') {
        return (b.total || 0) - (a.total || 0)
      }
      if (sortBy === 'total_asc') {
        return (a.total || 0) - (b.total || 0)
      }
      return 0
    })
  }, [items, orderStatus, paymentStatus, query, sortBy])

  // Select all / toggle
  const allFilteredSelected = filtered.length > 0 && filtered.every((o) => selectedIds.includes(o.id))

  function handleToggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map((o) => o.id))
    }
  }

  function handleToggleRow(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  // Bulk status update execution
  async function handleBulkStatusChange(targetStatus: OrderStatus) {
    if (selectedIds.length === 0) return
    setIsUpdatingBulk(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedIds,
          nextStatus: targetStatus
        })
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to process bulk status update.'
        })
        setIsUpdatingBulk(false)
        return
      }

      const succeededIds: string[] = data.succeeded || []
      const failedItems: { id: string; error: string }[] = data.failed || []

      // Update local state for succeeded orders
      setItems((prev) =>
        prev.map((order) => {
          if (succeededIds.includes(order.id)) {
            return {
              ...order,
              orderStatus: targetStatus,
              stockDeducted: targetStatus === 'cancelled' ? false : order.stockDeducted,
              updatedAt: new Date().toISOString()
            }
          }
          return order
        })
      )

      if (failedItems.length > 0) {
        setFeedback({
          type: 'warning',
          message: `Updated ${succeededIds.length} orders to ${targetStatus}. ${failedItems.length} orders could not be updated.`,
          details: failedItems.map((f) => f.error)
        })
      } else {
        setFeedback({
          type: 'success',
          message: `Successfully updated ${succeededIds.length} orders to ${targetStatus}.`
        })
        setSelectedIds([])
      }

      setShowCancelModal(false)
      router.refresh()
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred during bulk update.'
      })
    } finally {
      setIsUpdatingBulk(false)
    }
  }

  return (
    <div className="grid gap-4">
      {/* Search & Filter Bar */}
      <div className="rounded-lg border border-cream bg-ivory p-4 shadow-2xs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
            Search Orders
            <input
              type="text"
              className="mt-1 w-full rounded border border-cream bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order #, Customer, Phone, District..."
            />
          </label>

          <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
            Order Status
            <select
              className="mt-1 w-full rounded border border-cream bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
            >
              <option value="all">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
            Payment Status
            <select
              className="mt-1 w-full rounded border border-cream bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
            Sort By
            <select
              className="mt-1 w-full rounded border border-cream bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="total_desc">Total Amount (High → Low)</option>
              <option value="total_asc">Total Amount (Low → High)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Bulk Action Bar (Visible when orders are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-mocha text-ivory rounded-lg p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">
              {selectedIds.length} order{selectedIds.length === 1 ? '' : 's'} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-cream hover:underline opacity-80 hover:opacity-100"
            >
              Deselect All
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isUpdatingBulk}
              onClick={() => handleBulkStatusChange('processing')}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded text-xs font-medium transition disabled:opacity-50"
            >
              Mark Processing
            </button>
            <button
              type="button"
              disabled={isUpdatingBulk}
              onClick={() => handleBulkStatusChange('shipped')}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded text-xs font-medium transition disabled:opacity-50"
            >
              Mark Shipped
            </button>
            <button
              type="button"
              disabled={isUpdatingBulk}
              onClick={() => handleBulkStatusChange('delivered')}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded text-xs font-medium transition disabled:opacity-50"
            >
              Mark Delivered
            </button>
            <button
              type="button"
              disabled={isUpdatingBulk}
              onClick={() => setShowCancelModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition disabled:opacity-50"
            >
              Cancel Selected
            </button>
            <Link
              href={`/admin/orders/invoices?ids=${selectedIds.join(',')}`}
              className="px-3 py-1.5 bg-ivory text-charcoal hover:bg-cream rounded text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Print Selected Invoices
            </Link>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-lg text-sm flex items-start justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : feedback.type === 'warning'
              ? 'bg-amber-50 border border-amber-200 text-amber-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="space-y-1">
            <div className="font-semibold">{feedback.message}</div>
            {feedback.details && feedback.details.length > 0 && (
              <ul className="text-xs list-disc list-inside opacity-90 pl-1">
                {feedback.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-bold text-sm ml-4 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Orders Count Summary */}
      <div className="flex items-center justify-between text-xs text-taupe px-1">
        <span>
          Showing {filtered.length} of {items.length} {items.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {/* Empty State */}
      {!items.length && (
        <div className="rounded-lg border border-cream bg-ivory p-8 text-center text-sm text-taupe">
          No customer orders have been placed yet.
        </div>
      )}

      {items.length > 0 && !filtered.length && (
        <div className="rounded-lg border border-cream bg-ivory p-8 text-center text-sm text-taupe">
          No orders match the selected filters or search terms.
        </div>
      )}

      {/* Orders List Table */}
      {filtered.length > 0 && (
        <div className="rounded-lg border border-cream bg-ivory overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-charcoal">
              <thead className="bg-cream/60 text-xs uppercase font-semibold text-taupe tracking-wider border-b border-cream">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-cream text-mocha focus:ring-mocha"
                      title="Select all filtered orders"
                    />
                  </th>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {filtered.map((order) => {
                  const isSelected = selectedIds.includes(order.id)
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-cream/20 transition ${isSelected ? 'bg-cream/40' : ''}`}
                    >
                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(order.id)}
                          className="rounded border-cream text-mocha focus:ring-mocha"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-mocha whitespace-nowrap">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-taupe whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-charcoal">{order.customer.fullName}</div>
                        <div className="text-xs text-taupe">{order.customer.phone}</div>
                        <div className="text-xs text-taupe/80">{order.shippingAddress.district}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-charcoal whitespace-nowrap">
                        {order.items.reduce((sum, it) => sum + it.quantity, 0)} items
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-charcoal whitespace-nowrap">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-xs uppercase font-medium text-charcoal mb-1">
                          {order.paymentMethod}
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-semibold rounded border uppercase tracking-wider ${getPaymentStatusBadge(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${getOrderStatusBadge(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="px-3 py-1.5 bg-mocha text-ivory text-xs font-medium rounded hover:opacity-90 transition inline-block"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/admin/orders/${order.id}/invoice`}
                          className="px-2.5 py-1.5 border border-cream text-charcoal text-xs font-medium rounded hover:bg-cream transition inline-block"
                          title="Print Invoice"
                        >
                          Invoice
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Bulk Cancellation */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-ivory border border-cream rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl animate-fade-in">
            <h3 className="font-serif text-lg font-bold text-red-700">
              Cancel {selectedIds.length} Selected Orders?
            </h3>
            <p className="text-sm text-charcoal leading-relaxed">
              Cancelling these orders will mark them as cancelled and{' '}
              <strong className="font-semibold">automatically restore deducted inventory</strong> for each item back to the product catalog.
            </p>
            <p className="text-xs text-taupe">
              Already cancelled orders will be safely skipped. This action cannot be reopened directly.
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
                disabled={isUpdatingBulk}
                onClick={() => handleBulkStatusChange('cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition disabled:opacity-60"
              >
                {isUpdatingBulk ? 'Cancelling...' : 'Confirm Bulk Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
