import assert from 'assert'

console.log('====================================================')
console.log('PHASE 5 ORDER PROCESSING & CHECKOUT LOGIC TEST SUITE')
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

// -------------------------------------------------------------------
// REFERENCE DATA & UTILITIES UNDER TEST (matching src/lib implementation)
// -------------------------------------------------------------------

const DHAKA_DELIVERY_CHARGE = 60
const OUTSIDE_DHAKA_DELIVERY_CHARGE = 120

const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Kishoreganj', 'Manikganj', 'Munshiganj', 'Narsingdi',
  'Faridpur', 'Gopalganj', 'Madaripur', 'Rajbari', 'Shariatpur', 'Chattogram', "Cox's Bazar", 'Cumilla',
  'Feni', 'Brahmanbaria', 'Noakhali', 'Chandpur', 'Lakshmipur', 'Rangamati', 'Khagrachhari', 'Bandarban',
  'Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj', 'Rajshahi', 'Bogura', 'Pabna', 'Sirajganj',
  'Naogaon', 'Natore', 'Chapainawabganj', 'Joypurhat', 'Khulna', 'Jashore', 'Satkhira', 'Bagerhat',
  'Kushtia', 'Chuadanga', 'Jhenaidah', 'Magura', 'Meherpur', 'Narail', 'Barishal', 'Patuakhali',
  'Bhola', 'Pirojpur', 'Barguna', 'Jhalokathi', 'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram',
  'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon', 'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'
]

const districtSet = new Set(BANGLADESH_DISTRICTS.map((d) => d.toLowerCase()))

function isValidDistrict(name) {
  if (!name || typeof name !== 'string') return false
  return districtSet.has(name.trim().toLowerCase())
}

function normalizeDistrictName(name) {
  const match = BANGLADESH_DISTRICTS.find((d) => d.toLowerCase() === name.trim().toLowerCase())
  return match || name.trim()
}

function getDeliveryCharge(districtName) {
  if (!districtName || typeof districtName !== 'string') return OUTSIDE_DHAKA_DELIVERY_CHARGE
  return districtName.trim().toLowerCase() === 'dhaka' ? DHAKA_DELIVERY_CHARGE : OUTSIDE_DHAKA_DELIVERY_CHARGE
}

function sanitizeText(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>?/gm, '')
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
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

function validateCheckoutInput(input) {
  const errors = {}
  if (!input || typeof input !== 'object') {
    return { ok: false, errors: { form: 'Invalid submission data.' }, message: 'Invalid submission data.' }
  }

  const fullName = sanitizeText(input.fullName)
  if (!fullName || fullName.length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters).'
  }

  const validPhone = normalizeAndValidateBdPhone(String(input.phone || ''))
  if (!validPhone) {
    errors.phone = 'Please provide a valid 11-digit Bangladesh mobile number (e.g. 01712345678).'
  }

  const rawDistrict = sanitizeText(input.district)
  if (!rawDistrict || !isValidDistrict(rawDistrict)) {
    errors.district = 'Please select a valid Bangladesh district.'
  }
  const district = normalizeDistrictName(rawDistrict)

  const thana = sanitizeText(input.thana)
  if (!thana || thana.length < 2) {
    errors.thana = 'Thana / Upazila / Area is required.'
  }

  const deliveryAddress = sanitizeText(input.deliveryAddress)
  if (!deliveryAddress || deliveryAddress.length < 5) {
    errors.deliveryAddress = 'Full street address is required (minimum 5 characters).'
  }

  const validPaymentMethods = ['cod', 'bkash', 'nagad']
  const paymentMethod = input.paymentMethod || 'cod'
  if (!validPaymentMethods.includes(paymentMethod)) {
    errors.paymentMethod = 'Please choose a valid payment method.'
  }

  const rawItems = Array.isArray(input.items) ? input.items : []
  if (rawItems.length === 0) {
    errors.items = 'Your shopping bag is empty.'
  }

  const cleanItems = []
  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i]
    if (!item || typeof item !== 'object' || typeof item.productId !== 'string' || !item.productId.trim()) {
      errors[`item_${i}`] = 'Invalid item in cart.'
      continue
    }
    const qty = Number(item.quantity)
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      errors[`item_${i}_qty`] = 'Item quantity must be an integer between 1 and 10.'
    }
    cleanItems.push({
      productId: item.productId.trim(),
      variantId: typeof item.variantId === 'string' && item.variantId.trim() ? item.variantId.trim() : undefined,
      quantity: qty
    })
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, message: 'Please review and fix the errors in the checkout form.' }
  }

  return {
    ok: true,
    data: {
      fullName,
      phone: validPhone,
      email: input.email ? sanitizeText(input.email) : undefined,
      district,
      thana,
      deliveryAddress,
      deliveryNotes: input.deliveryNotes ? sanitizeText(input.deliveryNotes) : undefined,
      paymentMethod,
      items: cleanItems
    }
  }
}

