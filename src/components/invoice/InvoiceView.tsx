"use client"

import React from 'react'
import Image from 'next/image'
import type { Order, StoreSettings } from '../../types/models'

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

export interface InvoiceViewProps {
  order: Order
  settings?: StoreSettings
  showPrintButton?: boolean
}

export default function InvoiceView({
  order,
  settings,
  showPrintButton = true
}: InvoiceViewProps) {
  const storeName = settings?.name || settings?.storeName || "Hira's Universe"
  const contactEmail = settings?.contactEmail || 'info@hirasuniverse.com'

  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-[var(--color-border)] bg-[var(--color-card-background)] p-6 text-[var(--color-text)] shadow-sm sm:p-10 print:m-0 print:max-w-full print:border-none print:bg-white print:p-0 print:text-black print:shadow-none">
      {/* Print Action Header (Hidden in Print) */}
      {showPrintButton && (
        <div className="mb-6 flex items-center justify-between border-b border-[var(--color-border)] pb-4 print:hidden">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Official Invoice</span>
            <h1 className="font-serif text-xl font-bold text-[var(--color-heading)]">Order #{order.orderNumber}</h1>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded bg-[var(--color-button-background)] px-4 py-2 text-sm font-medium text-[var(--color-button-text)] shadow-sm transition hover:bg-[var(--color-button-hover)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Print / Save as PDF
          </button>
        </div>
      )}

      {/* Invoice Document Body */}
      <div className="space-y-8">
        {/* Header / Brand & Invoice Meta */}
        <div className="flex flex-col justify-between gap-6 border-b border-[var(--color-border)] pb-6 print:border-gray-300 sm:flex-row sm:items-start">
          <div>
            <div className="font-serif text-2xl font-bold text-[var(--color-primary)] print:text-black">{storeName}</div>
            <p className="mt-1 text-xs text-[var(--color-muted)] print:text-gray-600">Curated Modest Fashion & Timeless Essentials</p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)] print:text-gray-600">Email: {contactEmail}</p>
          </div>

          <div className="space-y-1 sm:text-right">
            <div className="font-serif text-lg font-bold text-[var(--color-heading)] print:text-black">INVOICE</div>
            <div className="text-sm font-semibold text-[var(--color-primary)] print:text-black">#{order.orderNumber}</div>
            <div className="text-xs text-[var(--color-muted)] print:text-gray-600">Date: {formatDate(order.createdAt)}</div>
            <div className="text-xs text-[var(--color-muted)] print:text-gray-600">
              Status: <span className="font-semibold uppercase text-[var(--color-text)] print:text-black">{order.orderStatus}</span>
            </div>
            <div className="text-xs text-[var(--color-muted)] print:text-gray-600">
              Payment: <span className="font-semibold uppercase text-[var(--color-text)] print:text-black">{order.paymentMethod} ({order.paymentStatus})</span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-section-background)] p-4 print:border-gray-300 print:bg-gray-50">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] print:text-gray-600">Customer Details</h2>
            <div className="font-semibold text-[var(--color-text)] print:text-black">{order.customer.fullName}</div>
            <div className="mt-1 text-xs text-[var(--color-muted)] print:text-gray-600">Phone: {order.customer.phone}</div>
            {order.customer.email && (
              <div className="text-xs text-[var(--color-muted)] print:text-gray-600">Email: {order.customer.email}</div>
            )}
          </div>

          <div className="rounded border border-[var(--color-border)] bg-[var(--color-section-background)] p-4 print:border-gray-300 print:bg-gray-50">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] print:text-gray-600">Delivery Destination</h2>
            <div className="font-medium text-[var(--color-text)] print:text-black">{order.shippingAddress.deliveryAddress}</div>
            <div className="mt-0.5 text-xs text-[var(--color-muted)] print:text-gray-600">
              {order.shippingAddress.thana}, {order.shippingAddress.district}
            </div>
            {order.shippingAddress.deliveryNotes && (
              <div className="mt-1 text-xs italic text-[var(--color-muted)] print:text-gray-600">
                Note: {order.shippingAddress.deliveryNotes}
              </div>
            )}
          </div>
        </div>

        {/* Itemized Order Snapshot Table */}
        <div className="overflow-hidden rounded border border-[var(--color-border)] print:border-gray-300">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] print:border-gray-300 print:bg-gray-100 print:text-gray-600">
              <tr>
                <th className="px-4 py-3">Item Description</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] print:divide-gray-300">
              {order.items.map((item, idx) => {
                const thumbnail = item.image || '/products/placeholder.svg'
                const itemSku = item.variantSku || item.productSku || '—'

                return (
                  <tr key={idx} className="hover:bg-[var(--color-surface)] print:hover:bg-white">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-section-background)] print:hidden">
                          <Image src={thumbnail} alt={item.productName} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div className="font-medium text-[var(--color-text)] print:text-black">{item.productName}</div>
                          {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                            <div className="text-xs text-[var(--color-muted)] print:text-gray-600">
                              {Object.entries(item.selectedAttributes)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-[var(--color-muted)] print:text-gray-600">{itemSku}</td>
                    <td className="px-4 py-3.5 text-right text-xs whitespace-nowrap">
                      <span className="font-medium text-[var(--color-text)] print:text-black">{formatPrice(item.unitPrice)}</span>
                      {item.regularPrice > item.unitPrice && (
                        <span className="block text-2xs text-[var(--color-muted)] line-through print:text-gray-600">
                          {formatPrice(item.regularPrice)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-[var(--color-text)] print:text-black">{item.quantity}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-[var(--color-text)] print:text-black">
                      {formatPrice(item.lineTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Totals */}
        <div className="flex justify-end pt-2">
          <div className="w-full space-y-2 text-sm text-[var(--color-text)] print:text-black sm:w-72">
            <div className="flex justify-between text-xs text-[var(--color-muted)] print:text-gray-600">
              <span>Items Subtotal:</span>
              <span className="font-medium text-[var(--color-text)] print:text-black">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--color-muted)] print:text-gray-600">
              <span>Delivery Charge:</span>
              <span className="font-medium text-[var(--color-text)] print:text-black">{formatPrice(order.deliveryCharge)}</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700 text-xs">
                <span>Discount:</span>
                <span className="font-medium">-{formatPrice(order.discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-base font-bold text-[var(--color-text)] print:border-gray-300 print:text-black">
              <span>Total Payable:</span>
              <span className="text-[var(--color-primary)] print:text-black">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="space-y-1 border-t border-[var(--color-border)] pt-6 text-center text-xs text-[var(--color-muted)] print:border-gray-300 print:text-gray-600">
          <p className="font-serif italic text-[var(--color-text)] print:text-black">Thank you for choosing {storeName}.</p>
          <p>For any order queries, contact us at {contactEmail}.</p>
        </div>
      </div>
    </div>
  )
}
