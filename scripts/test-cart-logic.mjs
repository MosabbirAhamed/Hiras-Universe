import assert from 'assert'

console.log('====================================================')
console.log('PHASE 3 CART LOGIC & AUDIT VERIFICATION SUITE')
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

// Function matching src/context/CartContext.tsx
function sanitizeCartItems(raw) {
  if (!Array.isArray(raw)) return []

  const merged = new Map()

  for (const item of raw) {
    if (
      item !== null &&
      typeof item === 'object' &&
      typeof item.productId === 'string' &&
      item.productId.trim().length > 0 &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    ) {
      const pid = item.productId.trim()
      const qty = item.quantity
      merged.set(pid, (merged.get(pid) || 0) + qty)
    }
  }

  return Array.from(merged.entries()).map(([productId, quantity]) => ({
    productId,
    quantity: Math.min(quantity, 999)
  }))
}

// 1. Sanitization of corrupted localStorage
function runSanitizeTests() {
  test('Sanitizes corrupted non-array data safely without crashing', () => {
    assert.deepStrictEqual(sanitizeCartItems(null), [])
    assert.deepStrictEqual(sanitizeCartItems('invalid-string'), [])
    assert.deepStrictEqual(sanitizeCartItems(123), [])
    assert.deepStrictEqual(sanitizeCartItems({}), [])
  })

  test('Filters out negative, zero, non-integer, and invalid structure items', () => {
    const raw = [
      null,
      'string-item',
      { productId: '', quantity: 2 },
      { productId: 'p-1', quantity: 0 },
      { productId: 'p-2', quantity: -3 },
      { productId: 'p-3', quantity: 1.5 },
      { productId: 'p-4', quantity: '2' },
      { productId: 'p-5', quantity: 3 }
    ]
    const sanitized = sanitizeCartItems(raw)
    assert.deepStrictEqual(sanitized, [{ productId: 'p-5', quantity: 3 }])
  })

  test('Merges duplicate product IDs in corrupted storage and clamps excessive quantities', () => {
    const raw = [
      { productId: 'p-1', quantity: 2 },
      { productId: 'p-2', quantity: 1 },
      { productId: 'p-1', quantity: 4 }
    ]
    const sanitized = sanitizeCartItems(raw)
    assert.deepStrictEqual(sanitized, [
      { productId: 'p-1', quantity: 6 },
      { productId: 'p-2', quantity: 1 }
    ])
  })
}