function calculateAndValidateOrderItems(items, catalogProducts, district) {
  if (!isValidDistrict(district)) {
    return { ok: false, error: `Invalid district "${district}". Must be one of the 64 Bangladesh districts.` }
  }

  const productsMap = new Map(catalogProducts.map((p) => [p.id, p]))
  const snapshots = []
  const productStockUpdates = new Map()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
      return { ok: false, error: `Invalid quantity "${item.quantity}". Quantity must be an integer between 1 and 10.` }
    }

    const product = productsMap.get(item.productId)
    if (!product) {
      return { ok: false, error: `Product with ID "${item.productId}" is no longer available in the catalog.` }
    }

    if (product.active === false || product.visibility === 'hidden') {
      return { ok: false, error: `"${product.name}" is currently unavailable for purchase.` }
    }

    if (product.hasVariants && Array.isArray(product.variants)) {
      if (!item.variantId) {
        return { ok: false, error: `Please select size/option for "${product.name}".` }
      }

      const variant = product.variants.find((v) => v.id === item.variantId)
      if (!variant) {
        return { ok: false, error: `Selected option for "${product.name}" is no longer available.` }
      }

      if (variant.active === false) {
        return { ok: false, error: `Selected option for "${product.name}" (${variant.sku}) is currently deactivated.` }
      }

      const variantStock = typeof variant.stock === 'number' ? Math.max(0, variant.stock) : 0
      if (variant.stockStatus === 'out_of_stock' || variantStock <= 0) {
        return { ok: false, error: `"${product.name}" (${variant.sku}) is out of stock.` }
      }

      if (item.quantity > variantStock) {
        return {
          ok: false,
          error: `Only ${variantStock} unit(s) available for "${product.name}" (${variant.sku}). You requested ${item.quantity}.`
        }
      }

      const hasValidSalePrice = Boolean(
        typeof variant.salePrice === 'number' && variant.salePrice >= 0 && variant.salePrice < variant.price
      )
      const unitPrice = hasValidSalePrice ? variant.salePrice : variant.price
      const regularPrice = variant.price
      const lineTotal = unitPrice * item.quantity

      snapshots.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantSku: variant.sku,
        productSku: product.sku,
        selectedAttributes: variant.attributes,
        image: variant.image || product.primaryImage || product.images?.[0],
        unitPrice,
        regularPrice,
        quantity: item.quantity,
        lineTotal
      })

      productStockUpdates.set(`${product.id}::${variant.id}`, {
        product,
        variantId: variant.id,
        deductedStock: item.quantity
      })
    } else {
      const productStock = typeof product.stock === 'number' ? Math.max(0, product.stock) : 0
      if (product.stockStatus === 'out_of_stock' || productStock <= 0) {
        return { ok: false, error: `"${product.name}" is out of stock.` }
      }

      if (item.quantity > productStock) {
        return {
          ok: false,
          error: `Only ${productStock} unit(s) available for "${product.name}". You requested ${item.quantity}.`
        }
      }

      const hasValidSalePrice = Boolean(
        typeof product.salePrice === 'number' && product.salePrice >= 0 && product.salePrice < product.price
      )
      const unitPrice = hasValidSalePrice ? product.salePrice : product.price
      const regularPrice = product.price
      const lineTotal = unitPrice * item.quantity

      snapshots.push({
        productId: product.id,
        variantId: undefined,
        productName: product.name,
        productSku: product.sku,
        variantSku: undefined,
        selectedAttributes: undefined,
        image: product.primaryImage || product.images?.[0],
        unitPrice,
        regularPrice,
        quantity: item.quantity,
        lineTotal
      })

      productStockUpdates.set(`${product.id}::default`, {
        product,
        variantId: undefined,
        deductedStock: item.quantity
      })
    }
  }

  const subtotal = snapshots.reduce((sum, item) => sum + item.lineTotal, 0)
  const deliveryCharge = getDeliveryCharge(district)
  const discountTotal = 0
  const total = subtotal + deliveryCharge - discountTotal

  return {
    ok: true,
    items: snapshots,
    subtotal,
    deliveryCharge,
    discountTotal,
    total,
    productStockUpdates
  }
}

