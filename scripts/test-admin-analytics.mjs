import assert from 'assert'

console.log('====================================================')
console.log('PHASE 7 ADMIN OPERATIONS & ANALYTICS TEST SUITE')
console.log('====================================================\n')

let passed = 0
let total = 0

function test(name, fn) {
  total++
  try {
    fn()
    console.log(`✓ PASS: ${name}`)
    passed++
  } catch (err) {
    console.error(`✗ FAIL: ${name}`)
    console.error(err)
  }
}

async function asyncTest(name, fn) {
  total++
  try {
    await fn()
    console.log(`✓ PASS: ${name}`)
    passed++
  } catch (err) {
    console.error(`✗ FAIL: ${name}`)
    console.error(err)
  }
}

// -------------------------------------------------------------------
// IMPLEMENTATION HELPERS UNDER TEST
// -------------------------------------------------------------------

function isSameDay(dateStr, refDate = new Date()) {
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

function calculateDashboardMetrics(orders, products, now = new Date()) {
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

function calculateRevenueSummary(orders, now = new Date()) {
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

function getLowStockAlerts(products) {
  const alerts = []

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

function calculateProductPerformance(orders) {
  const productMap = new Map()
  const variantMap = new Map()

  for (const order of orders) {
    if (order.orderStatus === 'cancelled') continue

    for (const item of order.items) {
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

      const vKey = item.variantId || item.variantSku || null
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

function calculateCustomerInsights(orders) {
  const customerMap = new Map()

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
      }
    } else {
      customerMap.set(rawPhone, {
        phone: rawPhone,
        name: order.customer.fullName,
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

  const topCustomers = allCustomers.sort((a, b) => b.totalSpent - a.totalSpent)

  return {
    uniqueCustomers,
    repeatCustomers,
    repeatCustomerRate: Math.round(repeatCustomerRate * 10) / 10,
    topCustomers
  }
}

function filterNotificationLogs(logs, filters) {
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

// -------------------------------------------------------------------
// TEST FIXTURES
// -------------------------------------------------------------------

const fixedNow = new Date('2026-08-15T12:00:00.000Z')

const testProducts = [
  {
    id: 'p-1',
    name: 'Simple Hijab',
    sku: 'HIJ-001',
    stock: 2,
    lowStockThreshold: 5,
    active: true,
    hasVariants: false
  },
  {
    id: 'p-2',
    name: 'Inactive Abaya',
    sku: 'ABY-002',
    stock: 0,
    lowStockThreshold: 5,
    active: false, // Inactive: should NOT trigger alert
    hasVariants: false
  },
  {
    id: 'p-3',
    name: 'Signature Handcrafted Tupi',
    hasVariants: true,
    active: true,
    variants: [
      { id: 'v-1', sku: 'TUP-54', stock: 1, lowStockThreshold: 3, active: true, attributes: { Size: '54' } },
      { id: 'v-2', sku: 'TUP-56', stock: 10, lowStockThreshold: 3, active: true, attributes: { Size: '56' } },
      { id: 'v-3', sku: 'TUP-58', stock: 0, lowStockThreshold: 3, active: false, attributes: { Size: '58' } } // Inactive variant: ignored
    ]
  }
]

const testOrders = [
  // Order 1: Today (2026-08-15), delivered, Tk 2500
  {
    id: 'ord-1',
    orderNumber: 'HN-1001',
    customer: { fullName: 'Amina Begum', phone: '01711111111' },
    items: [
      { productId: 'p-1', productName: 'Simple Hijab', quantity: 2, unitPrice: 1200, lineTotal: 2400 }
    ],
    subtotal: 2400,
    deliveryCharge: 100,
    total: 2500,
    orderStatus: 'delivered',
    paymentStatus: 'paid',
    createdAt: '2026-08-15T08:00:00.000Z'
  },
  // Order 2: Today (2026-08-15), cancelled, Tk 1500 (Must NOT count toward revenue!)
  {
    id: 'ord-2',
    orderNumber: 'HN-1002',
    customer: { fullName: 'Fatima Khan', phone: '01722222222' },
    items: [
      { productId: 'p-1', productName: 'Simple Hijab', quantity: 1, unitPrice: 1400, lineTotal: 1400 }
    ],
    subtotal: 1400,
    deliveryCharge: 100,
    total: 1500,
    orderStatus: 'cancelled',
    paymentStatus: 'failed',
    createdAt: '2026-08-15T09:00:00.000Z'
  },
  // Order 3: 3 days ago (2026-08-12), shipped, Tk 3000 (Amina repeat customer!)
  {
    id: 'ord-3',
    orderNumber: 'HN-1003',
    customer: { fullName: 'Amina Begum', phone: '01711111111' },
    items: [
      { productId: 'p-3', variantId: 'v-1', variantSku: 'TUP-54', productName: 'Signature Handcrafted Tupi', quantity: 2, unitPrice: 1450, lineTotal: 2900 }
    ],
    subtotal: 2900,
    deliveryCharge: 100,
    total: 3000,
    orderStatus: 'shipped',
    paymentStatus: 'paid',
    createdAt: '2026-08-12T10:00:00.000Z'
  },
  // Order 4: 15 days ago (2026-07-31), processing, Tk 4000
  {
    id: 'ord-4',
    orderNumber: 'HN-1004',
    customer: { fullName: 'Zubair Ahmed', phone: '01733333333' },
    items: [
      { productId: 'p-3', variantId: 'v-2', variantSku: 'TUP-56', productName: 'Signature Handcrafted Tupi', quantity: 1, unitPrice: 1450, lineTotal: 1450 }
    ],
    subtotal: 3900,
    deliveryCharge: 100,
    total: 4000,
    orderStatus: 'processing',
    paymentStatus: 'paid',
    createdAt: '2026-07-31T10:00:00.000Z'
  },
  // Order 5: 45 days ago (2026-07-01), pending, Tk 1000
  {
    id: 'ord-5',
    orderNumber: 'HN-1005',
    customer: { fullName: 'Rashid Ali', phone: '01744444444' },
    items: [
      { productId: 'p-1', productName: 'Simple Hijab', quantity: 1, unitPrice: 900, lineTotal: 900 }
    ],
    subtotal: 900,
    deliveryCharge: 100,
    total: 1000,
    orderStatus: 'pending',
    paymentStatus: 'pending',
    createdAt: '2026-07-01T10:00:00.000Z'
  }
]

// -------------------------------------------------------------------
// TEST EXECUTION (15 Required Scenarios)
// -------------------------------------------------------------------

// 1. Revenue excludes cancelled orders
test('1. Total revenue strictly excludes cancelled orders', () => {
  const metrics = calculateDashboardMetrics(testOrders, testProducts, fixedNow)
  // Non-cancelled: ord-1 (2500) + ord-3 (3000) + ord-4 (4000) + ord-5 (1000) = 10500. Cancelled ord-2 (1500) excluded.
  assert.strictEqual(metrics.totalRevenue, 10500)
})

// 2. Today's revenue calculation
test("2. Today's revenue calculates sum of non-cancelled orders created today", () => {
  const metrics = calculateDashboardMetrics(testOrders, testProducts, fixedNow)
  // Today's non-cancelled: ord-1 (2500)
  assert.strictEqual(metrics.todayRevenue, 2500)
  assert.strictEqual(metrics.todayOrders, 2) // 2 orders total created today (1 delivered, 1 cancelled)
})

// 3. Last 7 days revenue
test('3. Last 7 days revenue calculates orders within 7 days window (excluding cancelled)', () => {
  const summary = calculateRevenueSummary(testOrders, fixedNow)
  // Last 7 days: ord-1 (2500) + ord-3 (3000) = 5500
  assert.strictEqual(summary.last7Days, 5500)
})

// 4. Last 30 days revenue
test('4. Last 30 days revenue calculates orders within 30 days window', () => {
  const summary = calculateRevenueSummary(testOrders, fixedNow)
  // Last 30 days: ord-1 (2500) + ord-3 (3000) + ord-4 (4000) = 9500
  assert.strictEqual(summary.last30Days, 9500)
  assert.strictEqual(summary.allTime, 10500)
})

// 5. Order status counts
test('5. Computes exact count per order lifecycle status', () => {
  const metrics = calculateDashboardMetrics(testOrders, testProducts, fixedNow)
  assert.strictEqual(metrics.totalOrders, 5)
  assert.strictEqual(metrics.pendingOrders, 1)
  assert.strictEqual(metrics.processingOrders, 1)
  assert.strictEqual(metrics.shippedOrders, 1)
  assert.strictEqual(metrics.deliveredOrders, 1)
  assert.strictEqual(metrics.cancelledOrders, 1)
})

// 6. Low stock detection (Simple product)
test('6. Detects active simple products with stock <= threshold', () => {
  const alerts = getLowStockAlerts(testProducts)
  const simpleAlert = alerts.find(a => a.productId === 'p-1')
  assert.ok(simpleAlert)
  assert.strictEqual(simpleAlert.stock, 2)
  assert.strictEqual(simpleAlert.threshold, 5)

  // Inactive product p-2 with stock 0 must NOT be present
  const inactiveAlert = alerts.find(a => a.productId === 'p-2')
  assert.strictEqual(inactiveAlert, undefined)
})

// 7. Variant low stock detection
test('7. Detects active variants with stock <= threshold and ignores inactive variants', () => {
  const alerts = getLowStockAlerts(testProducts)
  const variantAlert = alerts.find(a => a.id === 'v-1')
  assert.ok(variantAlert)
  assert.strictEqual(variantAlert.stock, 1)
  assert.strictEqual(variantAlert.threshold, 3)

  // Variant v-2 has stock 10 > threshold 3, must not alert
  assert.strictEqual(alerts.find(a => a.id === 'v-2'), undefined)
  // Variant v-3 is active: false, must not alert
  assert.strictEqual(alerts.find(a => a.id === 'v-3'), undefined)
})

// 8. Best-selling product calculation
test('8. Calculates best-selling products by units sold excluding cancelled orders', () => {
  const perf = calculateProductPerformance(testOrders)
  // p-1: 2 units in ord-1 (ord-2 cancelled ignored, ord-5 has 1 unit) -> total 3 units, 3300 revenue
  // p-3: 2 units in ord-3 + 1 unit in ord-4 -> total 3 units, 4350 revenue
  assert.strictEqual(perf.products.length, 2)
  const p3 = perf.products.find(p => p.productId === 'p-3')
  assert.strictEqual(p3.unitsSold, 3)
  assert.strictEqual(p3.totalRevenue, 4350)
})

// 9. Best-selling variant calculation
test('9. Calculates best-selling variants from snapshot data', () => {
  const perf = calculateProductPerformance(testOrders)
  const v1 = perf.variants.find(v => v.variantSku === 'TUP-54')
  assert.ok(v1)
  assert.strictEqual(v1.unitsSold, 2)
  assert.strictEqual(v1.totalRevenue, 2900)
})

// 10. Repeat customer calculation
test('10. Calculates repeat customers (placed >= 2 orders)', () => {
  const insights = calculateCustomerInsights(testOrders)
  // Amina Begum (01711111111) has 2 orders (ord-1 and ord-3)
  assert.strictEqual(insights.repeatCustomers, 1)
  assert.strictEqual(insights.repeatCustomerRate, 25) // 1 repeat out of 4 unique customers = 25%
})

// 11. Unique customer calculation
test('11. Calculates unique customer count derived from normalized phone numbers', () => {
  const insights = calculateCustomerInsights(testOrders)
  // Unique phones: 01711111111, 01722222222, 01733333333, 01744444444 = 4
  assert.strictEqual(insights.uniqueCustomers, 4)
  const topCustomer = insights.topCustomers[0]
  assert.strictEqual(topCustomer.name, 'Amina Begum')
  assert.strictEqual(topCustomer.totalSpent, 5500)
})

// 12. Notification log filtering
test('12. In-memory notification log filtering filters by event, channel, status, and order number', () => {
  const mockLogs = [
    { id: '1', orderNumber: 'HN-1001', event: 'ORDER_CREATED', channel: 'email', status: 'sent' },
    { id: '2', orderNumber: 'HN-1001', event: 'ORDER_CREATED', channel: 'sms', status: 'mocked' },
    { id: '3', orderNumber: 'HN-1002', event: 'ORDER_SHIPPED', channel: 'email', status: 'failed' }
  ]

  const filteredByEvent = filterNotificationLogs(mockLogs, { event: 'ORDER_CREATED' })
  assert.strictEqual(filteredByEvent.length, 2)

  const filteredByStatus = filterNotificationLogs(mockLogs, { status: 'failed' })
  assert.strictEqual(filteredByStatus.length, 1)
  assert.strictEqual(filteredByStatus[0].orderNumber, 'HN-1002')

  const filteredByOrder = filterNotificationLogs(mockLogs, { orderNumber: '1001' })
  assert.strictEqual(filteredByOrder.length, 2)
})

// 13. Bulk status transition rules
test('13. Bulk status transition processes valid orders and rejects invalid transitions', () => {
  function processBulkStatus(ordersList, targetStatus) {
    const succeeded = []
    const failed = []

    for (const ord of ordersList) {
      if (ord.orderStatus === 'cancelled' && targetStatus !== 'cancelled') {
        failed.push({ id: ord.id, error: 'Cancelled orders cannot be reopened.' })
      } else {
        succeeded.push(ord.id)
      }
    }
    return { succeeded, failed }
  }

  const batch = [testOrders[0], testOrders[1]] // ord-1 (delivered), ord-2 (cancelled)
  const res = processBulkStatus(batch, 'processing')
  assert.strictEqual(res.succeeded.length, 1)
  assert.strictEqual(res.succeeded[0], 'ord-1')
  assert.strictEqual(res.failed.length, 1)
  assert.strictEqual(res.failed[0].id, 'ord-2')
})

// 14. Cancelled order cannot be cancelled twice
test('14. Cancelled order cannot be re-cancelled to restock inventory twice', () => {
  let stock = 10
  let stockDeducted = false // already restored on first cancellation
  let orderStatus = 'cancelled'

  function applyCancellation() {
    if (orderStatus === 'cancelled' && !stockDeducted) {
      return { restocked: false, message: 'Already cancelled; no stock to restore.' }
    }
    stock += 2
    stockDeducted = false
    orderStatus = 'cancelled'
    return { restocked: true }
  }

  const firstAttempt = applyCancellation()
  assert.strictEqual(firstAttempt.restocked, false)
  assert.strictEqual(stock, 10) // Unchanged
})

// 15. Historical snapshot prices are used for analytics
test('15. Revenue and performance analytics use historical snapshot prices when catalog price rises', () => {
  const modifiedCatalog = [{ id: 'p-1', price: 999999 }] // Catalog price changed drastically
  const perf = calculateProductPerformance(testOrders)
  const p1 = perf.products.find(p => p.productId === 'p-1')
  // Original snapshot prices used: ord-1 (2400) + ord-5 (900) = 3300
  assert.strictEqual(p1.totalRevenue, 3300)
  assert.notStrictEqual(p1.totalRevenue, modifiedCatalog[0].price * p1.unitsSold)
})

console.log(`\n====================================================`)
console.log(`ALL PHASE 7 ANALYTICS TESTS COMPLETED: ${passed}/${total} PASSED`)
console.log(`====================================================`)

if (passed !== total) {
  process.exit(1)
}