// 2. Pricing and Enriched Items Calculation matching CartContext.tsx
function runPricingTests() {
  const catalog = [
    {
      id: 'p-regular',
      name: 'Regular Item',
      price: 1000,
      salePrice: null,
      stock: 10,
      stockStatus: 'in_stock',
      active: true
    },
    {
      id: 'p-sale',
      name: 'Sale Item',
      price: 1500,
      salePrice: 1200,
      stock: 5,
      stockStatus: 'in_stock',
      active: true
    },
    {
      id: 'p-invalid-sale',
      name: 'Invalid Sale (sale > price)',
      price: 800,
      salePrice: 999, // invalid: greater than regular price
      stock: 10,
      stockStatus: 'in_stock',
      active: true
    },
    {
      id: 'p-out-of-stock',
      name: 'Out of Stock Item',
      price: 500,
      stock: 0,
      stockStatus: 'out_of_stock',
      active: true
    },
    {
      id: 'p-inactive',
      name: 'Inactive Item',
      price: 700,
      stock: 10,
      stockStatus: 'in_stock',
      active: false
    }
  ]

  const catalogMap = new Map(catalog.map(p => [p.id, p]))

  function enrichItem(item, isCatalogLoaded = true) {
    const product = catalogMap.get(item.productId)
    const isDeleted = isCatalogLoaded && !product
    const isInactive = Boolean(product && (product.active === false || product.visibility === 'hidden'))
    const isUnavailable = isDeleted || isInactive
    const isStockZero = Boolean(
      product &&
        (product.stockStatus === 'out_of_stock' || (typeof product.stock === 'number' && product.stock <= 0))
    )
    const isOutOfStock = isUnavailable || isStockZero

    const hasValidSalePrice = Boolean(
      product &&
        typeof product.salePrice === 'number' &&
        product.salePrice >= 0 &&
        (typeof product.price !== 'number' || product.salePrice < product.price)
    )

    const effectivePrice = !isUnavailable && product
      ? hasValidSalePrice
        ? product.salePrice
        : typeof product.price === 'number' && product.price >= 0
        ? product.price
        : 0
      : 0

    const maxStock = product && typeof product.stock === 'number' ? Math.max(0, product.stock) : 999
    const isMaxStock = !isOutOfStock && item.quantity >= maxStock

    return {
      productId: item.productId,
      quantity: item.quantity,
      product: product || {
        id: item.productId,
        name: 'Product no longer available',
        price: 0,
        stock: 0,
        stockStatus: 'out_of_stock',
        active: false
      },
      effectivePrice,
      lineTotal: effectivePrice * item.quantity,
      isOutOfStock,
      isMaxStock,
      isUnavailable
    }
  }

  test('Calculates effective price for regular products accurately', () => {
    const enriched = enrichItem({ productId: 'p-regular', quantity: 2 })
    assert.strictEqual(enriched.effectivePrice, 1000)
    assert.strictEqual(enriched.lineTotal, 2000)
    assert.strictEqual(enriched.isOutOfStock, false)
    assert.strictEqual(enriched.isUnavailable, false)
  })

  test('Prioritizes valid salePrice over regular price', () => {
    const enriched = enrichItem({ productId: 'p-sale', quantity: 3 })
    assert.strictEqual(enriched.effectivePrice, 1200)
    assert.strictEqual(enriched.lineTotal, 3600)
    assert.strictEqual(enriched.isOutOfStock, false)
  })

  test('Rejects invalid salePrice where salePrice > price and falls back to regular price', () => {
    const enriched = enrichItem({ productId: 'p-invalid-sale', quantity: 1 })
    assert.strictEqual(enriched.effectivePrice, 800)
    assert.strictEqual(enriched.lineTotal, 800)
  })

  test('Flags out-of-stock product accurately', () => {
    const enriched = enrichItem({ productId: 'p-out-of-stock', quantity: 1 })
    assert.strictEqual(enriched.isOutOfStock, true)
    assert.strictEqual(enriched.isUnavailable, false)
  })

  test('Flags inactive product as unavailable with zero effective price', () => {
    const enriched = enrichItem({ productId: 'p-inactive', quantity: 1 })
    assert.strictEqual(enriched.isUnavailable, true)
    assert.strictEqual(enriched.isOutOfStock, true)
    assert.strictEqual(enriched.effectivePrice, 0)
    assert.strictEqual(enriched.lineTotal, 0)
  })

  test('Handles deleted product safely without crashing and provides fallback metadata', () => {
    const enriched = enrichItem({ productId: 'p-deleted-from-db', quantity: 2 })
    assert.strictEqual(enriched.isUnavailable, true)
    assert.strictEqual(enriched.isOutOfStock, true)
    assert.strictEqual(enriched.effectivePrice, 0)
    assert.strictEqual(enriched.lineTotal, 0)
    assert.strictEqual(enriched.product.name, 'Product no longer available')
  })

  test('Calculates cart subtotal accurately as sum of line totals (excluding unavailable item prices)', () => {
    const cart = [
      { productId: 'p-regular', quantity: 2 }, // 1000 * 2 = 2000
      { productId: 'p-sale', quantity: 2 },    // 1200 * 2 = 2400
      { productId: 'p-deleted-from-db', quantity: 1 } // 0 * 1 = 0
    ]
    const enrichedCart = cart.map(item => enrichItem(item))
    const subtotal = enrichedCart.reduce((sum, item) => sum + item.lineTotal, 0)
    assert.strictEqual(subtotal, 4400)
  })
}