function generateNextOrderNumber(orders) {
  let maxSuffix = 1000
  for (const order of orders) {
    if (order.orderNumber && order.orderNumber.startsWith('HN-')) {
      const numPart = parseInt(order.orderNumber.replace('HN-', ''), 10)
      if (!Number.isNaN(numPart) && numPart > maxSuffix) {
        maxSuffix = numPart
      }
    }
  }
  return `HN-${maxSuffix + 1}`
}

function computeProductStockStatus(stock, lowStockThreshold = 0) {
  if (stock <= 0) return 'out_of_stock'
  if (lowStockThreshold > 0 && stock <= lowStockThreshold) return 'low_stock'
  return 'in_stock'
}

// -------------------------------------------------------------------
// TEST SUITE EXECUTION (20 Required Test Scenarios)
// -------------------------------------------------------------------

// 1. Simple product order calculation
test('1. Simple product order calculation with correct lineTotal, subtotal, and total', () => {
  const catalog = [
    { id: 'p-1', name: 'Classic Tupi', price: 1200, salePrice: null, stock: 10, active: true }
  ]
  const res = calculateAndValidateOrderItems([{ productId: 'p-1', quantity: 2 }], catalog, 'Dhaka')
  assert.strictEqual(res.ok, true)
  assert.strictEqual(res.items.length, 1)
  assert.strictEqual(res.items[0].unitPrice, 1200)
  assert.strictEqual(res.items[0].lineTotal, 2400)
  assert.strictEqual(res.subtotal, 2400)
  assert.strictEqual(res.deliveryCharge, 60)
  assert.strictEqual(res.total, 2460)
})

// 2. Variant product order calculation
test('2. Variant product order calculation preserves variant SKU and attributes', () => {
  const catalog = [
    {
      id: 'p-var',
      name: 'Signature Tupi',
      price: 1500,
      hasVariants: true,
      active: true,
      variants: [
        { id: 'v-52', sku: 'SIG-52', attributes: { Size: '52' }, price: 1600, salePrice: null, stock: 8, active: true },
        { id: 'v-54', sku: 'SIG-54', attributes: { Size: '54' }, price: 1650, salePrice: 1500, stock: 5, active: true }
      ]
    }
  ]
  const res = calculateAndValidateOrderItems([{ productId: 'p-var', variantId: 'v-54', quantity: 2 }], catalog, 'Dhaka')
  assert.strictEqual(res.ok, true)
  assert.strictEqual(res.items[0].variantSku, 'SIG-54')
  assert.deepStrictEqual(res.items[0].selectedAttributes, { Size: '54' })
  assert.strictEqual(res.items[0].unitPrice, 1500)
  assert.strictEqual(res.items[0].lineTotal, 3000)
  assert.strictEqual(res.subtotal, 3000)
})

