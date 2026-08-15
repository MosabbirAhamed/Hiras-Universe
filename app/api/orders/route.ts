import { NextResponse } from 'next/server'
import { validateCheckoutInput } from '../../../src/lib/orderValidation'
import { createOrderWithInventoryDeduction, getOrders } from '../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../src/lib/serverHelpers'
import { dispatchOrderNotification } from '../../../src/lib/notifications/dispatcher'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ ok: false, error: 'Invalid JSON request body.' }, { status: 400 })
    }

    const validation = validateCheckoutInput(body)
    if (!validation.ok) {
      return NextResponse.json(
        { ok: false, error: validation.message, errors: validation.errors },
        { status: 400 }
      )
    }

    const order = await createOrderWithInventoryDeduction(validation.data)

    // Trigger non-blocking asynchronous notification dispatch
    try {
      const siteUrl = new URL(req.url).origin
      dispatchOrderNotification('ORDER_CREATED', order, { siteUrl }).catch((err) => {
        console.error('[NotificationError] Asynchronous notification failed for order creation:', err)
      })
    } catch {
      // Ignore URL parsing or detached promise exceptions
    }

    return NextResponse.json(
      {
        ok: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge
      },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Failed to process order.' },
      { status: 400 }
    )
  }
}

export async function GET(req: Request) {
  if (!requireAdmin(req.headers.get('cookie') || '')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  const orders = await getOrders()
  return NextResponse.json(orders)
}
