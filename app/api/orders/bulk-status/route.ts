import { NextResponse } from 'next/server'
import { getOrderById, updateOrderStatus } from '../../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../../src/lib/serverHelpers'
import { dispatchOrderNotification } from '../../../../src/lib/notifications/dispatcher'
import type { OrderStatus, PaymentStatus, Order } from '../../../../src/types/models'

export async function POST(req: Request) {
  if (!requireAdmin(req.headers.get('cookie') || '')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => null)
    const validOrderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    const validPaymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']
    if (
      !body ||
      !Array.isArray(body.orderIds) ||
      body.orderIds.length === 0 ||
      !body.orderIds.every((id: unknown) => typeof id === 'string' && id.trim()) ||
      !validOrderStatuses.includes(body.nextStatus as OrderStatus) ||
      (body.nextPaymentStatus !== undefined &&
        !validPaymentStatuses.includes(body.nextPaymentStatus as PaymentStatus))
    ) {
      return NextResponse.json(
        { ok: false, error: 'Invalid order IDs or status value.' },
        { status: 400 }
      )
    }

    const orderIds: string[] = body.orderIds
    const nextStatus: OrderStatus = body.nextStatus
    const nextPaymentStatus: PaymentStatus | undefined = body.nextPaymentStatus
    const adminNotes: string | undefined = typeof body.adminNotes === 'string' ? body.adminNotes : undefined

    const succeeded: string[] = []
    const failed: { id: string; error: string }[] = []
    const updatedOrders: Order[] = []

    const siteUrl = new URL(req.url).origin

    for (const id of orderIds) {
      try {
        const existing = await getOrderById(id)
        if (!existing) {
          failed.push({ id, error: `Order ${id} not found.` })
          continue
        }

        const prevStatus = existing.orderStatus
        const prevPayment = existing.paymentStatus

        // Disallow invalid transition from cancelled back to active
        if (prevStatus === 'cancelled' && nextStatus !== 'cancelled') {
          failed.push({ id, error: `Order ${existing.orderNumber} is cancelled and cannot be reopened.` })
          continue
        }

        // Apply update
        const updated = await updateOrderStatus(id, nextStatus, nextPaymentStatus, adminNotes)
        if (!updated) {
          failed.push({ id, error: `Failed to persist status update for order ${id}.` })
          continue
        }

        succeeded.push(id)
        updatedOrders.push(updated)

        // Non-blocking notification dispatch on actual transition
        try {
          if (prevStatus !== updated.orderStatus) {
            if (updated.orderStatus === 'processing') {
              dispatchOrderNotification('ORDER_PROCESSING', updated, { siteUrl }).catch(() => { })
            } else if (updated.orderStatus === 'shipped') {
              dispatchOrderNotification('ORDER_SHIPPED', updated, { siteUrl }).catch(() => { })
            } else if (updated.orderStatus === 'delivered') {
              dispatchOrderNotification('ORDER_DELIVERED', updated, { siteUrl }).catch(() => { })
            } else if (updated.orderStatus === 'cancelled') {
              dispatchOrderNotification('ORDER_CANCELLED', updated, { siteUrl }).catch(() => { })
            }
          }

          if (prevPayment !== updated.paymentStatus && updated.paymentStatus === 'paid') {
            dispatchOrderNotification('PAYMENT_CONFIRMED', updated, { siteUrl }).catch(() => { })
          }
        } catch {
          // Detached notification error safety
        }
      } catch (err: any) {
        failed.push({ id, error: err.message || 'Operation error.' })
      }
    }

    return NextResponse.json({
      ok: true,
      succeeded,
      failed,
      updatedCount: succeeded.length
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Bulk operation failed.' },
      { status: 500 }
    )
  }
}
