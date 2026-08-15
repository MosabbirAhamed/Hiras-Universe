export type ID = string

export type ProductAttribute = {
  id: string
  name: string
  values: string[]
}

export type ProductVariant = {
  id: ID
  sku: string
  attributes: Record<string, string>
  price: number
  salePrice?: number | null
  costPrice?: number | null
  stock: number
  lowStockThreshold?: number
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
  image?: string
  active: boolean
}

export type Product = {
  id: ID
  name: string
  slug?: string
  description?: string
  shortDescription?: string
  hasVariants?: boolean
  attributes?: ProductAttribute[]
  variants?: ProductVariant[]
  price: number
  salePrice?: number | null
  costPrice?: number | null
  currency?: string
  sku?: string
  stock?: number
  lowStockThreshold?: number
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock'
  categoryId?: ID
  brand?: string
  tags?: string[]
  images?: string[]
  primaryImage?: string
  featured?: boolean
  newArrival?: boolean
  bestseller?: boolean
  onSale?: boolean
  active?: boolean
  visibility?: 'public' | 'hidden'
  sortOrder?: number
  weight?: number | null
  dimensions?: {
    length?: number | null
    width?: number | null
    height?: number | null
    unit?: string
  }
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  canonicalUrl?: string
  createdAt?: string
  updatedAt?: string
}

export type Category = {
  id: ID
  name: string
  slug?: string
  description?: string
  image?: string
  active?: boolean
  sortOrder?: number
}

export type HomepageSection = {
  id: ID
  type: string
  enabled?: boolean
  order?: number
  data?: any
}

export type CustomerInfo = {
  fullName: string
  phone: string
  email?: string
}

export type OrderShippingAddress = {
  fullName: string
  phone: string
  email?: string
  district: string
  thana: string
  deliveryAddress: string
  deliveryNotes?: string
}

export type OrderItemSnapshot = {
  productId: ID
  variantId?: ID
  productName: string
  variantSku?: string
  productSku?: string
  selectedAttributes?: Record<string, string>
  image?: string
  unitPrice: number
  regularPrice: number
  quantity: number
  lineTotal: number
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'cod' | 'bkash' | 'nagad'

export type Order = {
  id: ID
  orderNumber: string
  customer: CustomerInfo
  shippingAddress: OrderShippingAddress
  items: OrderItemSnapshot[]
  subtotal: number
  deliveryCharge: number
  discountTotal: number
  total: number
  currency: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  paymentDetails?: {
    senderNumber?: string
    transactionId?: string
    notes?: string
  }
  adminNotes?: string
  stockDeducted?: boolean
  createdAt: string
  updatedAt: string
}

export type NotificationEvent =
  | 'ORDER_CREATED'
  | 'ORDER_PROCESSING'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_CONFIRMED'

export type NotificationChannel = 'email' | 'sms'

export type NotificationStatus = 'sent' | 'failed' | 'queued' | 'mocked'

export type NotificationLogEntry = {
  id: string
  orderId: string
  orderNumber: string
  channel: NotificationChannel
  event: NotificationEvent
  recipient: string
  status: NotificationStatus
  provider: string
  error?: string
  createdAt: string
  sentAt?: string
}

export type TrackingTimelineStep = {
  key: OrderStatus
  label: string
  completed: boolean
  current: boolean
  timestamp?: string | null
}

export type PublicTrackingOrder = {
  orderNumber: string
  createdAt: string
  orderStatus: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  customerName: string
  maskedPhone: string
  shippingAddress: {
    district: string
    thana: string
  }
  items: OrderItemSnapshot[]
  subtotal: number
  deliveryCharge: number
  discountTotal: number
  total: number
  timeline: TrackingTimelineStep[]
}

export type Customer = {
  id: ID
  name: string
  email?: string
  phone: string
  totalOrders?: number
  totalSpent?: number
  addresses?: OrderShippingAddress[]
  createdAt?: string
  updatedAt?: string
}

export type Coupon = {
  id: ID
  code: string
  type: 'percentage' | 'fixed'
  value: number
  active?: boolean
  expiresAt?: string
}

export type StoreSettings = {
  name?: string
  storeName?: string
  description?: string
  logo?: string
  contactEmail?: string
  phone?: string
  address?: string
  social?: Record<string, string>
}

export type Media = {
  id: ID
  filename: string
  url: string
  mimeType: string
  size: number
  width?: number
  height?: number
  createdAt: string
  altText?: string
  metadata?: Record<string, any>
}

export type CartItem = {
  productId: ID
  variantId?: ID
  quantity: number
}

export type EnrichedCartItem = {
  productId: ID
  variantId?: ID
  quantity: number
  product?: Product
  variant?: ProductVariant
  selectedAttributes?: Record<string, string>
  effectivePrice: number
  lineTotal: number
  isOutOfStock: boolean
  isMaxStock: boolean
  isUnavailable?: boolean
}

export {}
