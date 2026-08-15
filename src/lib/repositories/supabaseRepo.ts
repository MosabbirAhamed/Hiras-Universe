/**
 * supabaseRepo.ts
 * Drop-in replacement for fileRepo.ts using Supabase PostgreSQL.
 * All exported function signatures are identical to fileRepo.ts.
 * Import from this file exactly as you did from fileRepo.ts.
 */
import { cache } from 'react'
import { getAdminClient } from '../supabase'
import { Product, Category, HomepageSection, Order, OrderStatus, PaymentStatus, NotificationLogEntry } from '../../types/models'
import { normalizeProduct } from '../productValidation'
import { calculateAndValidateOrderItems, ValidatedCheckoutData } from '../orderValidation'

// Re-export StoreSettings type (was defined in fileRepo.ts)
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

// Re-export PageRecord type (was defined in fileRepo.ts)
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

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Map snake_case DB row → camelCase Product */
function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    hasVariants: row.has_variants,
    attributes: row.attributes ?? [],
    variants: row.variants ?? [],
    price: Number(row.price),
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    costPrice: row.cost_price != null ? Number(row.cost_price) : null,
    sku: row.sku,
    stock: row.stock,
    lowStockThreshold: row.low_stock_threshold,
    stockStatus: row.stock_status,
    categoryId: row.category_id,
    images: row.images ?? [],
    primaryImage: row.primary_image,
    featured: row.featured,
    newArrival: row.new_arrival,
    bestseller: row.bestseller,
    onSale: row.on_sale,
    active: row.active,
    sortOrder: row.sort_order,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Map Product → snake_case DB upsert object */
function productToRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug ?? null,
    description: p.description ?? null,
    short_description: p.shortDescription ?? null,
    has_variants: p.hasVariants ?? false,
    attributes: p.attributes ?? [],
    variants: p.variants ?? [],
    price: p.price,
    sale_price: p.salePrice ?? null,
    cost_price: p.costPrice ?? null,
    sku: p.sku ?? null,
    stock: p.stock ?? 0,
    low_stock_threshold: p.lowStockThreshold ?? 0,
    stock_status: p.stockStatus ?? 'in_stock',
    category_id: p.categoryId ?? null,
    images: p.images ?? [],
    primary_image: p.primaryImage ?? null,
    featured: p.featured ?? false,
    new_arrival: p.newArrival ?? false,
    bestseller: p.bestseller ?? false,
    on_sale: p.onSale ?? false,
    active: p.active ?? true,
    sort_order: p.sortOrder ?? 0,
    seo_title: p.seoTitle ?? null,
    seo_description: p.seoDescription ?? null,
    updated_at: new Date().toISOString(),
  }
}

/** Map snake_case DB row → camelCase Order */
function rowToOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: row.customer,
    shippingAddress: row.shipping_address,
    items: row.items,
    subtotal: Number(row.subtotal),
    deliveryCharge: Number(row.delivery_charge),
    discountTotal: Number(row.discount_total),
    total: Number(row.total),
    currency: row.currency,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    paymentDetails: row.payment_details,
    adminNotes: row.admin_notes,
    stockDeducted: row.stock_deducted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function rowToPage(row: any): PageRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    status: row.status,
    seo: row.seo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────

export const getProducts = cache(async (): Promise<Product[]> => {
  const db = getAdminClient()
  const { data, error } = await db
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  const products = (data ?? []).map(rowToProduct)
  return products.map((p) => normalizeProduct(p, products))
})

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)))
  if (uniqueIds.length === 0) return []

  const db = getAdminClient()
  const { data, error } = await db
    .from('products')
    .select('*')
    .in('id', uniqueIds)
  if (error) throw new Error(error.message)
  const products = (data ?? []).map(rowToProduct)
  return products.map((product) => normalizeProduct(product, products))
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return undefined
  const all = await getProducts()
  return normalizeProduct(rowToProduct(data), all)
}

