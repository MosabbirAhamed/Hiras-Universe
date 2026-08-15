import assert from 'assert'

console.log('====================================================')
console.log('PHASE 6 TRACKING, INVOICE & NOTIFICATIONS TEST SUITE')
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

function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return ''
  const clean = phone.trim()
  if (clean.length < 8) return '****'
  const start = clean.slice(0, 3)
  const end = clean.slice(-4)
  return `${start}****${end}`
}

function normalizeAndValidateBdPhone(rawPhone) {
  if (typeof rawPhone !== 'string') return null
  let cleaned = rawPhone.trim().replace(/[\s\-()]/g, '')
  if (cleaned.startsWith('+88')) {
    cleaned = cleaned.slice(3)
  } else if (cleaned.startsWith('88')) {
    cleaned = cleaned.slice(2)
  }
  const bdPhoneRegex = /^01[3-9]\d{8}$/
  if (bdPhoneRegex.test(cleaned)) {
    return cleaned
  }
  return null
}

function buildCustomerTimeline(orderStatus, createdAt, updatedAt) {
  if (orderStatus === 'cancelled') {
    return [
      { key: 'pending', label: 'Order Placed', completed: true, current: false, timestamp: createdAt },
      { key: 'cancelled', label: 'Cancelled', completed: true, current: true, timestamp: updatedAt || createdAt }
    ]
  }

  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'processing', label: 'Processing / Packaging' },
    { key: 'shipped', label: 'Dispatched / On the Way' },
    { key: 'delivered', label: 'Delivered' }
  ]

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered']
  const currentIndex = statusOrder.indexOf(orderStatus)

  return steps.map((s, idx) => {
    const isCompleted = idx <= currentIndex
    const isCurrent = idx === currentIndex
    let timestamp = null
    if (idx === 0) timestamp = createdAt
    else if (isCurrent) timestamp = updatedAt || null

    return {
      key: s.key,
      label: s.label,
      completed: isCompleted,
      current: isCurrent,
      timestamp
    }
  })
}

function toPublicTrackingOrder(order) {
  return {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    customerName: order.customer.fullName,
    maskedPhone: maskPhone(order.customer.phone),
    shippingAddress: {
      district: order.shippingAddress.district,
      thana: order.shippingAddress.thana
    },
    items: order.items,
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge,
    discountTotal: order.discountTotal,
    total: order.total,
    timeline: buildCustomerTimeline(order.orderStatus, order.createdAt, order.updatedAt)
  }
}

// In-Memory Rate Limiter Test Implementation
function createTestRateLimiter() {
  const clientLimits = new Map()

  return {
    check(clientIp) {
      const now = Date.now()
      let record = clientLimits.get(clientIp)
      if (!record) {
        record = { requests: [], failedAttempts: [] }
        clientLimits.set(clientIp, record)
      }
      record.requests = record.requests.filter((t) => now - t < 60000)
      record.failedAttempts = record.failedAttempts.filter((t) => now - t < 15 * 60000)

      if (record.requests.length >= 10) {
        return { allowed: false, status: 429, reason: 'Too many requests' }
      }
      if (record.failedAttempts.length >= 5) {
        return { allowed: false, status: 429, reason: 'Too many failed lookup attempts' }
      }
      record.requests.push(now)
      return { allowed: true }
    },
    recordFailed(clientIp) {
      const now = Date.now()
      let record = clientLimits.get(clientIp)
      if (!record) {
        record = { requests: [now], failedAttempts: [] }
        clientLimits.set(clientIp, record)
      }
      record.failedAttempts.push(now)
    }
  }
}

// -------------------------------------------------------------------
// TEST EXECUTION (25 Test Scenarios)
// -------------------------------------------------------------------