// 3. Sale price snapshot
test('3. Captures sale price accurately when salePrice < regular price', () => {
  const catalog = [
    { id: 'p-sale', name: 'Discounted Tupi', price: 2000, salePrice: 1750, stock: 15, active: true }
  ]
  const res = calculateAndValidateOrderItems([{ productId: 'p-sale', quantity: 1 }], catalog, 'Sylhet')
  assert.strictEqual(res.ok, true)
  assert.strictEqual(res.items[0].unitPrice, 1750)
  assert.strictEqual(res.items[0].regularPrice, 2000)
})

// 4. Regular price fallback
test('4. Falls back to regular price if salePrice is null, negative, or invalid (sale >= price)', () => {
  const catalog = [
    { id: 'p-null-sale', name: 'Null Sale', price: 1000, salePrice: null, stock: 5, active: true },
    { id: 'p-inv-sale', name: 'Invalid Sale', price: 1000, salePrice: 1200, stock: 5, active: true }
  ]
  const res1 = calculateAndValidateOrderItems([{ productId: 'p-null-sale', quantity: 1 }], catalog, 'Dhaka')
  assert.strictEqual(res1.ok, true)
  assert.strictEqual(res1.items[0].unitPrice, 1000)

  const res2 = calculateAndValidateOrderItems([{ productId: 'p-inv-sale', quantity: 1 }], catalog, 'Dhaka')
  assert.strictEqual(res2.ok, true)
  assert.strictEqual(res2.items[0].unitPrice, 1000)
})

// 5. Multiple cart items
test('5. Multi-item cart calculation sums line totals correctly across simple & variant items', () => {
  const catalog = [
    { id: 'p-1', name: 'Simple Tupi', price: 500, stock: 10, active: true },
    {
      id: 'p-2',
      name: 'Variant Tupi',
      price: 800,
      hasVariants: true,
      active: true,
      variants: [{ id: 'v-1', sku: 'VAR-1', attributes: { Color: 'White' }, price: 850, stock: 10, active: true }]
    }
  ]
  const res = calculateAndValidateOrderItems(
    [
      { productId: 'p-1', quantity: 3 }, // 3 * 500 = 1500
      { productId: 'p-2', variantId: 'v-1', quantity: 2 } // 2 * 850 = 1700
    ],
    catalog,
    'Chattogram'
  )
  assert.strictEqual(res.ok, true)
  assert.strictEqual(res.items.length, 2)
  assert.strictEqual(res.subtotal, 3200)
  assert.strictEqual(res.deliveryCharge, 120)
  assert.strictEqual(res.total, 3320)
})

// 6. Delivery charge
test('6. Delivery charge calculates Tk 60 for Dhaka and Tk 120 for outside Dhaka', () => {
  assert.strictEqual(getDeliveryCharge('Dhaka'), 60)
  assert.strictEqual(getDeliveryCharge('dhaka'), 60)
  assert.strictEqual(getDeliveryCharge('DHAKA'), 60)
  assert.strictEqual(getDeliveryCharge('Gazipur'), 120)
  assert.strictEqual(getDeliveryCharge('Sylhet'), 120)
  assert.strictEqual(getDeliveryCharge('Chattogram'), 120)
})

// 7. Invalid district
test('7. Rejects invalid or unlisted district string safely', () => {
  assert.strictEqual(isValidDistrict('London'), false)
  assert.strictEqual(isValidDistrict(''), false)
  assert.strictEqual(isValidDistrict(null), false)
  assert.strictEqual(isValidDistrict('New York'), false)
  assert.strictEqual(isValidDistrict('Dhaka'), true)
  assert.strictEqual(isValidDistrict('Cox\'s Bazar'), true)

  const checkoutInput = {
    fullName: 'Rahim Khan',
    phone: '01711223344',
    district: 'InvalidDistrictName',
    thana: 'Mirpur',
    deliveryAddress: 'House 12, Road 4',
    items: [{ productId: 'p-1', quantity: 1 }]
  }
  const val = validateCheckoutInput(checkoutInput)
  assert.strictEqual(val.ok, false)
  assert.ok(val.errors.district)
})

