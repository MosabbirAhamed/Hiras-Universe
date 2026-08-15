"use client"

import React, { useMemo, useState } from 'react'
import type { CustomerInsightsSummary } from '../../../src/lib/analytics'

function formatPrice(val: number) {
  return `Tk ${val.toLocaleString('en-US')}`
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export default function CustomersClient({ initialInsights }: { initialInsights: CustomerInsightsSummary }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return initialInsights.topCustomers.filter((c) => {
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      )
    })
  }, [initialInsights.topCustomers, query])

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-ivory border border-cream rounded-lg p-5 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-taupe uppercase tracking-wider">Unique Customers</div>
          <div className="text-2xl font-bold font-serif text-charcoal">{initialInsights.uniqueCustomers}</div>
          <div className="text-2xs text-taupe">Identified by unique phone number</div>
        </div>

        <div className="bg-ivory border border-cream rounded-lg p-5 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-taupe uppercase tracking-wider">Repeat Customers</div>
          <div className="text-2xl font-bold font-serif text-mocha">{initialInsights.repeatCustomers}</div>
          <div className="text-2xs text-taupe">Placed 2 or more orders</div>
        </div>

        <div className="bg-ivory border border-cream rounded-lg p-5 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-taupe uppercase tracking-wider">Repeat Rate</div>
          <div className="text-2xl font-bold font-serif text-charcoal">{initialInsights.repeatCustomerRate}%</div>
          <div className="text-2xs text-taupe">Percentage of returning buyers</div>
        </div>
      </div>

      {/* Customer List Card */}
      <div className="bg-ivory border border-cream rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream pb-3">
          <h2 className="font-serif text-base font-semibold text-charcoal">Customer Directory & Spend</h2>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="rounded border border-cream bg-white px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-mocha w-full sm:w-64"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-xs text-taupe p-8 text-center">
            {initialInsights.topCustomers.length === 0
              ? 'No customer orders have been recorded yet.'
              : 'No customers match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal">
              <thead className="bg-cream/50 uppercase font-semibold text-taupe tracking-wider border-b border-cream">
                <tr>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Phone Number</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3 text-center">Total Orders</th>
                  <th className="px-4 py-3 text-right">Total Net Spend</th>
                  <th className="px-4 py-3 text-right">Last Order Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {filtered.map((customer, idx) => (
                  <tr key={idx} className="hover:bg-cream/20 transition">
                    <td className="px-4 py-3.5 font-medium text-charcoal">{customer.name}</td>
                    <td className="px-4 py-3.5 font-mono text-2xs text-taupe">{customer.phone}</td>
                    <td className="px-4 py-3.5 text-taupe">{customer.email || '—'}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold ${customer.orderCount > 1 ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'}`}>
                        {customer.orderCount}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-mocha whitespace-nowrap">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-taupe whitespace-nowrap">
                      {formatDate(customer.lastOrderDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