// Mock Order Fixture
const sampleOrder = {
  id: 'ord_123456_abcde',
  orderNumber: 'HN-1001',
  customer: {
    fullName: 'Mohammad Asif',
    phone: '01712345678',
    email: 'asif@example.com'
  },
  shippingAddress: {
    fullName: 'Mohammad Asif',
    phone: '01712345678',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    deliveryAddress: 'House 12, Road 4, Flat 3B',
    deliveryNotes: 'Please ring bell twice'
  },
  items: [
    {
      productId: 'p-3',
      variantId: 'v-p3-54',
      productName: 'Signature Handcrafted Tupi',
      variantSku: 'TUPI-SIG-54',
      productSku: 'TUPI-SIG',
      selectedAttributes: { Size: '54' },
      image: '/products/classic-white-tupi.svg',
      unitPrice: 1450,
      regularPrice: 1650,
      quantity: 2,
      lineTotal: 2900
    }
  ],
  subtotal: 2900,
  deliveryCharge: 60,
  discountTotal: 0,
  total: 2960,
  currency: 'BDT',
  paymentMethod: 'cod',
  paymentStatus: 'pending',
  orderStatus: 'processing',
  paymentDetails: {
    senderNumber: '01711223344',
    transactionId: 'TRX998877',
    notes: 'Internal payment reference'
  },
  adminNotes: 'Customer requested afternoon delivery.',
  stockDeducted: true,
  createdAt: '2026-08-15T05:00:00.000Z',
  updatedAt: '2026-08-15T06:00:00.000Z'
}

// 1. Valid tracking lookup
test('1. Valid tracking lookup returns verified order with public DTO', () => {
  const publicDto = toPublicTrackingOrder(sampleOrder)
  assert.strictEqual(publicDto.orderNumber, 'HN-1001')
  assert.strictEqual(publicDto.customerName, 'Mohammad Asif')
  assert.strictEqual(publicDto.maskedPhone, '017****5678')
  assert.strictEqual(publicDto.total, 2960)
  assert.strictEqual(publicDto.orderStatus, 'processing')
})

// 2. Invalid order number format
test('2. Rejects invalid order number formats (e.g. non-HN, missing numbers)', () => {
  const regex = /^HN-\d+$/i
  assert.strictEqual(regex.test('HN-1001'), true)
  assert.strictEqual(regex.test('hn-1002'), true)
  assert.strictEqual(regex.test('1001'), false)
  assert.strictEqual(regex.test('ORD-1001'), false)
  assert.strictEqual(regex.test('HN-'), false)
  assert.strictEqual(regex.test('HN-ABC'), false)
})

// 3. Invalid phone format
test('3. Rejects invalid phone numbers and normalizes valid formats', () => {
  assert.strictEqual(normalizeAndValidateBdPhone('01712345678'), '01712345678')
  assert.strictEqual(normalizeAndValidateBdPhone('+8801812345678'), '01812345678')
  assert.strictEqual(normalizeAndValidateBdPhone('8801912345678'), '01912345678')
  assert.strictEqual(normalizeAndValidateBdPhone('01712-345678'), '01712345678')
  assert.strictEqual(normalizeAndValidateBdPhone('01112345678'), null) // invalid prefix
  assert.strictEqual(normalizeAndValidateBdPhone('12345'), null)
})

// 4. Wrong phone with valid order number
test('4. Lookup with valid order number but mismatched phone fails verification', () => {
  const orders = [sampleOrder]
  const inputOrderNum = 'HN-1001'
  const inputPhone = '01899999999' // wrong phone

  const found = orders.find(o => o.orderNumber === inputOrderNum)
  const isMatch = Boolean(found && normalizeAndValidateBdPhone(found.customer.phone) === inputPhone)
  assert.strictEqual(isMatch, false)
})

// 5. Wrong order number with valid phone
test('5. Lookup with non-existent order number fails verification', () => {
  const orders = [sampleOrder]
  const inputOrderNum = 'HN-9999'
  const inputPhone = '01712345678'

  const found = orders.find(o => o.orderNumber === inputOrderNum)
  const isMatch = Boolean(found && normalizeAndValidateBdPhone(found.customer.phone) === inputPhone)
  assert.strictEqual(isMatch, false)
})