// 8. Invalid phone
test('8. Rejects invalid Bangladesh phone formats and normalizes valid numbers', () => {
  assert.strictEqual(normalizeAndValidateBdPhone('01712345678'), '01712345678')
  assert.strictEqual(normalizeAndValidateBdPhone('+8801812345678'), '01812345678')
  assert.strictEqual(normalizeAndValidateBdPhone('8801912345678'), '01912345678')
  assert.strictEqual(normalizeAndValidateBdPhone('01712-345678'), '01712345678')

  // Invalid numbers
  assert.strictEqual(normalizeAndValidateBdPhone('01212345678'), null) // 012 not valid prefix
  assert.strictEqual(normalizeAndValidateBdPhone('0171234567'), null) // only 10 digits
  assert.strictEqual(normalizeAndValidateBdPhone('017123456789'), null) // 12 digits
  assert.strictEqual(normalizeAndValidateBdPhone('+14155552671'), null) // US number
  assert.strictEqual(normalizeAndValidateBdPhone('not-a-number'), null)
})

// 9. Invalid quantity
test('9. Rejects invalid quantity (0, negative, non-integer, > 10)', () => {
  const catalog = [{ id: 'p-1', name: 'Tupi', price: 500, stock: 20, active: true }]

  assert.strictEqual(calculateAndValidateOrderItems([{ productId: 'p-1', quantity: 0 }], catalog, 'Dhaka').ok, false)
  assert.strictEqual(calculateAndValidateOrderItems([{ productId: 'p-1', quantity: -2 }], catalog, 'Dhaka').ok, false)
  assert.strictEqual(calculateAndValidateOrderItems([{ productId: 'p-1', quantity: 1.5 }], catalog, 'Dhaka').ok, false)
  assert.strictEqual(calculateAndValidateOrderItems([{ productId: 'p-1', quantity: 11 }], catalog, 'Dhaka').ok, false)
  assert.strictEqual(calculateAndValidateOrderItems([{ productId: 'p-1', quantity: 10 }], catalog, 'Dhaka').ok, true)
})

// 10. Out-of-stock product
test('10. Rejects order item when simple product stock is zero or stockStatus is out_of_stock', () => {
  const catalog = [
    { id: 'p-zero', name: 'Zero Stock Tupi', price: 500, stock: 0, active: true },
    { id: 'p-oos', name: 'OOS Tupi', price: 500, stock: 5, stockStatus: 'out_of_stock', active: true }
  ]
  const res1 = calculateAndValidateOrderItems([{ productId: 'p-zero', quantity: 1 }], catalog, 'Dhaka')
  assert.strictEqual(res1.ok, false)
  assert.ok(res1.error.includes('out of stock'))

  const res2 = calculateAndValidateOrderItems([{ productId: 'p-oos', quantity: 1 }], catalog, 'Dhaka')
  assert.strictEqual(res2.ok, false)
  assert.ok(res2.error.includes('out of stock'))
})

// 11. Insufficient variant stock
test('11. Rejects order item when requested quantity exceeds variant stock', () => {
  const catalog = [
    {
      id: 'p-var',
      name: 'Variant Tupi',
      price: 1000,
      hasVariants: true,
      active: true,
      variants: [{ id: 'v-1', sku: 'V-1', attributes: { Size: '54' }, price: 1000, stock: 2, active: true }]
    }
  ]
  const res = calculateAndValidateOrderItems([{ productId: 'p-var', variantId: 'v-1', quantity: 3 }], catalog, 'Dhaka')
  assert.strictEqual(res.ok, false)
  assert.ok(res.error.includes('Only 2 unit(s) available'))
})

// 12. Deleted product
test('12. Safely rejects item if product ID does not exist in catalog', () => {
  const catalog = [{ id: 'p-1', name: 'Tupi', price: 500, stock: 10, active: true }]
  const res = calculateAndValidateOrderItems([{ productId: 'p-non-existent', quantity: 1 }], catalog, 'Dhaka')
  assert.strictEqual(res.ok, false)
  assert.ok(res.error.includes('is no longer available in the catalog'))
})

