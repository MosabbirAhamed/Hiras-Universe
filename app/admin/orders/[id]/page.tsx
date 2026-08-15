import React from 'react'
import Link from 'next/link'
import OrderDetailClient from './OrderDetailClient'
import { getOrderById } from '../../../../src/lib/repositories/fileRepo'

export const metadata = {
  title: 'Order Details - Admin | Hira\'s Universe'
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id)

  if (!order) {
    return (
      <div className="rounded-lg border border-cream bg-ivory p-8 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-charcoal">Order Not Found</h2>
        <p className="text-sm text-taupe">The requested order ID does not exist or has been removed.</p>
        <Link
          href="/admin/orders"
          className="inline-block px-4 py-2 bg-mocha text-ivory rounded text-sm font-medium hover:opacity-90 transition"
        >
          Return to Orders List
        </Link>
      </div>
    )
  }

  return <OrderDetailClient initialOrder={order} />
}