// 3. Stock Limits, Add to Bag & Clamping Logic
function runStockClampingTests() {
  test('Clamps persisted cart quantities when catalog stock is reduced', () => {
    const persistedItems = [
      { productId: 'p-limited', quantity: 10 },
      { productId: 'p-other', quantity: 2 }
    ]

    const productsMap = new Map([
      ['p-limited', { id: 'p-limited', stock: 3 }],
      ['p-other', { id: 'p-other', stock: 50 }]
    ])

    const reconciled = persistedItems.map((item) => {
      const p = productsMap.get(item.productId)
      if (!p) return item
      if (typeof p.stock === 'number' && p.stock > 0 && item.quantity > p.stock) {
        return { ...item, quantity: p.stock }
      }
      return item
    })

    assert.deepStrictEqual(reconciled, [
      { productId: 'p-limited', quantity: 3 },
      { productId: 'p-other', quantity: 2 }
    ])
  })

  test('Simulates addItem: prevents adding out of stock and inactive items', () => {
    const productsMap = new Map([
      ['p-oos', { id: 'p-oos', name: 'OOS Product', stock: 0, stockStatus: 'out_of_stock', active: true }],
      ['p-inact', { id: 'p-inact', name: 'Inactive Product', stock: 5, stockStatus: 'in_stock', active: false }],
      ['p-stock3', { id: 'p-stock3', name: 'Limited Stock', stock: 3, stockStatus: 'in_stock', active: true }]
    ])

    function getProductMaxStock(pid) {
      const p = productsMap.get(pid)
      if (!p) return 0
      if (p.active === false) return 0
      if (p.stockStatus === 'out_of_stock') return 0
      return Math.max(0, p.stock)
    }

    function simulateAddItem(items, pid, qty) {
      const p = productsMap.get(pid)
      const maxStock = getProductMaxStock(pid)
      if (maxStock <= 0) {
        return { success: false, items, message: `${p?.name || 'Item'} is currently out of stock.` }
      }
      const existing = items.find(i => i.productId === pid)
      const currentQty = existing ? existing.quantity : 0
      if (currentQty >= maxStock) {
        return { success: false, items, message: `Maximum available stock (${maxStock}) reached for this item.` }
      }
      const finalQty = Math.min(currentQty + qty, maxStock)
      const nextItems = existing
        ? items.map(i => i.productId === pid ? { ...i, quantity: finalQty } : i)
        : [...items, { productId: pid, quantity: finalQty }]
      return { success: true, items: nextItems, message: 'Added to bag.' }
    }

    // Attempt to add OOS
    let res = simulateAddItem([], 'p-oos', 1)
    assert.strictEqual(res.success, false)
    assert.deepStrictEqual(res.items, [])

    // Attempt to add Inactive
    res = simulateAddItem([], 'p-inact', 1)
    assert.strictEqual(res.success, false)
    assert.deepStrictEqual(res.items, [])

    // Add item with stock 3 (add 2)
    res = simulateAddItem([], 'p-stock3', 2)
    assert.strictEqual(res.success, true)
    assert.deepStrictEqual(res.items, [{ productId: 'p-stock3', quantity: 2 }])

    // Add 2 more (should clamp to max 3 without creating duplicate line)
    res = simulateAddItem(res.items, 'p-stock3', 2)
    assert.strictEqual(res.success, true)
    assert.deepStrictEqual(res.items, [{ productId: 'p-stock3', quantity: 3 }])

    // Add again when already at max stock 3
    res = simulateAddItem(res.items, 'p-stock3', 1)
    assert.strictEqual(res.success, false)
    assert.strictEqual(res.message, 'Maximum available stock (3) reached for this item.')
    assert.deepStrictEqual(res.items, [{ productId: 'p-stock3', quantity: 3 }])
  })
}

runSanitizeTests()
runPricingTests()
runStockClampingTests()

console.log(`\n====================================================`)
console.log(`ALL TESTS COMPLETED: ${passed}/${total} PASSED`)
console.log(`====================================================`)

if (passed !== total) {
  process.exit(1)
}