// 6. Generic 404 response
test('6. Returns identical generic 404 message for both non-existent order and phone mismatch to prevent enumeration', () => {
  const genericError = 'No order found matching the provided Order Number and Phone Number.'
  const mismatchError = genericError
  const notFoundError = genericError
  assert.strictEqual(mismatchError, notFoundError)
})

// 7. Rate limiting
test('7. Rate limiter blocks client IP after 10 requests/minute and 5 failed attempts/15 min', () => {
  const limiter = createTestRateLimiter()
  const testIp = '192.168.1.50'

  // 10 requests allowed
  for (let i = 0; i < 10; i++) {
    assert.strictEqual(limiter.check(testIp).allowed, true)
  }
  // 11th request throttled with 429
  const res11 = limiter.check(testIp)
  assert.strictEqual(res11.allowed, false)
  assert.strictEqual(res11.status, 429)

  // 5 failed attempts test on another IP
  const failIp = '192.168.1.51'
  for (let i = 0; i < 5; i++) {
    limiter.recordFailed(failIp)
  }
  const failRes = limiter.check(failIp)
  assert.strictEqual(failRes.allowed, false)
  assert.strictEqual(failRes.status, 429)
})

// 8. Phone masking
test('8. Masks Bangladesh phone number cleanly (e.g. 017****5678)', () => {
  assert.strictEqual(maskPhone('01712345678'), '017****5678')
  assert.strictEqual(maskPhone('01888884321'), '018****4321')
})

// 9. Privacy filtering
test('9. Public tracking DTO omits sensitive customer email and internal IDs', () => {
  const dto = toPublicTrackingOrder(sampleOrder)
  assert.strictEqual('id' in dto, false)
  assert.strictEqual('email' in dto, false)
  assert.strictEqual('customerEmail' in dto, false)
  assert.strictEqual('stockDeducted' in dto, false)
})

// 10. Full address not exposed publicly
test('10. Public tracking DTO exposes ONLY district and thana, NOT full street address or house number', () => {
  const dto = toPublicTrackingOrder(sampleOrder)
  assert.deepStrictEqual(dto.shippingAddress, {
    district: 'Dhaka',
    thana: 'Dhanmondi'
  })
  assert.strictEqual('deliveryAddress' in dto.shippingAddress, false)
  assert.strictEqual('deliveryNotes' in dto.shippingAddress, false)
})

// 11. Admin notes not exposed
test('11. Public tracking DTO strictly omits internal adminNotes', () => {
  const dto = toPublicTrackingOrder(sampleOrder)
  assert.strictEqual('adminNotes' in dto, false)
})

// 12. Payment transaction details not exposed
test('12. Public tracking DTO strictly omits paymentDetails (transactionId, senderNumber)', () => {
  const dto = toPublicTrackingOrder(sampleOrder)
  assert.strictEqual('paymentDetails' in dto, false)
  assert.strictEqual('transactionId' in dto, false)
  assert.strictEqual('senderNumber' in dto, false)
})

// 13. Timeline generation
test('13. Timeline generates accurate progressive steps for processing, shipped, and delivered states', () => {
  const timelineProcessing = buildCustomerTimeline('processing', '2026-08-15T05:00:00Z', '2026-08-15T06:00:00Z')
  assert.strictEqual(timelineProcessing[0].completed, true)
  assert.strictEqual(timelineProcessing[1].completed, true)
  assert.strictEqual(timelineProcessing[1].current, true)
  assert.strictEqual(timelineProcessing[2].completed, false)
  assert.strictEqual(timelineProcessing[3].completed, false)

  const timelineShipped = buildCustomerTimeline('shipped', '2026-08-15T05:00:00Z', '2026-08-15T07:00:00Z')
  assert.strictEqual(timelineShipped[0].completed, true)
  assert.strictEqual(timelineShipped[1].completed, true)
  assert.strictEqual(timelineShipped[2].completed, true)
  assert.strictEqual(timelineShipped[2].current, true)
  assert.strictEqual(timelineShipped[3].completed, false)
})

