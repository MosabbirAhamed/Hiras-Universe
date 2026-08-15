import React from 'react'
import Link from 'next/link'
import { getOrders, getProducts } from '../../src/lib/repositories/fileRepo'
import {
  calculateDashboardMetrics,
  calculateRevenueSummary,
  getLowStockAlerts,
  calculateProductPerformance,
  calculateCustomerInsights
} from '../../src/lib/analytics'
import type { OrderStatus, PaymentStatus } from '../../src/types/models'

export const metadata = {
  title: 'Admin Dashboard - Analytics & Store Overview | Hira\'s Universe'
}

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

export default async function AdminDashboardPage() {
  const [orders, products] = await Promise.all([getOrders(), getProducts()])

  const metrics = calculateDashboardMetrics(orders, products)
  const revenueSummary = calculateRevenueSummary(orders)
  const lowStockAlerts = getLowStockAlerts(products)
  const performance = calculateProductPerformance(orders)
  const customerInsights = calculateCustomerInsights(orders)
  const recentOrders = orders.slice(0, 6)

  // Status breakdown percentages
  const activeOrdersCount = metrics.totalOrders - metrics.cancelledOrders
  const getPct = (val: number) => (metrics.totalOrders > 0 ? Math.round((val / metrics.totalOrders) * 100) : 0)

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-charcoal">Store Operations & Analytics</h1>
          <p className="text-xs text-taupe mt-0.5">
            Real-time business performance, inventory health, revenue summaries, and recent orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="px-3.5 py-1.5 bg-mocha text-ivory text-xs font-medium rounded hover:opacity-90 transition shadow-2xs"
          >
            Manage Orders ({metrics.pendingOrders} Pending)
          </Link>
          <Link
            href="/admin/notifications"
            className="px-3.5 py-1.5 border border-cream bg-white text-charcoal text-xs font-medium rounded hover:bg-cream/40 transition"
          >
            Notification Logs
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-ivory border border-cream rounded-lg p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-taupe uppercase tracking-wider">Total Revenue</div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-charcoal">
            {formatPrice(metrics.totalRevenue)}
          </div>
          <div className="text-2xs text-taupe pt-1">
            Excludes {metrics.cancelledOrders} cancelled order{metrics.cancelledOrders === 1 ? '' : 's'}
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-ivory border border-cream rounded-lg p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-taupe uppercase tracking-wider">Today&apos;s Revenue</div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-mocha">
            {formatPrice(metrics.todayRevenue)}
          </div>
          <div className="text-2xs text-taupe pt-1">{metrics.todayOrders} order{metrics.todayOrders === 1 ? '' : 's'} received today</div>
        </div>

        {/* Total Orders */}
        <div className="bg-ivory border border-cream rounded-lg p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-taupe uppercase tracking-wider">Total Orders</div>
          <div className="text-xl sm:text-2xl font-bold font-serif text-charcoal">
            {metrics.totalOrders}
          </div>
          <div className="text-2xs text-taupe pt-1">
            {metrics.deliveredOrders} delivered • {activeOrdersCount} net active
          </div>
        </div>

        {/* Catalog & Low Stock */}
        <div className="bg-ivory border border-cream rounded-lg p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-taupe uppercase tracking-wider">Catalog & Stock</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-serif text-charcoal">
              {metrics.totalProducts}
            </span>
            <span className="text-xs text-taupe">products</span>
          </div>
          <div className="text-2xs pt-1">
            {metrics.lowStockCount > 0 ? (
              <span className="text-red-700 font-semibold">⚠️ {metrics.lowStockCount} items low in stock</span>
            ) : (
              <span className="text-emerald-700 font-medium">✓ All stock levels healthy</span>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Windows & Order Status Lifecycle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Analytics Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-ivory border border-cream rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-cream pb-3">
            <h2 className="font-serif text-base font-semibold text-charcoal">Revenue Periods</h2>
            <span className="text-2xs uppercase text-taupe tracking-wider">Net Sales</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded bg-white border border-cream space-y-1">
              <div className="text-xs text-taupe font-medium">Today</div>
              <div className="text-lg font-bold text-charcoal">{formatPrice(revenueSummary.today)}</div>
            </div>
            <div className="p-3.5 rounded bg-white border border-cream space-y-1">
              <div className="text-xs text-taupe font-medium">Last 7 Days</div>
              <div className="text-lg font-bold text-charcoal">{formatPrice(revenueSummary.last7Days)}</div>
            </div>
            <div className="p-3.5 rounded bg-white border border-cream space-y-1">
              <div className="text-xs text-taupe font-medium">Last 30 Days</div>
              <div className="text-lg font-bold text-charcoal">{formatPrice(revenueSummary.last30Days)}</div>
            </div>
            <div className="p-3.5 rounded bg-white border border-cream space-y-1">
              <div className="text-xs text-taupe font-medium">All Time</div>
              <div className="text-lg font-bold text-mocha">{formatPrice(revenueSummary.allTime)}</div>
            </div>
          </div>
        </div>

        {/* Order Status Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-ivory border border-cream rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-cream pb-3">
            <h2 className="font-serif text-base font-semibold text-charcoal">Order Status Pipeline</h2>
            <span className="text-2xs text-taupe">{metrics.totalOrders} total orders</span>
          </div>

          {/* Pipeline progress bar */}
          {metrics.totalOrders > 0 ? (
            <div className="space-y-3 text-xs">
              <div className="w-full h-3 bg-cream rounded-full overflow-hidden flex">
                <div style={{ width: `${getPct(metrics.pendingOrders)}%` }} className="bg-amber-400" title={`Pending: ${metrics.pendingOrders}`} />
                <div style={{ width: `${getPct(metrics.processingOrders)}%` }} className="bg-blue-400" title={`Processing: ${metrics.processingOrders}`} />
                <div style={{ width: `${getPct(metrics.shippedOrders)}%` }} className="bg-indigo-400" title={`Shipped: ${metrics.shippedOrders}`} />
                <div style={{ width: `${getPct(metrics.deliveredOrders)}%` }} className="bg-emerald-500" title={`Delivered: ${metrics.deliveredOrders}`} />
                <div style={{ width: `${getPct(metrics.cancelledOrders)}%` }} className="bg-red-400" title={`Cancelled: ${metrics.cancelledOrders}`} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="flex items-center justify-between p-2 rounded bg-white border border-cream">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Pending:
                  </span>
                  <span className="font-bold text-charcoal">{metrics.pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white border border-cream">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    Processing:
                  </span>
                  <span className="font-bold text-charcoal">{metrics.processingOrders}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white border border-cream">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    Shipped:
                  </span>
                  <span className="font-bold text-charcoal">{metrics.shippedOrders}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white border border-cream">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Delivered:
                  </span>
                  <span className="font-bold text-charcoal">{metrics.deliveredOrders}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-white border border-cream">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    Cancelled:
                  </span>
                  <span className="font-bold text-charcoal">{metrics.cancelledOrders}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-taupe p-4 text-center">No orders have been recorded yet.</div>
          )}
        </div>
      </div>

      {/* Low Stock Alerts Banner (if items require restock) */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-amber-900 flex items-center gap-2">
              <span>⚠️ Actionable Low Stock Alerts ({lowStockAlerts.length})</span>
            </h2>
            <Link href="/admin/products" className="text-xs font-semibold text-amber-900 hover:underline">
              View Product Inventory →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockAlerts.slice(0, 6).map((item) => (
              <div key={item.id} className="p-3 bg-white rounded border border-amber-200 text-xs space-y-1">
                <div className="font-semibold text-charcoal truncate">{item.name}</div>
                <div className="flex justify-between text-taupe">
                  <span>SKU: {item.sku}</span>
                  <span className="font-bold text-red-700">Stock: {item.stock} (Threshold: {item.threshold})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-ivory border border-cream rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-cream pb-3">
          <div>
            <h2 className="font-serif text-base font-semibold text-charcoal">Recent Customer Orders</h2>
            <p className="text-xs text-taupe">Latest transactions and fulfillment statuses</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-semibold text-mocha hover:underline">
            View All Orders ({orders.length}) →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-xs text-taupe p-6 text-center">No orders have been placed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal">
              <thead className="bg-cream/50 uppercase font-semibold text-taupe tracking-wider border-b border-cream">
                <tr>
                  <th className="px-3.5 py-2.5">Order #</th>
                  <th className="px-3.5 py-2.5">Date</th>
                  <th className="px-3.5 py-2.5">Customer</th>
                  <th className="px-3.5 py-2.5">Phone</th>
                  <th className="px-3.5 py-2.5 text-right">Total</th>
                  <th className="px-3.5 py-2.5">Payment</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/20 transition">
                    <td className="px-3.5 py-3 font-semibold text-mocha whitespace-nowrap">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-3.5 py-3 text-taupe whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-3.5 py-3 font-medium text-charcoal">{order.customer.fullName}</td>
                    <td className="px-3.5 py-3 text-taupe font-mono text-2xs">{order.customer.phone}</td>
                    <td className="px-3.5 py-3 text-right font-semibold whitespace-nowrap">{formatPrice(order.total)}</td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded border uppercase text-2xs font-semibold ${getPaymentStatusBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full border uppercase text-2xs font-semibold ${getOrderStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="px-2.5 py-1 bg-mocha text-ivory rounded text-2xs font-medium hover:opacity-90 transition"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Performance & Customer Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Products & Variants (7 cols) */}
        <div className="lg:col-span-7 bg-ivory border border-cream rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-cream pb-3">
            <div>
              <h2 className="font-serif text-base font-semibold text-charcoal">Top-Selling Products</h2>
              <p className="text-xs text-taupe">Ranked by units sold (from non-cancelled order snapshots)</p>
            </div>
            <span className="text-2xs text-taupe uppercase tracking-wider">Historical Snapshots</span>
          </div>

          {performance.products.length === 0 ? (
            <div className="text-xs text-taupe p-4 text-center">No sales recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream/40 uppercase font-semibold text-taupe border-b border-cream">
                  <tr>
                    <th className="px-3 py-2">Rank</th>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-3 py-2 text-center">Units Sold</th>
                    <th className="px-3 py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream">
                  {performance.products.slice(0, 5).map((p, idx) => (
                    <tr key={p.productId} className="hover:bg-cream/15">
                      <td className="px-3 py-2.5 font-bold text-taupe">#{idx + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-charcoal">{p.productName}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-mocha">{p.unitsSold}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{formatPrice(p.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Variant Performance breakdown if available */}
          {performance.variants.length > 0 && (
            <div className="pt-3 border-t border-cream space-y-2">
              <div className="text-xs font-semibold text-charcoal uppercase tracking-wider">Top Selling Variants</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {performance.variants.slice(0, 4).map((v, i) => (
                  <div key={i} className="p-2.5 rounded bg-white border border-cream text-2xs space-y-0.5">
                    <div className="font-semibold text-charcoal truncate">{v.productName}</div>
                    <div className="text-taupe">
                      SKU: <span className="font-mono">{v.variantSku}</span>
                      {v.attributes && (
                        <span> • {Object.entries(v.attributes).map(([k, val]) => `${k}:${val}`).join(', ')}</span>
                      )}
                    </div>
                    <div className="flex justify-between font-semibold text-charcoal pt-1">
                      <span>Sold: {v.unitsSold} pcs</span>
                      <span className="text-mocha">{formatPrice(v.totalRevenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Insights (5 cols) */}
        <div className="lg:col-span-5 bg-ivory border border-cream rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-cream pb-3">
            <div>
              <h2 className="font-serif text-base font-semibold text-charcoal">Customer Insights</h2>
              <p className="text-xs text-taupe">Aggregated from verified phone numbers</p>
            </div>
            <span className="text-2xs text-taupe uppercase tracking-wider">Admin Only</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-white border border-cream space-y-1">
              <div className="text-2xs uppercase text-taupe font-semibold">Unique Customers</div>
              <div className="text-xl font-bold font-serif text-charcoal">{customerInsights.uniqueCustomers}</div>
            </div>
            <div className="p-3 rounded bg-white border border-cream space-y-1">
              <div className="text-2xs uppercase text-taupe font-semibold">Repeat Customers</div>
              <div className="text-xl font-bold font-serif text-mocha">
                {customerInsights.repeatCustomers}{' '}
                <span className="text-xs font-normal text-taupe">({customerInsights.repeatCustomerRate}%)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-charcoal uppercase tracking-wider">Top Spenders</div>
            {customerInsights.topCustomers.length === 0 ? (
              <div className="text-xs text-taupe">No customer records available.</div>
            ) : (
              <div className="divide-y divide-cream/60 border border-cream rounded bg-white overflow-hidden text-xs">
                {customerInsights.topCustomers.slice(0, 4).map((c, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-charcoal">{c.name}</div>
                      <div className="text-2xs text-taupe font-mono">{c.phone} • {c.orderCount} order{c.orderCount === 1 ? '' : 's'}</div>
                    </div>
                    <div className="text-right font-bold text-mocha text-xs whitespace-nowrap">
                      {formatPrice(c.totalSpent)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
