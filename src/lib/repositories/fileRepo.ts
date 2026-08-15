import { promises as fs } from 'fs'
import path from 'path'
import { Product, Category, HomepageSection, Order, OrderStatus, PaymentStatus, NotificationLogEntry } from '../../types/models'
import { normalizeProduct } from '../productValidation'
import { calculateAndValidateOrderItems, ValidatedCheckoutData } from '../orderValidation'

const dataPath = path.join(process.cwd(), 'data')

async function readJson<T>(name: string, fallback: T): Promise<T> {
  const p = path.join(dataPath, name)
  try {
    const raw = await fs.readFile(p, 'utf-8')
    return JSON.parse(raw) as T
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return fallback
    }
    throw err
  }
}

async function writeJson<T>(name: string, data: T) {
  const p = path.join(dataPath, name)
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf-8')
}

// In-process serialized async queue lock for order creation and stock updates
let orderLockChain: Promise<any> = Promise.resolve()

function withOrderLock<T>(action: () => Promise<T>): Promise<T> {
  const next = orderLockChain.then(() => action())
  orderLockChain = next.catch(() => {})
  return next
}

// ----------------------------------------------------
// PRODUCTS REPOSITORY
// ----------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  const products = await readJson<Product[]>('products.json', [])
  return products.map((product) => normalizeProduct(product, products))
}

export async function saveProducts(products: Product[]) {
  return writeJson('products.json', products)
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts()
  return products.find((p) => p.id === id)
}

export async function createProduct(p: Product) {
  const products = await getProducts()
  products.push(p)
  await saveProducts(products)
  return p
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  const products = await getProducts()
  const idx = products.findIndex((x) => x.id === id)
  if (idx === -1) return null
  products[idx] = { ...products[idx], ...patch }
  await saveProducts(products)
  return products[idx]
}

export async function deleteProduct(id: string) {
  const products = await getProducts()
  const next = products.filter((p) => p.id !== id)
  await saveProducts(next)
  return true
}

// ----------------------------------------------------
// CATEGORIES REPOSITORY
// ----------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  return readJson<Category[]>('categories.json', [])
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const categories = await getCategories()
  return categories.find((c) => c.id === id)
}

export async function saveCategories(categories: Category[]) {
  return writeJson('categories.json', categories)
}

// ----------------------------------------------------
// HOMEPAGE & NAVIGATION
// ----------------------------------------------------

export async function getHomepageSections(): Promise<HomepageSection[]> {
  return readJson<HomepageSection[]>('homepage.json', [])
}

export async function saveHomepageSections(sections: HomepageSection[]) {
  return writeJson('homepage.json', sections)
}

export async function getNavigation() {
  return readJson<any[]>('navigation.json', [])
}

export async function saveNavigation(nav: any[]) {
  return writeJson('navigation.json', nav)
}

// ----------------------------------------------------
// SETTINGS & THEME
// ----------------------------------------------------

export type StoreSettings = {
  storeName?: string
  description?: string
  contactEmail?: string
  supportEmail?: string
  phone?: string
  address?: string
  currency?: string
  currencySymbol?: string
  social?: { facebook?: string; instagram?: string; tiktok?: string; youtube?: string; whatsapp?: string }
  footerText?: string
  defaultSeo?: { title?: string; description?: string; ogImage?: string }
  logo?: string
  favicon?: string
}

export async function getSettings(): Promise<StoreSettings> {
  return readJson<StoreSettings>('settings.json', {})
}

export async function saveSettings(s: StoreSettings) {
  return writeJson('settings.json', s)
}

export async function getTheme() {
  return readJson<any>('theme.json', null)
}

export async function saveTheme(t: any) {
  return writeJson('theme.json', t)
}

// ----------------------------------------------------
// PAGES CMS
// ----------------------------------------------------

export type PageRecord = {
  id: string
  title: string
  slug: string
  content?: string
  status?: 'draft' | 'published' | 'archived'
  seo?: { title?: string; description?: string }
  createdAt?: string
  updatedAt?: string
}

export async function getPages(): Promise<PageRecord[]> {
  return readJson<PageRecord[]>('pages.json', [])
}

export async function savePages(pages: PageRecord[]) {
  return writeJson('pages.json', pages)
}

