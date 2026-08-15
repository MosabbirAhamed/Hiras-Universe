import React from 'react'
import OrderList from './OrderList'
import { getOrders } from '../../../src/lib/repositories/fileRepo'

export const metadata = {
  title: 'Orders Management - Admin | Hira\'s Universe'
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream pb-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-charcoal">Customer Orders</h1>
          <p className="text-xs text-taupe mt-0.5">
            Monitor incoming orders, track delivery lifecycle, and update payment statuses.
          </p>
        </div>
      </div>

      <OrderList items={orders} />
    </div>
  )
}
