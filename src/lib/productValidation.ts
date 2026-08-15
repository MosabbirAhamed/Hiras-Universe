import type { Category, Product, ProductAttribute, ProductVariant } from '../types/models'

export type ProductValidationResult =
  | { ok: true; product: Product }
  | { ok: false; errors: Record<string, string> }

const DEFAULT_CURRENCY = 'BDT'

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function optionalString(value: unknown) {
  const text = stringValue(value)
  return text || undefined
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : Number.NaN
}

function booleanValue(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function listValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean)
  return []
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueSlug(base: string, products: Product[], currentId?: string) {
  const root = base || 'product'
  let candidate = root
  let i = 2
  while (products.some((product) => product.id !== currentId && product.slug === candidate)) {
    candidate = `${root}-${i}`
    i += 1
  }
  return candidate
}

export function generateVariantSku(parentSku: string, attributes: Record<string, string>): string {
  const base = stringValue(parentSku).toUpperCase() || 'PROD'
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

export function canonicalAttributeKey(attributes: Record<string, string> = {}): string {
  const sortedKeys = Object.keys(attributes).sort()
  return sortedKeys.map((k) => `${k.trim().toLowerCase()}=${String(attributes[k]).trim().toLowerCase()}`).join('::')
}

function stockStatus(stock = 0, lowStockThreshold = 0): Product['stockStatus'] {
  if (stock <= 0) return 'out_of_stock'
  if (lowStockThreshold > 0 && stock <= lowStockThreshold) return 'low_stock'
  return 'in_stock'
}

export function normalizeProduct(product: Product, products: Product[] = []): Product {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : []
  const slug = product.slug || uniqueSlug(slugify(product.name || product.id), products, product.id)
  const lowStockThreshold = product.lowStockThreshold ?? 0
  const hasVariants = Boolean(product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0)

  let normalizedVariants: ProductVariant[] = []
  let normalizedAttributes: ProductAttribute[] = []
  let derivedStock = product.stock ?? 0
  let derivedPrice = product.price ?? 0

  if (hasVariants && Array.isArray(product.variants)) {
    normalizedAttributes = Array.isArray(product.attributes)
      ? product.attributes.map((attr, idx) => ({
          id: attr.id || `attr-${idx + 1}`,
          name: stringValue(attr.name),
          values: Array.isArray(attr.values) ? attr.values.map(stringValue).filter(Boolean) : []
        }))
      : []

    normalizedVariants = product.variants.map((v, idx) => {
      const vStock = typeof v.stock === 'number' ? Math.max(0, v.stock) : 0
      const vLowStockThreshold = v.lowStockThreshold ?? 0
      const vPrice = typeof v.price === 'number' ? v.price : product.price ?? 0
      const vSalePrice =
        typeof v.salePrice === 'number' && v.salePrice >= 0 && v.salePrice < vPrice ? v.salePrice : null

      return {
        id: v.id || `var-${idx + 1}`,
        sku: stringValue(v.sku) || generateVariantSku(product.sku || product.name, v.attributes || {}),
        attributes: v.attributes || {},
        price: vPrice,
        salePrice: vSalePrice,
        costPrice: typeof v.costPrice === 'number' ? v.costPrice : null,
        stock: vStock,
        lowStockThreshold: vLowStockThreshold,
        stockStatus: v.stockStatus || stockStatus(vStock, vLowStockThreshold),
        image: optionalString(v.image) || undefined,
        active: v.active !== false
      }
    })

    const activeVariants = normalizedVariants.filter((v) => v.active)
    derivedStock = activeVariants.reduce((sum, v) => sum + v.stock, 0)
    if (activeVariants.length > 0) {
      derivedPrice = Math.min(...activeVariants.map((v) => v.price))
    }
  }

  const computedStockStatus = stockStatus(derivedStock, lowStockThreshold)

  return {
    ...product,
    slug,
    hasVariants,
    attributes: normalizedAttributes,
    variants: normalizedVariants,
    price: derivedPrice,
    currency: product.currency || DEFAULT_CURRENCY,
    images,
    primaryImage: product.primaryImage || images[0],
    stock: derivedStock,
    lowStockThreshold,
    stockStatus: product.stockStatus || computedStockStatus,
    onSale:
      product.onSale ??
      (hasVariants
        ? normalizedVariants.some((v) => v.active && typeof v.salePrice === 'number' && v.salePrice < v.price)
        : typeof product.salePrice === 'number' && product.salePrice < product.price),
    visibility: product.visibility || (product.active === false ? 'hidden' : 'public'),
    active: product.active ?? true
  }
}

export function validateProductWrite(
  input: Partial<Product>,
  products: Product[],
  categories: Category[],
  currentId?: string
): ProductValidationResult {
  const errors: Record<string, string> = {}
  const name = stringValue(input.name)
  const slugSource = stringValue(input.slug) || name
  const slug = slugify(slugSource)
  const sku = optionalString(input.sku)
  const categoryId = optionalString(input.categoryId)
  const images = listValue(input.images)
  const primaryImage = optionalString(input.primaryImage) || images[0]
  const hasVariants = Boolean(input.hasVariants)
  const lowStockThreshold = optionalNumber(input.lowStockThreshold) ?? 0
  const weight = optionalNumber(input.weight)

  if (!name) errors.name = 'Product name is required.'
  if (!slug) errors.slug = 'Slug is required.'
  if (slug && products.some((product) => product.id !== currentId && product.slug === slug)) {
    errors.slug = 'Slug must be unique.'
  }
  if (categoryId && !categories.some((category) => category.id === categoryId)) {
    errors.categoryId = 'Selected category does not exist.'
  }
  if (primaryImage && !images.includes(primaryImage)) {
    errors.primaryImage = 'Primary image must be part of the product gallery.'
  }
  if (Number.isNaN(lowStockThreshold) || lowStockThreshold < 0) {
    errors.lowStockThreshold = 'Low stock threshold cannot be negative.'
  }
  if (weight !== null && (Number.isNaN(weight) || weight < 0)) {
    errors.weight = 'Weight must be a valid non-negative number.'
  }

  // Collect all existing catalog SKUs for catalog-wide uniqueness check
  const otherSkus = new Set<string>()
  for (const p of products) {
    if (p.id !== currentId) {
      if (p.sku) otherSkus.add(p.sku.toLowerCase())
      if (Array.isArray(p.variants)) {
        for (const v of p.variants) {
          if (v.sku) otherSkus.add(v.sku.toLowerCase())
        }
      }
    }
  }

  if (sku && otherSkus.has(sku.toLowerCase())) {
    errors.sku = `SKU "${sku}" is already in use by another product or variant.`
  }

  let cleanPrice = 0
  let cleanSalePrice: number | null = null
  let cleanCostPrice: number | null = null
  let cleanStock = 0
  let cleanAttributes: ProductAttribute[] = []
  let cleanVariants: ProductVariant[] = []

  if (!hasVariants) {
    // --- SIMPLE PRODUCT VALIDATION ---
    const price = optionalNumber(input.price)
    const salePrice = optionalNumber(input.salePrice)
    const costPrice = optionalNumber(input.costPrice)
    const stock = optionalNumber(input.stock) ?? 0

    if (price === null || Number.isNaN(price) || price < 0) {
      errors.price = 'Price must be a valid non-negative number.'
    }
    if (salePrice !== null && (Number.isNaN(salePrice) || salePrice < 0)) {
      errors.salePrice = 'Sale price must be a valid non-negative number.'
    }
    if (typeof price === 'number' && typeof salePrice === 'number' && salePrice >= price) {
      errors.salePrice = 'Sale price must be less than regular price.'
    }
    if (costPrice !== null && (Number.isNaN(costPrice) || costPrice < 0)) {
      errors.costPrice = 'Cost price must be a valid non-negative number.'
    }
    if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      errors.stock = 'Stock must be a non-negative integer.'
    }

    cleanPrice = Number(price || 0)
    cleanSalePrice = salePrice === null ? null : Number(salePrice)
    cleanCostPrice = costPrice === null ? null : Number(costPrice)
    cleanStock = Number(stock || 0)
  } else {
    // --- VARIANT PRODUCT VALIDATION ---
    const rawAttributes = Array.isArray(input.attributes) ? input.attributes : []
    const rawVariants = Array.isArray(input.variants) ? input.variants : []

    if (rawAttributes.length === 0) {
      errors.attributes = 'At least one attribute (e.g. Size, Color) is required for variant products.'
    }

    const seenAttrNames = new Set<string>()
    cleanAttributes = rawAttributes.map((attr, idx) => {
      const aName = stringValue(attr.name)
      if (!aName) {
        errors[`attr_${idx}_name`] = `Attribute #${idx + 1} name is required.`
      }
      if (seenAttrNames.has(aName.toLowerCase())) {
        errors[`attr_${idx}_name`] = `Duplicate attribute name "${aName}".`
      }
      seenAttrNames.add(aName.toLowerCase())

      const values = listValue(attr.values)
      if (values.length === 0) {
        errors[`attr_${idx}_values`] = `Attribute "${aName || idx + 1}" must have at least one value.`
      }
      const uniqueValues = Array.from(new Set(values))

      return {
        id: attr.id || `attr-${idx + 1}`,
        name: aName,
        values: uniqueValues
      }
    })

    if (rawVariants.length === 0) {
      errors.variants = 'At least one variant combination is required.'
    }

    const seenVariantSkus = new Set<string>()
    if (sku) seenVariantSkus.add(sku.toLowerCase())

    const seenCombinations = new Set<string>()

    cleanVariants = rawVariants.map((v, idx) => {
      const vSku = stringValue(v.sku) || generateVariantSku(sku || name, v.attributes || {})
      const vPrice = optionalNumber(v.price)
      const vSalePrice = optionalNumber(v.salePrice)
      const vCostPrice = optionalNumber(v.costPrice)
      const vStock = optionalNumber(v.stock) ?? 0
      const vLowStockThreshold = optionalNumber(v.lowStockThreshold) ?? 0
      const vActive = v.active !== false

      if (!vSku) {
        errors[`variant_${idx}_sku`] = `Variant #${idx + 1} SKU is required.`
      } else {
        const lowerSku = vSku.toLowerCase()
        if (seenVariantSkus.has(lowerSku) || otherSkus.has(lowerSku)) {
          errors[`variant_${idx}_sku`] = `SKU "${vSku}" is already used.`
        }
        seenVariantSkus.add(lowerSku)
      }

      if (vPrice === null || Number.isNaN(vPrice) || vPrice < 0) {
        errors[`variant_${idx}_price`] = `Variant #${idx + 1} price must be a valid non-negative number.`
      }
      if (vSalePrice !== null && (Number.isNaN(vSalePrice) || vSalePrice < 0)) {
        errors[`variant_${idx}_salePrice`] = `Variant #${idx + 1} sale price must be a non-negative number.`
      }
      if (typeof vPrice === 'number' && typeof vSalePrice === 'number' && vSalePrice >= vPrice) {
        errors[`variant_${idx}_salePrice`] = `Variant #${idx + 1} sale price must be less than regular price.`
      }
      if (vCostPrice !== null && (Number.isNaN(vCostPrice) || vCostPrice < 0)) {
        errors[`variant_${idx}_costPrice`] = `Variant #${idx + 1} cost price must be a valid non-negative number.`
      }
      if (Number.isNaN(vStock) || vStock < 0 || !Number.isInteger(vStock)) {
        errors[`variant_${idx}_stock`] = `Variant #${idx + 1} stock must be a non-negative integer.`
      }

      // Check attribute combination
      const comboKey = canonicalAttributeKey(v.attributes || {})
      if (!comboKey) {
        errors[`variant_${idx}_attributes`] = `Variant #${idx + 1} attributes are missing.`
      } else if (seenCombinations.has(comboKey)) {
        errors[`variant_${idx}_combo`] = `Duplicate variant combination for attributes: ${JSON.stringify(v.attributes)}`
      }
      seenCombinations.add(comboKey)

      const cleanVPrice = Number(vPrice || 0)
      const cleanVSalePrice = vSalePrice === null ? null : Number(vSalePrice)
      const cleanVCostPrice = vCostPrice === null ? null : Number(vCostPrice)
      const cleanVStock = Number(vStock || 0)

      return {
        id: v.id || `var-${Date.now().toString(36)}-${idx + 1}`,
        sku: vSku,
        attributes: v.attributes || {},
        price: cleanVPrice,
        salePrice: cleanVSalePrice,
        costPrice: cleanVCostPrice,
        stock: cleanVStock,
        lowStockThreshold: Number(vLowStockThreshold || 0),
        stockStatus: stockStatus(cleanVStock, Number(vLowStockThreshold || 0)),
        image: optionalString(v.image) || undefined,
        active: vActive
      }
    })

    const activeVariants = cleanVariants.filter((v) => v.active)
    cleanStock = activeVariants.reduce((sum, v) => sum + v.stock, 0)
    cleanPrice = activeVariants.length > 0 ? Math.min(...activeVariants.map((v) => v.price)) : 0
    cleanSalePrice = null
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const cleanLowStockThreshold = Number(lowStockThreshold)
  const cleanWeight = weight === null ? null : Number(weight)
  const dimensions =
    typeof input.dimensions === 'object' && input.dimensions
      ? {
          length: optionalNumber(input.dimensions.length),
          width: optionalNumber(input.dimensions.width),
          height: optionalNumber(input.dimensions.height),
          unit: optionalString(input.dimensions.unit) || 'cm'
        }
      : undefined

  const computedStockStatus = stockStatus(cleanStock, cleanLowStockThreshold)

  return {
    ok: true,
    product: {
      id: input.id || '',
      name,
      slug,
      description: optionalString(input.description),
      shortDescription: optionalString(input.shortDescription),
      hasVariants,
      attributes: cleanAttributes,
      variants: cleanVariants,
      sku,
      price: cleanPrice,
      salePrice: cleanSalePrice,
      costPrice: cleanCostPrice,
      currency: optionalString(input.currency) || DEFAULT_CURRENCY,
      stock: cleanStock,
      lowStockThreshold: cleanLowStockThreshold,
      stockStatus: computedStockStatus,
      categoryId,
      brand: optionalString(input.brand),
      tags: listValue(input.tags),
      images,
      primaryImage,
      featured: booleanValue(input.featured),
      newArrival: booleanValue(input.newArrival),
      bestseller: booleanValue(input.bestseller),
      onSale: hasVariants
        ? cleanVariants.some((v) => v.active && typeof v.salePrice === 'number' && v.salePrice < v.price)
        : cleanSalePrice !== null && cleanSalePrice < cleanPrice,
      active: input.visibility === 'hidden' ? false : booleanValue(input.active, true),
      visibility: input.visibility === 'hidden' ? 'hidden' : 'public',
      sortOrder: optionalNumber(input.sortOrder) ?? 0,
      weight: cleanWeight,
      dimensions,
      seoTitle: optionalString(input.seoTitle),
      seoDescription: optionalString(input.seoDescription),
      seoKeywords: listValue(input.seoKeywords),
      canonicalUrl: optionalString(input.canonicalUrl)
    }
  }
}
