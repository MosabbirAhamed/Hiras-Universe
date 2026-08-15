import type {
  ID,
  OrderItemSnapshot,
  PaymentMethod,
  Product,
  ProductVariant
} from '../types/models'
import { isValidDistrict, normalizeDistrictName, getDeliveryCharge } from './geo/bangladesh'

export type RawOrderItemInput = {
  productId: ID
  variantId?: ID
  quantity: number
}

export type RawCheckoutInput = {
  fullName: string
  phone: string
  email?: string
  district: string
  thana: string
  deliveryAddress: string
  deliveryNotes?: string
  paymentMethod: PaymentMethod
  paymentDetails?: {
    senderNumber?: string
    transactionId?: string
    notes?: string
  }
  items: RawOrderItemInput[]
}

export type ValidatedCheckoutData = {
  fullName: string
  phone: string
  email?: string
  district: string
  thana: string
  deliveryAddress: string
  deliveryNotes?: string
  paymentMethod: PaymentMethod
  paymentDetails?: {
    senderNumber?: string
    transactionId?: string
    notes?: string
  }
  items: RawOrderItemInput[]
}

export type CheckoutValidationResult =
  | { ok: true; data: ValidatedCheckoutData }
  | { ok: false; errors: Record<string, string>; message: string }

export type OrderCalculationResult =
  | {
      ok: true
      items: OrderItemSnapshot[]
      subtotal: number
      deliveryCharge: number
      discountTotal: number
      total: number
      productStockUpdates: Map<string, { product: Product; variantId?: string; deductedStock: number }>
    }
  | {
      ok: false
      error: string
      fieldErrors?: Record<string, string>
    }

/**
 * Sanitize text input: removes HTML tags while preserving Bangla & Unicode text.
 */
export function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '') // Strip control chars
    .trim()
}

/**
 * Normalize and validate Bangladesh mobile phone numbers.
 * Supports 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX with spaces/hyphens.
 * Returns 11-digit string (e.g. "01712345678") or null if invalid.
 */
export function normalizeAndValidateBdPhone(rawPhone: unknown): string | null {
  if (typeof rawPhone !== 'string') return null

  // Remove non-digit characters except leading +
  let cleaned = rawPhone.trim().replace(/[\s\-()]/g, '')

  if (cleaned.startsWith('+88')) {
    cleaned = cleaned.slice(3)
  } else if (cleaned.startsWith('88')) {
    cleaned = cleaned.slice(2)
  }

  // Bangladesh mobile numbers: exactly 11 digits starting with 013, 014, 015, 016, 017, 018, 019
  const bdPhoneRegex = /^01[3-9]\d{8}$/
  if (bdPhoneRegex.test(cleaned)) {
    return cleaned
  }

  return null
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validate customer checkout input before touching catalog or database.
 */
export function validateCheckoutInput(input: unknown): CheckoutValidationResult {
  const errors: Record<string, string> = {}

  if (!input || typeof input !== 'object') {
    return { ok: false, errors: { form: 'Invalid submission data.' }, message: 'Invalid submission data.' }
  }

  const raw = input as Partial<RawCheckoutInput>

  // 1. Full Name
  const fullName = sanitizeText(raw.fullName)
  if (!fullName || fullName.length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters).'
  }

  // 2. Phone
  const rawPhone = String(raw.phone || '')
  const validPhone = normalizeAndValidateBdPhone(rawPhone)
  if (!validPhone) {
    errors.phone = 'Please provide a valid 11-digit Bangladesh mobile number (e.g. 01712345678).'
  }

  // 3. Email (Optional)
  const email = sanitizeText(raw.email)
  if (email && !EMAIL_REGEX.test(email)) {
    errors.email = 'Please provide a valid email address.'
  }

  // 4. District
  const rawDistrict = sanitizeText(raw.district)
  if (!rawDistrict || !isValidDistrict(rawDistrict)) {
    errors.district = 'Please select a valid Bangladesh district.'
  }
  const district = normalizeDistrictName(rawDistrict)

  // 5. Thana / Upazila
  const thana = sanitizeText(raw.thana)
  if (!thana || thana.length < 2) {
    errors.thana = 'Thana / Upazila / Area is required.'
  }

  // 6. Delivery Address
  const deliveryAddress = sanitizeText(raw.deliveryAddress)
  if (!deliveryAddress || deliveryAddress.length < 5) {
    errors.deliveryAddress = 'Full street address is required (minimum 5 characters).'
  }

  // 7. Delivery Notes
  const deliveryNotes = sanitizeText(raw.deliveryNotes)

  // 8. Payment Method
  const validPaymentMethods: PaymentMethod[] = ['cod', 'bkash', 'nagad']
  const paymentMethod = (raw.paymentMethod || 'cod') as PaymentMethod
  if (!validPaymentMethods.includes(paymentMethod)) {
    errors.paymentMethod = 'Please choose a valid payment method.'
  }

  // 9. Payment Details (for manual bkash/nagad)
  let paymentDetails: RawCheckoutInput['paymentDetails'] = undefined
  if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
    const rawDetails = raw.paymentDetails || {}
    paymentDetails = {
      senderNumber: sanitizeText(rawDetails.senderNumber),
      transactionId: sanitizeText(rawDetails.transactionId),
      notes: sanitizeText(rawDetails.notes)
    }
  }

  // 10. Items
  const rawItems = Array.isArray(raw.items) ? raw.items : []
  if (rawItems.length === 0) {
    errors.items = 'Your shopping bag is empty.'
  }

  const cleanItems: RawOrderItemInput[] = []
  for (let i = 0; i < rawItems.length; i += 1) {
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
    return {
      ok: false,
      errors,
      message: 'Please review and fix the errors in the checkout form.'
    }
  }

  return {
    ok: true,
    data: {
      fullName,
      phone: validPhone!,
      email: email || undefined,
      district,
      thana,
      deliveryAddress,
      deliveryNotes: deliveryNotes || undefined,
      paymentMethod,
      paymentDetails,
      items: cleanItems
    }
  }
}

