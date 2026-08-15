import assert from 'assert'

console.log('====================================================')
console.log('PHASE 4 PRODUCT VARIANTS & INVENTORY TEST SUITE')
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

// 1. SKU Generation Helper
function generateVariantSku(parentSku, attributes) {
  const base = String(parentSku || 'PROD').trim().toUpperCase()
  const parts = Object.values(attributes)
    .map((v) =>
      String(v)
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
    )
    .filter(Boolean)

  return parts.length > 0 ? `${base}-${parts.join('-')}` : base
}

function canonicalAttributeKey(attributes = {}) {
  const sortedKeys = Object.keys(attributes).sort()
  return sortedKeys.map((k) => `${k.trim().toLowerCase()}=${String(attributes[k]).trim().toLowerCase()}`).join('::')
}

// 2. Normalization & Derived Parent Stock
function normalizeProduct(product) {
  const hasVariants = Boolean(product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0)
  let normalizedVariants = []
  let normalizedAttributes = []
  let derivedStock = product.stock ?? 0
  let derivedPrice = product.price ?? 0

  if (hasVariants && Array.isArray(product.variants)) {
    normalizedAttributes = (product.attributes || []).map((attr, idx) => ({
      id: attr.id || `attr-${idx + 1}`,
      name: String(attr.name || '').trim(),
      values: Array.isArray(attr.values) ? attr.values.map(v => String(v).trim()).filter(Boolean) : []
    }))

    normalizedVariants = product.variants.map((v, idx) => {
      const vStock = typeof v.stock === 'number' ? Math.max(0, v.stock) : 0
      const vPrice = typeof v.price === 'number' ? v.price : product.price ?? 0
      const vSalePrice =
        typeof v.salePrice === 'number' && v.salePrice >= 0 && v.salePrice < vPrice ? v.salePrice : null

      return {
        id: v.id || `var-${idx + 1}`,
        sku: v.sku || generateVariantSku(product.sku || product.name, v.attributes || {}),
        attributes: v.attributes || {},
        price: vPrice,
        salePrice: vSalePrice,
        stock: vStock,
        active: v.active !== false
      }
    })

    const activeVariants = normalizedVariants.filter(v => v.active)
    derivedStock = activeVariants.reduce((sum, v) => sum + v.stock, 0)
    derivedPrice = activeVariants.length > 0 ? Math.min(...activeVariants.map(v => v.price)) : 0
  }

  return {
    ...product,
    hasVariants,
    attributes: normalizedAttributes,
    variants: normalizedVariants,
    price: derivedPrice,
    stock: derivedStock
  }
}

// Test 1: Backward compatibility for legacy simple products
test('Legacy product normalization maintains simple product behavior', () => {
  const legacy = {
    id: 'p-1',
    name: 'Classic White Tupi',
    price: 1250,
    sku: 'TUPI-CL-WHT',
    stock: 120
  }

  const normalized = normalizeProduct(legacy)
  assert.strictEqual(normalized.hasVariants, false)
  assert.deepStrictEqual(normalized.attributes, [])
  assert.deepStrictEqual(normalized.variants, [])
  assert.strictEqual(normalized.stock, 120)
  assert.strictEqual(normalized.price, 1250)
})

// Test 2: Derived stock for variant product: sum of active variants
test('Variant product stock is strictly derived as SUM(active variant stock)', () => {
  const variantProduct = {
    id: 'p-3',
    name: 'Signature Tupi',
    sku: 'TUPI-SIG',
    stock: 999, // Stale manually entered stock should be ignored!
    hasVariants: true,
    attributes: [{ id: 'a-1', name: 'Size', values: ['52', '54', '56'] }],
    variants: [
      { id: 'v-1', sku: 'TUPI-SIG-52', attributes: { Size: '52' }, price: 1650, stock: 25, active: true },
      { id: 'v-2', sku: 'TUPI-SIG-54', attributes: { Size: '54' }, price: 1650, stock: 15, active: true },
      { id: 'v-3', sku: 'TUPI-SIG-56', attributes: { Size: '56' }, price: 1750, stock: 5, active: false } // Inactive variant (5 units)
    ]
  }

  const normalized = normalizeProduct(variantProduct)
  // Derived stock should be 25 + 15 = 40 (excluding inactive variant with 5 stock)
  assert.strictEqual(normalized.stock, 40)
  assert.strictEqual(normalized.price, 1650)
  assert.strictEqual(normalized.variants.length, 3)
})

// Test 3: SKU Generation follows PARENT-SKU-ATTRIBUTE-VALUE pattern
test('Variant SKU generation produces structured uppercase SKU strings', () => {
  const sku = generateVariantSku('TUPI-PC-001', { Size: '54', Color: 'White' })
  assert.strictEqual(sku, 'TUPI-PC-001-54-WHITE')

  const skuSizeOnly = generateVariantSku('TUPI-SIG', { Size: '52' })
  assert.strictEqual(skuSizeOnly, 'TUPI-SIG-52')
})

// Test 4: Duplicate SKU Validation
test('Validates catalog-wide SKU uniqueness including variant SKUs', () => {
  const catalog = [
    {
      id: 'p-1',
      sku: 'TUPI-CL-WHT',
      hasVariants: false
    },
    {
      id: 'p-2',
      sku: 'TUPI-PC-001',
      hasVariants: true,
      variants: [
        { id: 'v-1', sku: 'TUPI-PC-001-52' },
        { id: 'v-2', sku: 'TUPI-PC-001-54' }
      ]
    }
  ]

  const allSkus = new Set()
  for (const p of catalog) {
    if (p.sku) allSkus.add(p.sku.toLowerCase())
    if (p.variants) {
      for (const v of p.variants) {
        if (v.sku) allSkus.add(v.sku.toLowerCase())
      }
    }
  }

  // Check collision with parent SKU
  assert.strictEqual(allSkus.has('tupi-cl-wht'), true)
  // Check collision with variant SKU
  assert.strictEqual(allSkus.has('tupi-pc-001-54'), true)
  // Non-colliding SKU
  assert.strictEqual(allSkus.has('tupi-new-001'), false)
})