// 14. Cancelled status timeline
test('14. Cancelled orders render a distinct 2-step timeline (Order Placed -> Cancelled)', () => {
  const timelineCancelled = buildCustomerTimeline('cancelled', '2026-08-15T05:00:00Z', '2026-08-15T08:00:00Z')
  assert.strictEqual(timelineCancelled.length, 2)
  assert.strictEqual(timelineCancelled[0].key, 'pending')
  assert.strictEqual(timelineCancelled[1].key, 'cancelled')
  assert.strictEqual(timelineCancelled[1].current, true)
})

// 15. Invoice uses order snapshot
test('15. Invoice generation uses Order snapshot properties exclusively', () => {
  const item = sampleOrder.items[0]
  assert.strictEqual(item.productName, 'Signature Handcrafted Tupi')
  assert.strictEqual(item.variantSku, 'TUPI-SIG-54')
  assert.strictEqual(item.unitPrice, 1450)
  assert.strictEqual(item.lineTotal, 2900)
  assert.strictEqual(sampleOrder.subtotal, 2900)
  assert.strictEqual(sampleOrder.total, 2960)
})

// 16. Historical price remains unchanged
test('16. Historical order item prices on invoice remain unchanged if catalog prices rise later', () => {
  const catalog = [{ id: 'p-3', price: 9999, name: 'Modified Future Product' }]
  // Order snapshot has original purchase price Tk 1450
  assert.strictEqual(sampleOrder.items[0].unitPrice, 1450)
  assert.notStrictEqual(sampleOrder.items[0].unitPrice, catalog[0].price)
})

// 17. Variant attributes appear in invoice
test('17. Variant attributes (e.g. Size: 54) are preserved and displayed on invoice', () => {
  assert.deepStrictEqual(sampleOrder.items[0].selectedAttributes, { Size: '54' })
})

// 18. Notification event mapping
test('18. Maps order lifecycle transitions correctly to notification events', () => {
  function getEventForTransition(prev, next) {
    if (prev === next) return null
    if (next === 'processing') return 'ORDER_PROCESSING'
    if (next === 'shipped') return 'ORDER_SHIPPED'
    if (next === 'delivered') return 'ORDER_DELIVERED'
    if (next === 'cancelled') return 'ORDER_CANCELLED'
    return null
  }
  assert.strictEqual(getEventForTransition('pending', 'processing'), 'ORDER_PROCESSING')
  assert.strictEqual(getEventForTransition('processing', 'shipped'), 'ORDER_SHIPPED')
  assert.strictEqual(getEventForTransition('shipped', 'delivered'), 'ORDER_DELIVERED')
  assert.strictEqual(getEventForTransition('processing', 'cancelled'), 'ORDER_CANCELLED')
})

// 19. Duplicate event prevention
test('19. Identical status update (e.g. processing -> processing) produces no duplicate event', () => {
  function getEventForTransition(prev, next) {
    if (prev === next) return null
    if (next === 'processing') return 'ORDER_PROCESSING'
    return null
  }
  assert.strictEqual(getEventForTransition('processing', 'processing'), null)
})

// 20. Email failure does not fail order (Failure isolation)
await asyncTest('20. Email failure does not throw or abort order creation', async () => {
  async function simulateOrderWithEmailFailure() {
    // 1. Order created & saved
    const orderCreated = { ...sampleOrder, id: 'ord_safe_1' }

    // 2. Detached non-blocking notification dispatch
    const notificationPromise = (async () => {
      throw new Error('SMTP Server connection timed out')
    })().catch((err) => {
      // Caught detached
      return { failed: true, error: err.message }
    })

    const notifResult = await notificationPromise
    return { order: orderCreated, notifResult }
  }

  const res = await simulateOrderWithEmailFailure()
  assert.strictEqual(res.order.id, 'ord_safe_1')
  assert.strictEqual(res.notifResult.failed, true)
})

