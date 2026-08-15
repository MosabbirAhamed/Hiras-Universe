import { NextResponse } from 'next/server'
import { getOrderById, getOrderByNumber, updateOrderStatus } from '../../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../../src/lib/serverHelpers'
import { dispatchOrderNotification } from '../../../../src/lib/notifications/dispatcher'
import type { OrderStatus, PaymentStatus } from '../../../../src/types/models'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const isPublicLookup = searchParams.get('public') === '1'
  const orderNumber = searchParams.get('orderNumber')

  // Public Order Confirmation Lookup for Customer Success Page
  if (isPublicLookup && orderNumber) {
    const order = await getOrderByNumber(orderNumber)
    if (!order) {
      return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 })
    }

    // Return safe public confirmation payload without admin notes or internal metadata
    return NextResponse.json({
      ok: true,
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customer.fullName,
        shippingAddress: order.shippingAddress,
        items: order.items,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        discountTotal: order.discountTotal,
        total: order.total,
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt
      }
    })
  }

  // Admin Order Detail Lookup
  if (!requireAdmin(req.headers.get('cookie') || '')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  const order = await getOrderById(params.id)
  if (!order) {
    return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!requireAdmin(req.headers.get('cookie') || '')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => null)
    const validOrderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    const validPaymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']
    if (!body || typeof body.orderStatus !== 'string' || !validOrderStatuses.includes(body.orderStatus as OrderStatus)) {
      return NextResponse.json({ ok: false, error: 'Invalid orderStatus.' }, { status: 400 })
    }
    if (body.paymentStatus !== undefined && !validPaymentStatuses.includes(body.paymentStatus as PaymentStatus)) {
      return NextResponse.json({ ok: false, error: 'Invalid paymentStatus.' }, { status: 400 })
    }

    const existingOrder = await getOrderById(params.id)
    if (!existingOrder) {
      return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 })
    }

    const previousStatus = existingOrder.orderStatus
    const previousPayment = existingOrder.paymentStatus

    const nextOrderStatus = body.orderStatus as OrderStatus
    const nextPaymentStatus = body.paymentStatus ? (body.paymentStatus as PaymentStatus) : undefined
    const adminNotes = typeof body.adminNotes === 'string' ? body.adminNotes : undefined

    const updated = await updateOrderStatus(params.id, nextOrderStatus, nextPaymentStatus, adminNotes)
    if (!updated) {
      return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 })
    }

    // Trigger non-blocking status change notification events
    try {
      const siteUrl = new URL(req.url).origin

      if (previousStatus !== updated.orderStatus) {
        if (updated.orderStatus === 'processing') {
          dispatchOrderNotification('ORDER_PROCESSING', updated, { siteUrl }).catch((err) => {
            console.error('[NotificationError] Processing notification failed:', err)
          })
        } else if (updated.orderStatus === 'shipped') {
          dispatchOrderNotification('ORDER_SHIPPED', updated, { siteUrl }).catch((err) => {
            console.error('[NotificationError] Shipped notification failed:', err)
          })
        } else if (updated.orderStatus === 'delivered') {
          dispatchOrderNotification('ORDER_DELIVERED', updated, { siteUrl }).catch((err) => {
            console.error('[NotificationError] Delivered notification failed:', err)
          })
        } else if (updated.orderStatus === 'cancelled') {
          dispatchOrderNotification('ORDER_CANCELLED', updated, { siteUrl }).catch((err) => {
            console.error('[NotificationError] Cancelled notification failed:', err)
          })
        }
      }

      if (previousPayment !== updated.paymentStatus && updated.paymentStatus === 'paid') {
        dispatchOrderNotification('PAYMENT_CONFIRMED', updated, { siteUrl }).catch((err) => {
          console.error('[NotificationError] Payment confirmation notification failed:', err)
        })
      }
    } catch {
      // Ignore URL parsing or detached promise exceptions
    }

    return NextResponse.json({ ok: true, order: updated })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Failed to update order.' }, { status: 400 })
  }
}

