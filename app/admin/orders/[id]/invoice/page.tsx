import React from 'react'
import Link from 'next/link'
import { getOrderById, getSettings } from '../../../../../src/lib/repositories/fileRepo'
import InvoiceView from '../../../../../src/components/invoice/InvoiceView'

export const metadata = {
  title: 'Print Invoice - Admin | Hira\'s Universe'
}

export default async function AdminOrderInvoicePage({ params }: { params: { id: string } }) {
  const [order, settings] = await Promise.all([
    getOrderById(params.id),
    getSettings()
  ])

  if (!order) {
    return (
      <div className="rounded-lg border border-cream bg-ivory p-8 text-center space-y-4 max-w-lg mx-auto mt-10">
        <h2 className="text-xl font-serif font-bold text-charcoal">Order Not Found</h2>
        <p className="text-sm text-taupe">The requested order cannot be found for invoicing.</p>
        <Link
          href="/admin/orders"
          className="inline-block px-4 py-2 bg-mocha text-ivory rounded text-sm font-medium hover:opacity-90 transition"
        >
          Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden flex items-center justify-between">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center text-xs font-medium text-mocha hover:underline"
        >
          ← Back to Order Details
        </Link>
      </div>

      <InvoiceView order={order} settings={settings} />
    </div>
  )
}
