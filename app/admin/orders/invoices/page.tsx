import React from 'react'
import Link from 'next/link'
import { getOrders, getSettings } from '../../../../src/lib/repositories/fileRepo'
import InvoiceView from '../../../../src/components/invoice/InvoiceView'

export const metadata = {
  title: 'Batch Invoices - Admin | Hira\'s Universe'
}

export default async function BatchInvoicesPage({
  searchParams
}: {
  searchParams: { ids?: string }
}) {
  const [allOrders, settings] = await Promise.all([getOrders(), getSettings()])

  const rawIds = searchParams.ids || ''
  const requestedIds = rawIds
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const selectedOrders = allOrders.filter((order) => requestedIds.includes(order.id))

  if (selectedOrders.length === 0) {
    return (
      <div className="rounded-lg border border-cream bg-ivory p-8 text-center space-y-4 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-serif font-bold text-charcoal">No Orders Selected</h2>
        <p className="text-sm text-taupe">Please select one or more orders from the Orders page to print invoices.</p>
        <Link
          href="/admin/orders"
          className="inline-block px-4 py-2 bg-mocha text-ivory rounded text-sm font-medium hover:opacity-90 transition"
        >
          Return to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Header (Hidden during printing) */}
      <div className="bg-ivory border border-cream rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs print:hidden">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-xs font-medium text-mocha hover:underline mb-1"
          >
            ← Back to Orders List
          </Link>
          <h1 className="text-lg font-serif font-bold text-charcoal">
            Batch Invoices ({selectedOrders.length} Order{selectedOrders.length === 1 ? '' : 's'})
          </h1>
          <p className="text-xs text-taupe">
            Orders: {selectedOrders.map((o) => o.orderNumber).join(', ')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            // Note: client print handler will trigger window.print
          }}
          className="print-trigger-btn px-4 py-2 bg-mocha text-ivory text-sm font-medium rounded hover:opacity-90 transition shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-4 0v4H8v-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Print All {selectedOrders.length} Invoices
        </button>
      </div>

      {/* Batch Invoices List with Page Breaks for Print */}
      <div className="space-y-12 print:space-y-0">
        {selectedOrders.map((order, idx) => (
          <div
            key={order.id}
            className="batch-invoice-card pb-8 border-b border-cream print:border-none print:pb-0"
            style={{ pageBreakAfter: idx < selectedOrders.length - 1 ? 'always' : 'auto', breakAfter: idx < selectedOrders.length - 1 ? 'page' : 'auto' }}
          >
            <InvoiceView order={order} settings={settings} showPrintButton={false} />
          </div>
        ))}
      </div>

      {/* Client-side script injection for print button */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelectorAll('.print-trigger-btn').forEach(function(btn) {
              btn.addEventListener('click', function() {
                window.print();
              });
            });
          `
        }}
      />
    </div>
  )
}