// Test 5: Duplicate attribute combinations detection
test('Detects duplicate attribute combinations for the same product', () => {
  const variants = [
    { attributes: { Size: '54', Color: 'White' } },
    { attributes: { Color: 'white', Size: '54' } } // Exact same combination with different key order & casing
  ]

  const keys = variants.map(v => canonicalAttributeKey(v.attributes))
  assert.strictEqual(keys[0], keys[1])
  assert.strictEqual(keys[0], 'color=white::size=54')
})

// Test 6: Cart Item Composite Identity
function getCartItemKey(productId, variantId) {
  return `${productId}::${variantId || 'default'}`
}

function sanitizeCartItems(raw) {
  if (!Array.isArray(raw)) return []
  const map = new Map()

  for (const item of raw) {
    if (
      item &&
      typeof item === 'object' &&
      typeof item.productId === 'string' &&
      item.productId.trim() &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    ) {
      const pid = item.productId.trim()
      const vid = typeof item.variantId === 'string' && item.variantId.trim() ? item.variantId.trim() : undefined
      const key = getCartItemKey(pid, vid)
      const qty = item.quantity

      const existing = map.get(key)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + qty, 999)
      } else {
        map.set(key, { productId: pid, variantId: vid, quantity: Math.min(qty, 999) })
      }
    }
  }
  return Array.from(map.values())
}

test('Cart handles composite keys: different variants create separate cart lines, same variant aggregates quantity', () => {
  const rawCart = [
    { productId: 'p-3', variantId: 'v-52', quantity: 1 },
    { productId: 'p-3', variantId: 'v-54', quantity: 2 },
    { productId: 'p-3', variantId: 'v-52', quantity: 2 }, // Same variant -> aggregates with line 1 to quantity 3
    { productId: 'p-1', quantity: 1 }                     // Simple product
  ]

  const sanitized = sanitizeCartItems(rawCart)

  assert.deepStrictEqual(sanitized, [
    { productId: 'p-3', variantId: 'v-52', quantity: 3 },
    { productId: 'p-3', variantId: 'v-54', quantity: 2 },
    { productId: 'p-1', variantId: undefined, quantity: 1 }
  ])
})

// Test 7: Variant Enriched Cart calculation, subtotal, and stock clamping
test('Calculates variant line totals, respects variant sale price, and excludes unavailable variants', () => {
  const catalog = [
    {
      id: 'p-1',
      name: 'Classic White Tupi',
      price: 1250,
      salePrice: null,
      stock: 100,
      active: true,
      hasVariants: false
    },
    {
      id: 'p-3',
      name: 'Signature Tupi',
      hasVariants: true,
      active: true,
      variants: [
        { id: 'v-52', sku: 'TUPI-SIG-52', attributes: { Size: '52' }, price: 1650, salePrice: null, stock: 25, active: true },
        { id: 'v-54', sku: 'TUPI-SIG-54', attributes: { Size: '54' }, price: 1650, salePrice: 1450, stock: 15, active: true },
        { id: 'v-inactive', sku: 'TUPI-SIG-INACT', attributes: { Size: '58' }, price: 1750, stock: 5, active: false }
      ]
    }
  ]

  const catalogMap = new Map(catalog.map(p => [p.id, p]))

  function enrichItem(item) {
    const product = catalogMap.get(item.productId)
    if (!product || product.active === false) {
      return { lineTotal: 0, isUnavailable: true }
    }

    if (product.hasVariants) {
      const variant = product.variants?.find(v => v.id === item.variantId)
      if (!variant || variant.active === false) {
        return { lineTotal: 0, isUnavailable: true }
      }
      const hasSale = typeof variant.salePrice === 'number' && variant.salePrice >= 0 && variant.salePrice < variant.price
      const effectivePrice = hasSale ? variant.salePrice : variant.price
      return {
        effectivePrice,
        lineTotal: effectivePrice * item.quantity,
        isUnavailable: false,
        selectedAttributes: variant.attributes
      }
    }

    const hasSale = typeof product.salePrice === 'number' && product.salePrice >= 0 && product.salePrice < product.price
    const effectivePrice = hasSale ? product.salePrice : product.price
    return {
      effectivePrice,
      lineTotal: effectivePrice * item.quantity,
      isUnavailable: false
    }
  }

  const cart = [
    { productId: 'p-1', quantity: 2 },                           // 1250 * 2 = 2500
    { productId: 'p-3', variantId: 'v-52', quantity: 1 },         // 1650 * 1 = 1650
    { productId: 'p-3', variantId: 'v-54', quantity: 2 },         // 1450 (sale) * 2 = 2900
    { productId: 'p-3', variantId: 'v-inactive', quantity: 1 }    // Inactive variant = 0
  ]

  const enriched = cart.map(enrichItem)
  const subtotal = enriched.reduce((sum, i) => sum + i.lineTotal, 0)

  assert.strictEqual(enriched[0].lineTotal, 2500)
  assert.strictEqual(enriched[1].lineTotal, 1650)
  assert.strictEqual(enriched[2].lineTotal, 2900)
  assert.strictEqual(enriched[3].lineTotal, 0)
  assert.strictEqual(enriched[3].isUnavailable, true)
  assert.strictEqual(subtotal, 7050)
})

console.log(`\n====================================================`)
console.log(`ALL TESTS COMPLETED: ${passed}/${total} PASSED`)
console.log(`====================================================`)

if (passed !== total) process.exit(1)
