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
    <div className="bg-white text-charcoal max-w-4xl mx-auto p-6 sm:p-10 border border-cream rounded-lg shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
      {/* Print Action Header (Hidden in Print) */}
      {showPrintButton && (
        <div className="mb-6 flex items-center justify-between border-b border-cream pb-4 print:hidden">
          <div>
            <span className="text-xs font-semibold text-taupe uppercase tracking-wider">Official Invoice</span>
            <h1 className="text-xl font-serif font-bold text-charcoal">Order #{order.orderNumber}</h1>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-mocha text-ivory text-sm font-medium rounded hover:opacity-90 transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Print / Save as PDF
          </button>
        </div>
      )}

      {/* Invoice Document Body */}
      <div className="space-y-8">
        {/* Header / Brand & Invoice Meta */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-cream pb-6">
          <div>
            <div className="font-serif text-2xl font-bold text-mocha">{storeName}</div>
            <p className="text-xs text-taupe mt-1">Curated Modest Fashion & Timeless Essentials</p>
            <p className="text-xs text-taupe mt-0.5">Email: {contactEmail}</p>
          </div>

          <div className="sm:text-right space-y-1">
            <div className="text-lg font-serif font-bold text-charcoal">INVOICE</div>
            <div className="text-sm font-semibold text-mocha">#{order.orderNumber}</div>
            <div className="text-xs text-taupe">Date: {formatDate(order.createdAt)}</div>
            <div className="text-xs text-taupe">
              Status: <span className="font-semibold uppercase text-charcoal">{order.orderStatus}</span>
            </div>
            <div className="text-xs text-taupe">
              Payment: <span className="font-semibold uppercase text-charcoal">{order.paymentMethod} ({order.paymentStatus})</span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="bg-ivory/60 p-4 rounded border border-cream">
            <h2 className="text-xs font-bold uppercase text-taupe tracking-wider mb-2">Customer Details</h2>
            <div className="font-semibold text-charcoal">{order.customer.fullName}</div>
            <div className="text-taupe text-xs mt-1">Phone: {order.customer.phone}</div>
            {order.customer.email && (
              <div className="text-taupe text-xs">Email: {order.customer.email}</div>
            )}
          </div>

          <div className="bg-ivory/60 p-4 rounded border border-cream">
            <h2 className="text-xs font-bold uppercase text-taupe tracking-wider mb-2">Delivery Destination</h2>
            <div className="font-medium text-charcoal">{order.shippingAddress.deliveryAddress}</div>
            <div className="text-taupe text-xs mt-0.5">
              {order.shippingAddress.thana}, {order.shippingAddress.district}
            </div>
            {order.shippingAddress.deliveryNotes && (
              <div className="text-xs text-taupe italic mt-1">
                Note: {order.shippingAddress.deliveryNotes}
              </div>
            )}
          </div>
        </div>

        {/* Itemized Order Snapshot Table */}
        <div className="border border-cream rounded overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-cream/50 text-xs font-semibold text-taupe uppercase tracking-wider border-b border-cream">
              <tr>
                <th className="px-4 py-3">Item Description</th>
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
                        <div className="relative w-10 h-10 rounded border border-cream bg-ivory overflow-hidden flex-shrink-0 print:hidden">
                          <Image src={thumbnail} alt={item.productName} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div className="font-medium text-charcoal">{item.productName}</div>
                          {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                            <div className="text-xs text-taupe">
                              {Object.entries(item.selectedAttributes)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-taupe whitespace-nowrap">{itemSku}</td>
                    <td className="px-4 py-3.5 text-right text-xs whitespace-nowrap">
                      <span className="font-medium text-charcoal">{formatPrice(item.unitPrice)}</span>
                      {item.regularPrice > item.unitPrice && (
                        <span className="text-taupe line-through block text-2xs">
                          {formatPrice(item.regularPrice)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-charcoal">{item.quantity}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-charcoal whitespace-nowrap">
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
          <div className="w-full sm:w-72 space-y-2 text-sm text-charcoal">
            <div className="flex justify-between text-taupe text-xs">
              <span>Items Subtotal:</span>
              <span className="font-medium text-charcoal">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-taupe text-xs">
              <span>Delivery Charge:</span>
              <span className="font-medium text-charcoal">{formatPrice(order.deliveryCharge)}</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700 text-xs">
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

        {/* Footer Notes */}
        <div className="border-t border-cream pt-6 text-center text-xs text-taupe space-y-1">
          <p className="font-serif italic text-charcoal">Thank you for choosing {storeName}.</p>
          <p>For any order queries, contact us at {contactEmail}.</p>
        </div>
      </div>
    </div>
  )
}