export async function getPageById(id: string) {
  const pages = await getPages()
  return pages.find((p) => p.id === id)
}

export async function getPageBySlug(slug: string) {
  const pages = await getPages()
  return pages.find((p) => p.slug === slug)
}

export async function createPage(p: PageRecord) {
  const pages = await getPages()
  pages.push(p)
  await savePages(pages)
  return p
}

export async function updatePage(id: string, patch: Partial<PageRecord>) {
  const pages = await getPages()
  const idx = pages.findIndex((x) => x.id === id)
  if (idx === -1) return null
  pages[idx] = { ...pages[idx], ...patch, updatedAt: new Date().toISOString() }
  await savePages(pages)
  return pages[idx]
}

export async function deletePage(id: string) {
  const pages = await getPages()
  const next = pages.filter((p) => p.id !== id)
  await savePages(next)
  return true
}

// ----------------------------------------------------
// ORDERS REPOSITORY
// ----------------------------------------------------

export async function getOrders(): Promise<Order[]> {
  return readJson<Order[]>('orders.json', [])
}

export async function saveOrders(orders: Order[]) {
  return writeJson('orders.json', orders)
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const orders = await getOrders()
  return orders.find((o) => o.id === id)
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const orders = await getOrders()
  return orders.find((o) => o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase())
}

/**
 * Generate sequential, unique customer-facing order numbers: HN-1001, HN-1002...
 * Scans all existing orders for the highest numerical suffix to prevent collisions.
 */
export function generateNextOrderNumber(orders: Order[]): string {
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

function computeProductStockStatus(stock: number, lowStockThreshold = 0): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (stock <= 0) return 'out_of_stock'
  if (lowStockThreshold > 0 && stock <= lowStockThreshold) return 'low_stock'
  return 'in_stock'
}

/**
 * Atomic Order Creation with Authoritative Server-Side Inventory Deduction.
 * Runs inside the in-process serialization lock.
 */
export async function createOrderWithInventoryDeduction(checkoutData: ValidatedCheckoutData): Promise<Order> {
  return withOrderLock(async () => {
    // 1. Load latest catalog & existing orders
    const products = await getProducts()
    const orders = await getOrders()

    // 2. Authoritative server-side price & stock validation
    const calc = calculateAndValidateOrderItems(checkoutData.items, products, checkoutData.district)
    if (!calc.ok) {
      throw new Error(calc.error)
    }

    // 3. Deduct inventory from products
    const productsMap = new Map(products.map((p) => [p.id, p]))

    for (const item of checkoutData.items) {
      const product = productsMap.get(item.productId)
      if (!product) continue

      if (product.hasVariants && Array.isArray(product.variants) && item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId)
        if (variant) {
          const currentVariantStock = typeof variant.stock === 'number' ? variant.stock : 0
          variant.stock = Math.max(0, currentVariantStock - item.quantity)
          variant.stockStatus = computeProductStockStatus(variant.stock, variant.lowStockThreshold)
        }

        // Recalculate parent product derived stock from active variants
        const activeVariants = product.variants.filter((v) => v.active !== false)
        const derivedStock = activeVariants.reduce((sum, v) => sum + (typeof v.stock === 'number' ? v.stock : 0), 0)
        product.stock = derivedStock
        product.stockStatus = computeProductStockStatus(derivedStock, product.lowStockThreshold)
      } else {
        const currentStock = typeof product.stock === 'number' ? product.stock : 0
        const nextStock = Math.max(0, currentStock - item.quantity)
        product.stock = nextStock
        product.stockStatus = computeProductStockStatus(nextStock, product.lowStockThreshold)
      }
    }

    // 4. Persist updated product catalog
    await saveProducts(Array.from(productsMap.values()))

    // 5. Generate unique Order ID & Order Number
    const nowIso = new Date().toISOString()
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const orderNumber = generateNextOrderNumber(orders)

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customer: {
        fullName: checkoutData.fullName,
        phone: checkoutData.phone,
        email: checkoutData.email
      },
      shippingAddress: {
        fullName: checkoutData.fullName,
        phone: checkoutData.phone,
        email: checkoutData.email,
        district: checkoutData.district,
        thana: checkoutData.thana,
        deliveryAddress: checkoutData.deliveryAddress,
        deliveryNotes: checkoutData.deliveryNotes
      },
      items: calc.items,
      subtotal: calc.subtotal,
      deliveryCharge: calc.deliveryCharge,
      discountTotal: calc.discountTotal,
      total: calc.total,
      currency: 'BDT',
      paymentMethod: checkoutData.paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      paymentDetails: checkoutData.paymentDetails,
      stockDeducted: true,
      createdAt: nowIso,
      updatedAt: nowIso
    }

    // 6. Save order
    orders.unshift(newOrder)
    await saveOrders(orders)

    return newOrder
  })
}

