import { Order, Product, NotificationLogEntry } from '../types/models'

export interface DashboardMetrics {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
  totalProducts: number
  lowStockCount: number
}

export interface RevenueSummary {
  today: number
  last7Days: number
  last30Days: number
  allTime: number
}

export interface LowStockItem {
  id: string
  productId: string
  name: string
  sku: string
  type: 'simple' | 'variant'
  attributes?: Record<string, string>
  stock: number
  threshold: number
}

export interface BestSellingProduct {
  productId: string
  productName: string
  unitsSold: number
  totalRevenue: number
}

export interface BestSellingVariant {
  productId: string
  variantId?: string
  variantSku: string
  productName: string
  attributes?: Record<string, string>
  unitsSold: number
  totalRevenue: number
}

export interface CustomerInsight {
  phone: string
  name: string
  email?: string
  orderCount: number
  totalSpent: number
  lastOrderDate: string
}

export interface CustomerInsightsSummary {
  uniqueCustomers: number
  repeatCustomers: number
  repeatCustomerRate: number
  topCustomers: CustomerInsight[]
}

/**
 * Check if a date string is on the same calendar day as the given reference date (UTC or local)
 */
export function isSameDay(dateStr: string, refDate = new Date()): boolean {
  try {
    const d = new Date(dateStr)
    return (
      d.getFullYear() === refDate.getFullYear() &&
      d.getMonth() === refDate.getMonth() &&
      d.getDate() === refDate.getDate()
    )
  } catch {
    return false
  }
}

/**
 * Calculate high-level admin dashboard KPIs.
 * Cancelled orders are strictly excluded from revenue metrics.
 */
export function calculateDashboardMetrics(orders: Order[], products: Product[], now = new Date()): DashboardMetrics {
  let pendingOrders = 0
  let processingOrders = 0
  let shippedOrders = 0
  let deliveredOrders = 0
  let cancelledOrders = 0
  let totalRevenue = 0
  let todayOrders = 0
  let todayRevenue = 0

  for (const order of orders) {
    const isCancelled = order.orderStatus === 'cancelled'
    const isToday = isSameDay(order.createdAt, now)

    switch (order.orderStatus) {
      case 'pending':
        pendingOrders++
        break
      case 'processing':
        processingOrders++
        break
      case 'shipped':
        shippedOrders++
        break
      case 'delivered':
        deliveredOrders++
        break
      case 'cancelled':
        cancelledOrders++
        break
    }

    if (isToday) {
      todayOrders++
      if (!isCancelled) {
        todayRevenue += order.total || 0
      }
    }

    if (!isCancelled) {
      totalRevenue += order.total || 0
    }
  }

  const lowStockAlerts = getLowStockAlerts(products)

  return {
    totalOrders: orders.length,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    todayOrders,
    todayRevenue,
    totalProducts: products.length,
    lowStockCount: lowStockAlerts.length
  }
}

/**
 * Calculate rolling revenue windows (Today, Last 7 Days, Last 30 Days, All Time).
 * Excludes cancelled orders.
 */
export function calculateRevenueSummary(orders: Order[], now = new Date()): RevenueSummary {
  const nowMs = now.getTime()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

  let today = 0
  let last7Days = 0
  let last30Days = 0
  let allTime = 0

  for (const order of orders) {
    if (order.orderStatus === 'cancelled') continue

    const orderTotal = order.total || 0
    allTime += orderTotal

    const orderDate = new Date(order.createdAt)
    const orderMs = orderDate.getTime()

    if (isSameDay(order.createdAt, now)) {
      today += orderTotal
    }

    if (nowMs - orderMs <= sevenDaysMs && orderMs <= nowMs) {
      last7Days += orderTotal
    }

    if (nowMs - orderMs <= thirtyDaysMs && orderMs <= nowMs) {
      last30Days += orderTotal
    }
  }

  return {
    today,
    last7Days,
    last30Days,
    allTime
  }
}

/**
 * Detect simple products and variants with stock <= threshold.
 * Only evaluates active products and active variants.
 */
export function getLowStockAlerts(products: Product[]): LowStockItem[] {
  const alerts: LowStockItem[] = []

  for (const product of products) {
    if (product.active === false || product.visibility === 'hidden') {
      continue
    }

    if (product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.active === false) continue

        const stock = typeof variant.stock === 'number' ? variant.stock : 0
        const threshold = typeof variant.lowStockThreshold === 'number' ? variant.lowStockThreshold : 5

        if (stock <= threshold) {
          alerts.push({
            id: variant.id,
            productId: product.id,
            name: `${product.name} (${Object.values(variant.attributes || {}).join('/')})`,
            sku: variant.sku || product.sku || '—',
            type: 'variant',
            attributes: variant.attributes,
            stock,
            threshold
          })
        }
      }
    } else {
      const stock = typeof product.stock === 'number' ? product.stock : 0
      const threshold = typeof product.lowStockThreshold === 'number' ? product.lowStockThreshold : 5

      if (stock <= threshold) {
        alerts.push({
          id: product.id,
          productId: product.id,
          name: product.name,
          sku: product.sku || '—',
          type: 'simple',
          stock,
          threshold
        })
      }
    }
  }

  return alerts
}