/**
 * Server-Side authoritative price, stock, and snapshot calculator.
 * Verifies live catalog stock and builds frozen OrderItemSnapshot records.
 */
export function calculateAndValidateOrderItems(
  items: RawOrderItemInput[],
  catalogProducts: Product[],
  district: string
): OrderCalculationResult {
  if (!isValidDistrict(district)) {
    return {
      ok: false,
      error: `Invalid district "${district}". Must be one of the 64 Bangladesh districts.`
    }
  }

  const productsMap = new Map(catalogProducts.map((p) => [p.id, p]))
  const snapshots: OrderItemSnapshot[] = []
  const productStockUpdates = new Map<string, { product: Product; variantId?: string; deductedStock: number }>()

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
      return {
        ok: false,
        error: `Invalid quantity "${item.quantity}". Quantity must be an integer between 1 and 10.`
      }
    }

    const product = productsMap.get(item.productId)

    // 1. Verify parent product existence and visibility
    if (!product) {
      return {
        ok: false,
        error: `Product with ID "${item.productId}" is no longer available in the catalog.`
      }
    }

    if (product.active === false || product.visibility === 'hidden') {
      return {
        ok: false,
        error: `"${product.name}" is currently unavailable for purchase.`
      }
    }

    // 2. Handle Variant Product
    if (product.hasVariants && Array.isArray(product.variants)) {
      if (!item.variantId) {
        return {
          ok: false,
          error: `Please select size/option for "${product.name}".`
        }
      }

      const variant: ProductVariant | undefined = product.variants.find((v) => v.id === item.variantId)
      if (!variant) {
        return {
          ok: false,
          error: `Selected option for "${product.name}" is no longer available.`
        }
      }

      if (variant.active === false) {
        return {
          ok: false,
          error: `Selected option for "${product.name}" (${variant.sku}) is currently deactivated.`
        }
      }

      const variantStock = typeof variant.stock === 'number' ? Math.max(0, variant.stock) : 0
      if (variant.stockStatus === 'out_of_stock' || variantStock <= 0) {
        return {
          ok: false,
          error: `"${product.name}" (${variant.sku}) is out of stock.`
        }
      }

      if (item.quantity > variantStock) {
        return {
          ok: false,
          error: `Only ${variantStock} unit(s) available for "${product.name}" (${variant.sku}). You requested ${item.quantity}.`
        }
      }

      // Calculate authoritative variant price
      const hasValidSalePrice = Boolean(
        typeof variant.salePrice === 'number' &&
          variant.salePrice >= 0 &&
          variant.salePrice < variant.price
      )
      const unitPrice = hasValidSalePrice ? (variant.salePrice as number) : variant.price
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
      // 3. Handle Simple Product
      const productStock = typeof product.stock === 'number' ? Math.max(0, product.stock) : 0
      if (product.stockStatus === 'out_of_stock' || productStock <= 0) {
        return {
          ok: false,
          error: `"${product.name}" is out of stock.`
        }
      }

      if (item.quantity > productStock) {
        return {
          ok: false,
          error: `Only ${productStock} unit(s) available for "${product.name}". You requested ${item.quantity}.`
        }
      }

      // Calculate authoritative simple price
      const hasValidSalePrice = Boolean(
        typeof product.salePrice === 'number' &&
          product.salePrice >= 0 &&
          product.salePrice < product.price
      )
      const unitPrice = hasValidSalePrice ? (product.salePrice as number) : product.price
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
