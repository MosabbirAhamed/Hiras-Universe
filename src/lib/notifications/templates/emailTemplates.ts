import { Order, NotificationEvent } from '../../../types/models'

function formatPrice(val: number): string {
  return `Tk ${val.toLocaleString('en-US')}`
}

export function getEmailTemplate(event: NotificationEvent, order: Order, siteUrl = ''): { subject: string; html: string; text: string } {
  const storeName = "Hira's Universe"
  const trackingUrl = `${siteUrl}/track-order`
  const orderNum = order.orderNumber
  const customerName = order.customer.fullName

  // Build items summary rows
  const itemRowsHtml = order.items
    .map((item) => {
      const attrStr = item.selectedAttributes
        ? Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(', ')
        : ''
      const skuStr = item.variantSku || item.productSku ? ` (${item.variantSku || item.productSku})` : ''
      return `
        <tr style="border-bottom: 1px solid #f0eae1;">
          <td style="padding: 10px 0;">
            <strong style="color: #2b2621;">${item.productName}</strong>${skuStr}
            ${attrStr ? `<div style="font-size: 12px; color: #82786e;">${attrStr}</div>` : ''}
          </td>
          <td style="padding: 10px 0; text-align: center; color: #52483e;">${item.quantity}</td>
          <td style="padding: 10px 0; text-align: right; color: #2b2621; font-weight: 600;">${formatPrice(item.lineTotal)}</td>
        </tr>
      `
    })
    .join('')

  const itemsText = order.items
    .map((item) => `- ${item.productName} x${item.quantity}: ${formatPrice(item.lineTotal)}`)
    .join('\n')

  let subject = ''
  let heading = ''
  let messageBody = ''

  switch (event) {
    case 'ORDER_CREATED':
      subject = `Order Confirmation #${orderNum} - ${storeName}`
      heading = 'Thank You for Your Order!'
      messageBody = `We have received your order <strong>#${orderNum}</strong> and our team is preparing it with care. You can track your order status anytime.`
      break

    case 'ORDER_PROCESSING':
      subject = `Your Order #${orderNum} is Processing - ${storeName}`
      heading = 'Order in Packaging'
      messageBody = `Great news! Your order <strong>#${orderNum}</strong> is currently being tailored, packaged, and prepared for dispatch.`
      break

    case 'ORDER_SHIPPED':
      subject = `Your Order #${orderNum} has been Dispatched! - ${storeName}`
      heading = 'Your Parcel is on the Way'
      messageBody = `Your order <strong>#${orderNum}</strong> has been handed over for delivery. It will arrive at your address in <strong>${order.shippingAddress.district}</strong> shortly.`
      break

    case 'ORDER_DELIVERED':
      subject = `Your Order #${orderNum} Has Been Delivered - ${storeName}`
      heading = 'Order Delivered'
      messageBody = `Your order <strong>#${orderNum}</strong> has been successfully delivered. We hope you love your modest essentials!`
      break

    case 'ORDER_CANCELLED':
      subject = `Order #${orderNum} Cancellation Notice - ${storeName}`
      heading = 'Order Cancelled'
      messageBody = `Your order <strong>#${orderNum}</strong> has been marked as cancelled. Any allocated inventory has been restored. If you have any questions, please contact our support.`
      break

    case 'PAYMENT_CONFIRMED':
      subject = `Payment Confirmed for Order #${orderNum} - ${storeName}`
      heading = 'Payment Received'
      messageBody = `We have verified and confirmed payment for order <strong>#${orderNum}</strong>. Thank you for your transaction!`
      break
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #faf7f2; margin: 0; padding: 20px; color: #2b2621;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #eae3d8; overflow: hidden;">
          <div style="background-color: #4a3b32; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 0.5px;">${storeName}</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.85;">Curated Modest Fashion & Essentials</p>
          </div>
          <div style="padding: 28px;">
            <h2 style="font-family: Georgia, serif; color: #4a3b32; margin-top: 0; font-size: 20px;">${heading}</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #52483e;">Dear ${customerName},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #52483e;">${messageBody}</p>

            <div style="margin: 24px 0; background-color: #faf7f2; border-radius: 6px; padding: 16px; border: 1px solid #f0eae1;">
              <table style="width: 100%; font-size: 13px; text-align: left; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #82786e;">Order Number:</td>
                  <td style="padding: 4px 0; font-weight: bold; color: #4a3b32; text-align: right;">${orderNum}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #82786e;">Delivery Destination:</td>
                  <td style="padding: 4px 0; color: #2b2621; text-align: right;">${order.shippingAddress.thana}, ${order.shippingAddress.district}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #82786e;">Payment Method:</td>
                  <td style="padding: 4px 0; text-transform: uppercase; color: #2b2621; text-align: right;">${order.paymentMethod}</td>
                </tr>
              </table>
            </div>

            <h3 style="font-family: Georgia, serif; font-size: 16px; color: #4a3b32; margin-bottom: 12px; border-bottom: 1px solid #f0eae1; padding-bottom: 6px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 2px solid #eae3d8; color: #82786e; font-size: 11px; text-transform: uppercase;">
                  <th style="text-align: left; padding: 6px 0;">Item</th>
                  <th style="text-align: center; padding: 6px 0;">Qty</th>
                  <th style="text-align: right; padding: 6px 0;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRowsHtml}
              </tbody>
            </table>

            <div style="margin-top: 16px; border-top: 1px solid #eae3d8; padding-top: 12px;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="color: #82786e; padding: 3px 0;">Subtotal:</td>
                  <td style="text-align: right; font-weight: 500;">${formatPrice(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="color: #82786e; padding: 3px 0;">Delivery Charge:</td>
                  <td style="text-align: right; font-weight: 500;">${formatPrice(order.deliveryCharge)}</td>
                </tr>
                <tr style="font-size: 15px; font-weight: bold; color: #4a3b32;">
                  <td style="padding-top: 8px; border-top: 1px dashed #eae3d8;">Total Amount:</td>
                  <td style="text-align: right; padding-top: 8px; border-top: 1px dashed #eae3d8; color: #4a3b32;">${formatPrice(order.total)}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 32px;">
              <a href="${trackingUrl}" style="background-color: #4a3b32; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-size: 13px; font-weight: 600; display: inline-block;">Track Your Order</a>
            </div>
          </div>
          <div style="background-color: #faf7f2; padding: 16px; text-align: center; font-size: 11px; color: #82786e; border-top: 1px solid #eae3d8;">
            © ${new Date().getFullYear()} ${storeName}. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
${heading}
${storeName}

Dear ${customerName},

${messageBody.replace(/<[^>]*>/g, '')}

Order Details:
Order Number: ${orderNum}
Delivery: ${order.shippingAddress.deliveryAddress}, ${order.shippingAddress.thana}, ${order.shippingAddress.district}
Payment Method: ${order.paymentMethod.toUpperCase()}

Items:
${itemsText}

Subtotal: ${formatPrice(order.subtotal)}
Delivery Charge: ${formatPrice(order.deliveryCharge)}
Total: ${formatPrice(order.total)}

Track your order anytime: ${trackingUrl}
  `.trim()

  return { subject, html, text }
}