export async function createProduct(p: Product): Promise<Product> {
  const db = getAdminClient()
  const row = productToRow(p)
  const { data, error } = await db
    .from('products')
    .insert({ ...row, created_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return rowToProduct(data)
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
  const db = getAdminClient()
  // Build a partial row from only the patched fields
  const full = await getProductById(id)
  if (!full) return null
  const merged = { ...full, ...patch }
  const row = productToRow(merged)
  const { data, error } = await db
    .from('products')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return rowToProduct(data)
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = getAdminClient()
  const { error } = await db.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}

// saveProducts is used internally in the old file-based lock — no longer needed
// but kept as no-op to avoid import errors if anything still references it
// eslint-disable-next-line no-unused-vars
export async function saveProducts(_products: Product[]) {
  // No-op: individual updates are now atomic via Supabase
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export const getCategories = cache(async (): Promise<Category[]> => {
  const db = getAdminClient()
  const { data, error } = await db
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    image: r.image,
    active: r.active,
    sortOrder: r.sort_order,
  }))
})

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return undefined
  return { id: data.id, name: data.name, slug: data.slug, description: data.description, image: data.image, active: data.active, sortOrder: data.sort_order }
}

export async function saveCategories(categories: Category[]) {
  const db = getAdminClient()
  const rows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug ?? null,
    description: c.description ?? null,
    image: c.image ?? null,
    active: c.active ?? true,
    sort_order: c.sortOrder ?? 0,
  }))
  const { error } = await db.from('categories').upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

// ─── SETTINGS (all stored as keyed rows in `settings` table) ─────────────────

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  if (error || !data) return fallback
  return data.value as T
}

async function saveSetting(key: string, value: unknown) {
  const db = getAdminClient()
  const { error } = await db
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  return getSetting<HomepageSection[]>('homepage', [])
}

export async function saveHomepageSections(sections: HomepageSection[]) {
  return saveSetting('homepage', sections)
}

export async function getNavigation(): Promise<any[]> {
  return getSetting<any[]>('navigation', [])
}

export async function saveNavigation(nav: any[]) {
  return saveSetting('navigation', nav)
}

export async function getSettings(): Promise<StoreSettings> {
  return getSetting<StoreSettings>('store', {})
}

export async function saveSettings(s: StoreSettings) {
  return saveSetting('store', s)
}

export async function getTheme(): Promise<any> {
  return getSetting<any>('theme', null)
}

export async function saveTheme(t: any) {
  return saveSetting('theme', t)
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

export async function getPages(): Promise<PageRecord[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToPage)
}

export async function getPageById(id: string): Promise<PageRecord | undefined> {
  const db = getAdminClient()
  const { data, error } = await db.from('pages').select('*').eq('id', id).single()
  if (error) return undefined
  return rowToPage(data)
}

export async function getPageBySlug(slug: string): Promise<PageRecord | undefined> {
  const db = getAdminClient()
  const { data, error } = await db.from('pages').select('*').eq('slug', slug).single()
  if (error) return undefined
  return rowToPage(data)
}

