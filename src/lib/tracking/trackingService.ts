import { Order, OrderStatus, PublicTrackingOrder, TrackingTimelineStep } from '../../types/models'

/**
 * Mask Bangladesh phone number for privacy: e.g. 01712345678 -> 017****5678
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return ''
  const clean = phone.trim()
  if (clean.length < 8) return '****'
  const start = clean.slice(0, 3)
  const end = clean.slice(-4)
  return `${start}****${end}`
}

/**
 * Build customer-friendly tracking status timeline based on lifecycle state
 */
export function buildCustomerTimeline(
  orderStatus: OrderStatus,
  createdAt: string,
  updatedAt?: string
): TrackingTimelineStep[] {
  if (orderStatus === 'cancelled') {
    return [
      {
        key: 'pending',
        label: 'Order Placed',
        completed: true,
        current: false,
        timestamp: createdAt
      },
      {
        key: 'cancelled',
        label: 'Cancelled',
        completed: true,
        current: true,
        timestamp: updatedAt || createdAt
      }
    ]
  }

  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'processing', label: 'Processing / Packaging' },
    { key: 'shipped', label: 'Dispatched / On the Way' },
    { key: 'delivered', label: 'Delivered' }
  ]

  const statusOrder: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']
  const currentIndex = statusOrder.indexOf(orderStatus)

  return steps.map((s, idx) => {
    const isCompleted = idx <= currentIndex
    const isCurrent = idx === currentIndex
    let timestamp: string | null = null

    if (idx === 0) {
      timestamp = createdAt
    } else if (isCurrent) {
      timestamp = updatedAt || null
    }

    return {
      key: s.key,
      label: s.label,
      completed: isCompleted,
      current: isCurrent,
      timestamp
    }
  })
}

/**
 * Transform internal Order to privacy-safe PublicTrackingOrder DTO
 * STRICT PRIVACY: Does NOT expose full street address, email, admin notes, payment transaction ID, sender phone, or internal order ID
 */
export function toPublicTrackingOrder(order: Order): PublicTrackingOrder {
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