/**
 * Calculate best-selling products and variants from immutable OrderItemSnapshots.
 * Excludes cancelled orders.
 */
export function calculateProductPerformance(orders: Order[]): {
  products: BestSellingProduct[]
  variants: BestSellingVariant[]
} {
  const productMap = new Map<string, BestSellingProduct>()
  const variantMap = new Map<string, BestSellingVariant>()

  for (const order of orders) {
    if (order.orderStatus === 'cancelled') continue

    for (const item of order.items) {
      // 1. Product level aggregation
      const pKey = item.productId
      const existingP = productMap.get(pKey)
      if (existingP) {
        existingP.unitsSold += item.quantity
        existingP.totalRevenue += item.lineTotal
      } else {
        productMap.set(pKey, {
          productId: item.productId,
          productName: item.productName,
          unitsSold: item.quantity,
          totalRevenue: item.lineTotal
        })
      }

      // 2. Variant level aggregation (if variant exists)
      const vKey = item.variantId || item.variantSku || (item.selectedAttributes ? `${item.productId}-${JSON.stringify(item.selectedAttributes)}` : null)
      if (vKey) {
        const existingV = variantMap.get(vKey)
        if (existingV) {
          existingV.unitsSold += item.quantity
          existingV.totalRevenue += item.lineTotal
        } else {
          variantMap.set(vKey, {
            productId: item.productId,
            variantId: item.variantId,
            variantSku: item.variantSku || item.productSku || '—',
            productName: item.productName,
            attributes: item.selectedAttributes,
            unitsSold: item.quantity,
            totalRevenue: item.lineTotal
          })
        }
      }
    }
  }

  const products = Array.from(productMap.values()).sort((a, b) => b.unitsSold - a.unitsSold)
  const variants = Array.from(variantMap.values()).sort((a, b) => b.unitsSold - a.unitsSold)

  return { products, variants }
}

/**
 * Derive customer insights from orders grouped by customer phone number.
 */
export function calculateCustomerInsights(orders: Order[]): CustomerInsightsSummary {
  const customerMap = new Map<string, CustomerInsight>()

  for (const order of orders) {
    const rawPhone = order.customer.phone?.trim()
    if (!rawPhone) continue

    const existing = customerMap.get(rawPhone)
    const orderTotal = order.orderStatus !== 'cancelled' ? (order.total || 0) : 0

    if (existing) {
      existing.orderCount++
      existing.totalSpent += orderTotal
      if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.createdAt
        existing.name = order.customer.fullName || existing.name
        if (order.customer.email) existing.email = order.customer.email
      }
    } else {
      customerMap.set(rawPhone, {
        phone: rawPhone,
        name: order.customer.fullName,
        email: order.customer.email,
        orderCount: 1,
        totalSpent: orderTotal,
        lastOrderDate: order.createdAt
      })
    }
  }

  const allCustomers = Array.from(customerMap.values())
  const uniqueCustomers = allCustomers.length
  const repeatCustomers = allCustomers.filter((c) => c.orderCount > 1).length
  const repeatCustomerRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0

  const topCustomers = allCustomers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10)

  return {
    uniqueCustomers,
    repeatCustomers,
    repeatCustomerRate: Math.round(repeatCustomerRate * 10) / 10,
    topCustomers
  }
}

/**
 * In-memory filter for notification logs
 */
export function filterNotificationLogs(
  logs: NotificationLogEntry[],
  filters: { event?: string; channel?: string; status?: string; orderNumber?: string }
): NotificationLogEntry[] {
  return logs.filter((log) => {
    if (filters.event && filters.event !== 'all' && log.event !== filters.event) {
      return false
    }
    if (filters.channel && filters.channel !== 'all' && log.channel !== filters.channel) {
      return false
    }
    if (filters.status && filters.status !== 'all' && log.status !== filters.status) {
      return false
    }
    if (filters.orderNumber && filters.orderNumber.trim()) {
      const q = filters.orderNumber.trim().toUpperCase()
      if (!log.orderNumber.toUpperCase().includes(q)) {
        return false
      }
    }
    return true
  })
}