/**
 * Update Order Status & Payment Status with Safe Idempotent Inventory Restock on Cancellation.
 * Runs inside serialization lock.
 */
export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  nextPaymentStatus?: PaymentStatus,
  adminNotes?: string
): Promise<Order | null> {
  return withOrderLock(async () => {
    const orders = await getOrders()
    const idx = orders.findIndex((o) => o.id === orderId)
    if (idx === -1) return null

    const order = orders[idx]
    const previousStatus = order.orderStatus

    // Disallow invalid transition from cancelled back to active without explicit workflow
    if (previousStatus === 'cancelled' && nextStatus !== 'cancelled') {
      throw new Error('Cancelled orders cannot be reopened directly.')
    }

    // Handle Idempotent Inventory Restock on Cancellation
    if (nextStatus === 'cancelled' && previousStatus !== 'cancelled' && order.stockDeducted) {
      const products = await getProducts()
      const productsMap = new Map(products.map((p) => [p.id, p]))

      for (const item of order.items) {
        const product = productsMap.get(item.productId)
        if (!product) continue

        if (product.hasVariants && Array.isArray(product.variants) && item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId)
          if (variant) {
            variant.stock = (typeof variant.stock === 'number' ? variant.stock : 0) + item.quantity
            variant.stockStatus = computeProductStockStatus(variant.stock, variant.lowStockThreshold)
          }

          const activeVariants = product.variants.filter((v) => v.active !== false)
          const derivedStock = activeVariants.reduce((sum, v) => sum + (typeof v.stock === 'number' ? v.stock : 0), 0)
          product.stock = derivedStock
          product.stockStatus = computeProductStockStatus(derivedStock, product.lowStockThreshold)
        } else {
          const currentStock = typeof product.stock === 'number' ? product.stock : 0
          product.stock = currentStock + item.quantity
          product.stockStatus = computeProductStockStatus(product.stock, product.lowStockThreshold)
        }
      }

      await saveProducts(Array.from(productsMap.values()))
      order.stockDeducted = false
    }

    order.orderStatus = nextStatus
    if (nextPaymentStatus) {
      order.paymentStatus = nextPaymentStatus
    }
    if (typeof adminNotes === 'string') {
      order.adminNotes = adminNotes
    }
    order.updatedAt = new Date().toISOString()

    orders[idx] = order
    await saveOrders(orders)
    return order
  })
}

// ----------------------------------------------------
// NOTIFICATIONS REPOSITORY
// ----------------------------------------------------

export async function getNotificationLogs(): Promise<NotificationLogEntry[]> {
  return readJson<NotificationLogEntry[]>('notifications.json', [])
}

export async function saveNotificationLogs(logs: NotificationLogEntry[]): Promise<void> {
  return writeJson('notifications.json', logs)
}

export async function logNotification(entry: NotificationLogEntry): Promise<void> {
  try {
    const logs = await getNotificationLogs()
    logs.unshift(entry)
    // Keep max 500 latest entries to prevent unbounded growth in JSON storage
    const trimmed = logs.slice(0, 500)
    await saveNotificationLogs(trimmed)
  } catch (err) {
    // Non-blocking log safety - never crash application if log write encounters disk error
    console.error('[NotificationLog] Failed to persist notification log entry:', err)
  }
}

export async function getNotificationsByOrderNumber(orderNumber: string): Promise<NotificationLogEntry[]> {
  const logs = await getNotificationLogs()
  const cleanOrderNum = orderNumber.trim().toUpperCase()
  return logs.filter((log) => log.orderNumber.toUpperCase() === cleanOrderNum)
}

export {}