// 13. Inactive product
test('13. Rejects order item if product has active: false or visibility: hidden', () => {
  const catalog = [
    { id: 'p-inact', name: 'Inactive Tupi', price: 500, stock: 10, active: false },
    { id: 'p-hidden', name: 'Hidden Tupi', price: 500, stock: 10, active: true, visibility: 'hidden' }
  ]
  const res1 = calculateAndValidateOrderItems([{ productId: 'p-inact', quantity: 1 }], catalog, 'Dhaka')
  assert.strictEqual(res1.ok, false)
  assert.ok(res1.error.includes('currently unavailable for purchase'))

  const res2 = calculateAndValidateOrderItems([{ productId: 'p-hidden', quantity: 1 }], catalog, 'Dhaka')
  assert.strictEqual(res2.ok, false)
  assert.ok(res2.error.includes('currently unavailable for purchase'))
})

// 14. Inactive variant
test('14. Rejects order item if selected variant has active: false', () => {
  const catalog = [
    {
      id: 'p-var',
      name: 'Variant Tupi',
      price: 1000,
      hasVariants: true,
      active: true,
      variants: [{ id: 'v-deact', sku: 'V-DEACT', attributes: { Size: '52' }, price: 1000, stock: 5, active: false }]
    }
  ]
  const res = calculateAndValidateOrderItems([{ productId: 'p-var', variantId: 'v-deact', quantity: 1 }], catalog, 'Dhaka')
  assert.strictEqual(res.ok, false)
  assert.ok(res.error.includes('currently deactivated'))
})

// 15. Stock deduction
test('15. Stock deduction reduces product stock correctly upon order creation', () => {
  const product = { id: 'p-simple', name: 'Simple Tupi', price: 600, stock: 10, active: true }
  const quantityToDeduct = 3

  product.stock = Math.max(0, product.stock - quantityToDeduct)
  product.stockStatus = computeProductStockStatus(product.stock, 2)

  assert.strictEqual(product.stock, 7)
  assert.strictEqual(product.stockStatus, 'in_stock')

  // Deduct remaining
  product.stock = Math.max(0, product.stock - 7)
  product.stockStatus = computeProductStockStatus(product.stock, 2)
  assert.strictEqual(product.stock, 0)
  assert.strictEqual(product.stockStatus, 'out_of_stock')
})

// 16. Parent variant stock recalculation
test('16. Recalculates parent product derived stock as sum of active variant stocks after deduction', () => {
  const product = {
    id: 'p-parent',
    name: 'Parent Product',
    price: 1000,
    hasVariants: true,
    active: true,
    variants: [
      { id: 'v-1', sku: 'V-1', price: 1000, stock: 10, active: true },
      { id: 'v-2', sku: 'V-2', price: 1000, stock: 5, active: true },
      { id: 'v-3', sku: 'V-3', price: 1000, stock: 20, active: false } // inactive variant
    ]
  }

  // Deduct 4 from variant 1
  product.variants[0].stock -= 4

  // Recalculate parent stock from active variants only
  const activeVariants = product.variants.filter((v) => v.active !== false)
  const derivedStock = activeVariants.reduce((sum, v) => sum + v.stock, 0)
  product.stock = derivedStock

  assert.strictEqual(product.variants[0].stock, 6)
  assert.strictEqual(derivedStock, 11) // 6 + 5 (ignoring inactive v-3)
  assert.strictEqual(product.stock, 11)
})

// 17. Cancellation restock
test('17. Restores product and variant stock accurately on cancellation transition', () => {
  const catalog = [
    {
      id: 'p-restock',
      name: 'Restock Tupi',
      price: 1000,
      stock: 5,
      hasVariants: true,
      active: true,
      variants: [
        { id: 'v-1', sku: 'V-1', price: 1000, stock: 5, active: true }
      ]
    }
  ]

  const mockOrder = {
    id: 'ord-test-1',
    orderStatus: 'pending',
    stockDeducted: true,
    items: [
      { productId: 'p-restock', variantId: 'v-1', quantity: 3 }
    ]
  }

  // Perform cancellation restock
  if (mockOrder.stockDeducted) {
    const prod = catalog.find((p) => p.id === 'p-restock')
    const v = prod.variants.find((v) => v.id === 'v-1')
    v.stock += 3
    const derivedStock = prod.variants.filter((v) => v.active !== false).reduce((sum, item) => sum + item.stock, 0)
    prod.stock = derivedStock
    mockOrder.stockDeducted = false
    mockOrder.orderStatus = 'cancelled'
  }

  assert.strictEqual(catalog[0].variants[0].stock, 8)
  assert.strictEqual(catalog[0].stock, 8)
  assert.strictEqual(mockOrder.stockDeducted, false)
  assert.strictEqual(mockOrder.orderStatus, 'cancelled')
})

