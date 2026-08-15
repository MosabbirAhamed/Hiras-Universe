import { Order, NotificationEvent } from '../../../types/models'

function formatPrice(val: number): string {
  return `Tk ${val.toLocaleString('en-US')}`
}

export function getSmsMessage(event: NotificationEvent, order: Order, siteUrl = ''): string | null {
  const storeName = "Hira's Universe"
  const trackingUrl = siteUrl ? `${siteUrl}/track-order` : '/track-order'
  const name = order.customer.fullName.split(' ')[0] || order.customer.fullName
  const orderNum = order.orderNumber

  switch (event) {
    case 'ORDER_CREATED':
      return `Dear ${name}, your ${storeName} order #${orderNum} of ${formatPrice(order.total)} has been placed successfully. Track: ${trackingUrl}`

    case 'ORDER_SHIPPED':
      return `Dear ${name}, your order #${orderNum} has been dispatched for delivery to ${order.shippingAddress.district}. Track: ${trackingUrl}`

    case 'ORDER_DELIVERED':
      return `Dear ${name}, your order #${orderNum} has been delivered. Thank you for shopping with ${storeName}!`

    case 'ORDER_CANCELLED':
      return `Dear ${name}, your order #${orderNum} has been cancelled. For help, please contact us.`

    case 'PAYMENT_CONFIRMED':
      return `Dear ${name}, payment of ${formatPrice(order.total)} for order #${orderNum} has been confirmed. ${storeName}`

    case 'ORDER_PROCESSING':
      // SMS not typically sent for internal processing to save SMS costs, but template provided if needed
      return `Dear ${name}, your order #${orderNum} is now being processed by ${storeName}.`

    default:
      return null
  }
}