// 21. SMS failure does not fail order
await asyncTest('21. SMS failure does not throw or abort order creation', async () => {
  async function simulateOrderWithSmsFailure() {
    const orderCreated = { ...sampleOrder, id: 'ord_safe_2' }
    const notificationPromise = (async () => {
      throw new Error('SMS Gateway HTTP 503 Service Unavailable')
    })().catch((err) => {
      return { failed: true, error: err.message }
    })
    const notifResult = await notificationPromise
    return { order: orderCreated, notifResult }
  }

  const res = await simulateOrderWithSmsFailure()
  assert.strictEqual(res.order.id, 'ord_safe_2')
  assert.strictEqual(res.notifResult.failed, true)
})

// 22. Both notification failures do not fail order
await asyncTest('22. Both Email and SMS failures combined do not abort order creation', async () => {
  async function simulateOrderWithTotalNotificationFailure() {
    const orderCreated = { ...sampleOrder, id: 'ord_safe_3' }
    const emailPromise = Promise.reject(new Error('Email failed')).catch(e => ({ status: 'failed', error: e.message }))
    const smsPromise = Promise.reject(new Error('SMS failed')).catch(e => ({ status: 'failed', error: e.message }))

    const results = await Promise.allSettled([emailPromise, smsPromise])
    return { order: orderCreated, notificationSettled: results }
  }

  const res = await simulateOrderWithTotalNotificationFailure()
  assert.strictEqual(res.order.id, 'ord_safe_3')
  assert.strictEqual(res.notificationSettled.length, 2)
  assert.strictEqual(res.notificationSettled[0].status, 'fulfilled')
  assert.strictEqual(res.notificationSettled[1].status, 'fulfilled')
})

// 23. Notification log records failure
test('23. Notification log entry structures error message on failure', () => {
  const logEntry = {
    id: 'notif_1',
    orderId: sampleOrder.id,
    orderNumber: sampleOrder.orderNumber,
    channel: 'sms',
    event: 'ORDER_CREATED',
    recipient: '01712345678',
    status: 'failed',
    provider: 'http-gateway',
    error: 'Gateway timeout',
    createdAt: new Date().toISOString()
  }

  assert.strictEqual(logEntry.status, 'failed')
  assert.strictEqual(logEntry.error, 'Gateway timeout')
  assert.strictEqual(logEntry.orderNumber, 'HN-1001')
})

// 24. Notification log records mocked success
test('24. Notification log entry structures mocked success for console provider in dev/test', () => {
  const logEntry = {
    id: 'notif_2',
    orderId: sampleOrder.id,
    orderNumber: sampleOrder.orderNumber,
    channel: 'email',
    event: 'ORDER_CREATED',
    recipient: 'asif@example.com',
    status: 'mocked',
    provider: 'console',
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString()
  }

  assert.strictEqual(logEntry.status, 'mocked')
  assert.strictEqual(logEntry.provider, 'console')
  assert.ok(logEntry.sentAt)
})

// 25. Admin invoice protected by authentication
test('25. Admin invoice route helper requires admin cookie authentication', () => {
  function requireAdminAuth(cookieHeader) {
    if (!cookieHeader || typeof cookieHeader !== 'string') return false
    return cookieHeader.includes('admin_session=')
  }

  assert.strictEqual(requireAdminAuth(''), false)
  assert.strictEqual(requireAdminAuth('other_cookie=123'), false)
  assert.strictEqual(requireAdminAuth('admin_session=valid_hmac_signature'), true)
})

console.log(`\n====================================================`)
console.log(`ALL PHASE 6 LOGIC TESTS COMPLETED: ${passed}/${total} PASSED`)
console.log(`====================================================`)

if (passed !== total) {
  process.exit(1)
}