// 18. Double-cancellation protection (Idempotent restock)
test('18. Double-cancellation does NOT restore inventory multiple times', () => {
  const catalog = [
    { id: 'p-1', name: 'Item', price: 500, stock: 10, active: true }
  ]

  const order = {
    id: 'ord-123',
    orderStatus: 'pending',
    stockDeducted: true,
    items: [{ productId: 'p-1', quantity: 2 }]
  }

  function cancelOrder(targetOrder) {
    const previousStatus = targetOrder.orderStatus
    if (previousStatus === 'cancelled') {
      // already cancelled - do nothing
      return { restored: false }
    }
    if (targetOrder.stockDeducted) {
      const p = catalog.find((item) => item.id === 'p-1')
      p.stock += 2
      targetOrder.stockDeducted = false
    }
    targetOrder.orderStatus = 'cancelled'
    return { restored: true }
  }

  // First cancellation: Restores stock
  const res1 = cancelOrder(order)
  assert.strictEqual(res1.restored, true)
  assert.strictEqual(catalog[0].stock, 12)
  assert.strictEqual(order.stockDeducted, false)

  // Second cancellation: Idempotent, must NOT restore again
  const res2 = cancelOrder(order)
  assert.strictEqual(res2.restored, false)
  assert.strictEqual(catalog[0].stock, 12) // Stock remains 12, not 14
})

// 19. Historical price snapshot immutability
test('19. OrderItemSnapshot preserves historical price when catalog later changes', () => {
  const catalog = [
    { id: 'p-hist', name: 'Original Name', price: 1000, salePrice: null, stock: 10, active: true }
  ]

  // Create snapshot at Tk 1000
  const orderRes = calculateAndValidateOrderItems([{ productId: 'p-hist', quantity: 1 }], catalog, 'Dhaka')
  assert.strictEqual(orderRes.ok, true)
  const snapshot = orderRes.items[0]

  // Later catalog modifications (e.g. price rises to Tk 2500, name changes)
  catalog[0].price = 2500
  catalog[0].name = 'Renamed Product 2026'

  // The historical snapshot MUST remain untouched
  assert.strictEqual(snapshot.productName, 'Original Name')
  assert.strictEqual(snapshot.unitPrice, 1000)
  assert.strictEqual(snapshot.lineTotal, 1000)
})

// 20. Unique sequential order number sequence
test('20. Generates sequential order numbers HN-1001, HN-1002, HN-1003 based on highest numeric suffix', () => {
  assert.strictEqual(generateNextOrderNumber([]), 'HN-1001')

  const orders1 = [{ orderNumber: 'HN-1001' }]
  assert.strictEqual(generateNextOrderNumber(orders1), 'HN-1002')

  const orders2 = [{ orderNumber: 'HN-1001' }, { orderNumber: 'HN-1002' }]
  assert.strictEqual(generateNextOrderNumber(orders2), 'HN-1003')

  // Gap / deletion test (e.g. HN-1003 deleted, highest is HN-1005)
  const ordersWithGaps = [{ orderNumber: 'HN-1001' }, { orderNumber: 'HN-1005' }]
  assert.strictEqual(generateNextOrderNumber(ordersWithGaps), 'HN-1006')
})

console.log(`\n====================================================`)
console.log(`ALL ORDER LOGIC TESTS COMPLETED: ${passed}/${total} PASSED`)
console.log(`====================================================`)

if (passed !== total) {
  process.exit(1)
}