export async function createPage(p: PageRecord): Promise<PageRecord> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('pages')
    .insert({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content ?? null,
      status: p.status ?? 'draft',
      seo: p.seo ?? {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return rowToPage(data)
}

export async function updatePage(id: string, patch: Partial<PageRecord>): Promise<PageRecord | null> {
  const db = getAdminClient()
  const updateData: any = { updated_at: new Date().toISOString() }
  if (patch.title !== undefined) updateData.title = patch.title
  if (patch.slug !== undefined) updateData.slug = patch.slug
  if (patch.content !== undefined) updateData.content = patch.content
  if (patch.status !== undefined) updateData.status = patch.status
  if (patch.seo !== undefined) updateData.seo = patch.seo
  const { data, error } = await db.from('pages').update(updateData).eq('id', id).select().single()
  if (error) return null
  return rowToPage(data)
}

export async function deletePage(id: string): Promise<boolean> {
  const db = getAdminClient()
  const { error } = await db.from('pages').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(rowToOrder)
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const db = getAdminClient()
  const { data, error } = await db.from('orders').select('*').eq('id', id).single()
  if (error) return undefined
  return rowToOrder(data)
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('orders')
    .select('*')
    .ilike('order_number', orderNumber.trim())
    .single()
  if (error) return undefined
  return rowToOrder(data)
}

// saveOrders — no-op shim (individual DB operations replace bulk saves)
// eslint-disable-next-line no-unused-vars
export async function saveOrders(_orders: Order[]) { }

// eslint-disable-next-line no-unused-vars
export function generateNextOrderNumber(_orders: Order[]): string {
  // Kept for signature compatibility — not needed with DB sequences.
  // The RPC function handles this atomically.
  return `HN-${Date.now()}`
}

/**
 * Atomic order creation with server-side inventory deduction via PostgreSQL RPC.
 * Replaces the in-process JS lock from fileRepo.ts.
 */
export async function createOrderWithInventoryDeduction(
  checkoutData: ValidatedCheckoutData
): Promise<Order> {
  // 1. Server-side price & stock validation (unchanged business logic)
  const db = getAdminClient()

  // Fetch products for validation
  const { data: productRows, error: pErr } = await db
    .from('products')
    .select('*')
  if (pErr) throw new Error(pErr.message)
  const products = (productRows ?? []).map(rowToProduct)

  const calc = calculateAndValidateOrderItems(
    checkoutData.items,
    products,
    checkoutData.district
  )
  if (!calc.ok) throw new Error(calc.error)

  // 2. Generate the order ID. The RPC allocates the order number transactionally.
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

  // 3. Call the PostgreSQL RPC for atomic inventory deduction + order insert
  const { data: orderData, error: rpcErr } = await db.rpc(
    'create_order_with_inventory_deduction',
    {
      p_order_id: orderId,
      p_order_number: '',
      p_customer: {
        fullName: checkoutData.fullName,
        phone: checkoutData.phone,
        email: checkoutData.email,
      },
      p_shipping: {
        fullName: checkoutData.fullName,
        phone: checkoutData.phone,
        email: checkoutData.email,
        district: checkoutData.district,
        thana: checkoutData.thana,
        deliveryAddress: checkoutData.deliveryAddress,
        deliveryNotes: checkoutData.deliveryNotes,
      },
      p_items: calc.items,
      p_subtotal: calc.subtotal,
      p_delivery: calc.deliveryCharge,
      p_discount: calc.discountTotal,
      p_total: calc.total,
      p_currency: 'BDT',
      p_payment_method: checkoutData.paymentMethod,
      p_payment_details: checkoutData.paymentDetails ?? null,
    }
  )
  if (rpcErr) throw new Error(rpcErr.message)

  return rowToOrder(orderData)
}

/**
 * Order status update with idempotent inventory restoration via PostgreSQL RPC.
 */
export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  nextPaymentStatus?: PaymentStatus,
  adminNotes?: string
): Promise<Order | null> {
  const db = getAdminClient()
  const { data, error } = await db.rpc('update_order_status', {
    p_order_id: orderId,
    p_next_status: nextStatus,
    p_next_payment: nextPaymentStatus ?? null,
    p_admin_notes: adminNotes ?? null,
  })
  if (error) {
    if (error.message.includes('order_not_found')) return null
    throw new Error(error.message)
  }
  return rowToOrder(data)
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export async function getNotificationLogs(): Promise<NotificationLogEntry[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('notification_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw new Error(error.message)
  return (data ?? []).map((r: any) => ({
    id: r.id,
    orderId: r.order_id,
    orderNumber: r.order_number,
    channel: r.channel,
    event: r.event,
    recipient: r.recipient,
    status: r.status,
    provider: r.provider,
    error: r.error,
    createdAt: r.created_at,
    sentAt: r.sent_at,
  }))
}

// saveNotificationLogs — no-op shim
// eslint-disable-next-line no-unused-vars
export async function saveNotificationLogs(_logs: NotificationLogEntry[]) { }

export async function logNotification(entry: NotificationLogEntry): Promise<void> {
  try {
    const db = getAdminClient()
    const { error } = await db.from('notification_logs').insert({
      id: entry.id,
      order_id: entry.orderId,
      order_number: entry.orderNumber,
      channel: entry.channel,
      event: entry.event,
      recipient: entry.recipient,
      status: entry.status,
      provider: entry.provider,
      error: entry.error ?? null,
      created_at: entry.createdAt,
      sent_at: entry.sentAt ?? null,
    })
    if (error) console.error('[NotificationLog] Insert failed:', error.message)
  } catch (err) {
    console.error('[NotificationLog] Failed to persist log entry:', err)
  }
}

export async function getNotificationsByOrderNumber(
  orderNumber: string
): Promise<NotificationLogEntry[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('notification_logs')
    .select('*')
    .ilike('order_number', orderNumber.trim())
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []).map((r: any) => ({
    id: r.id,
    orderId: r.order_id,
    orderNumber: r.order_number,
    channel: r.channel,
    event: r.event,
    recipient: r.recipient,
    status: r.status,
    provider: r.provider,
    error: r.error,
    createdAt: r.created_at,
    sentAt: r.sent_at,
  }))
}

export { }
