import { NextResponse } from 'next/server'
import { getOrders } from '../../../src/lib/repositories/fileRepo'
import { normalizeAndValidateBdPhone, sanitizeText } from '../../../src/lib/orderValidation'
import { checkTrackingRateLimit, recordFailedTrackingAttempt } from '../../../src/lib/tracking/rateLimiter'
import { toPublicTrackingOrder } from '../../../src/lib/tracking/trackingService'

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'

    // 1. Rate Limiting Check
    const rateLimit = checkTrackingRateLimit(clientIp)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, error: rateLimit.reason || 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: rateLimit.retryAfterSeconds
            ? { 'Retry-After': String(rateLimit.retryAfterSeconds) }
            : undefined
        }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
    }

    const rawOrderNumber = sanitizeText(body.orderNumber).toUpperCase()
    const rawPhone = String(body.phone || '')

    // 2. Validate Order Number Format
    const orderNumberRegex = /^HN-\d+$/i
    if (!rawOrderNumber || !orderNumberRegex.test(rawOrderNumber)) {
      return NextResponse.json(
        { ok: false, error: 'Please provide a valid order number in format HN-1001.' },
        { status: 400 }
      )
    }

    // 3. Validate Phone Number Format
    const validPhone = normalizeAndValidateBdPhone(rawPhone)
    if (!validPhone) {
      return NextResponse.json(
        { ok: false, error: 'Please provide a valid 11-digit Bangladesh mobile number (e.g. 01712345678).' },
        { status: 400 }
      )
    }

    // 4. Fetch Orders and Verify BOTH Order Number and Phone
    const orders = await getOrders()
    const foundOrder = orders.find((o) => o.orderNumber.toUpperCase() === rawOrderNumber)

    // Verification check: Order exists AND normalized customer phone matches
    const orderPhoneNormalized = foundOrder ? normalizeAndValidateBdPhone(foundOrder.customer.phone) : null
    const isMatched = Boolean(foundOrder && orderPhoneNormalized === validPhone)

    if (!isMatched || !foundOrder) {
      recordFailedTrackingAttempt(clientIp)
      return NextResponse.json(
        { ok: false, error: 'No order found matching the provided Order Number and Phone Number.' },
        { status: 404 }
      )
    }

    // 5. Return Safe Public Tracking DTO
    const publicOrder = toPublicTrackingOrder(foundOrder)
    return NextResponse.json({ ok: true, order: publicOrder }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'An error occurred while tracking the order.' },
      { status: 500 }
    )
  }
}
