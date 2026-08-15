import React from 'react'
import { getOrders } from '../../../src/lib/repositories/fileRepo'
import { calculateCustomerInsights } from '../../../src/lib/analytics'
import CustomersClient from './CustomersClient'

export const metadata = {
  title: 'Customer Insights - Admin | Hira\'s Universe'
}

export default async function AdminCustomersPage() {
  const orders = await getOrders()
  const insights = calculateCustomerInsights(orders)

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream pb-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-charcoal">Customer Insights</h1>
          <p className="text-xs text-taupe mt-0.5">
            Derived analytics from customer orders and verified phone numbers (admin only).
          </p>
        </div>
      </div>

      <CustomersClient initialInsights={insights} />
    </div>
  )
}
