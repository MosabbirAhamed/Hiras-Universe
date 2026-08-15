import { Order, NotificationEvent, NotificationLogEntry } from '../../types/models'
import { sendEmail } from './email/service'
import { sendSms } from './sms/service'
import { getEmailTemplate } from './templates/emailTemplates'
import { getSmsMessage } from './templates/smsTemplates'
import { logNotification } from '../repositories/fileRepo'

export interface DispatchNotificationResult {
  email?: { success: boolean; status: string; error?: string }
  sms?: { success: boolean; status: string; error?: string }
}

/**
 * Asynchronously and safely dispatch order notification events across Email and SMS channels.
 * Runs non-blockingly with complete failure isolation so checkout or admin operations never fail.
 */
export async function dispatchOrderNotification(
  event: NotificationEvent,
  order: Order,
  options?: { siteUrl?: string }
): Promise<DispatchNotificationResult> {
  const result: DispatchNotificationResult = {}
  const nowIso = new Date().toISOString()
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || ''

  const tasks: Promise<any>[] = []

  // 1. Email Channel (if customer email is provided)
  const customerEmail = order.customer.email?.trim()
  if (customerEmail) {
    const emailTemplate = getEmailTemplate(event, order, siteUrl)
    const emailPromise = sendEmail({
      to: customerEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    })
      .then(async (sendRes) => {
        result.email = {
          success: sendRes.success,
          status: sendRes.status,
          error: sendRes.error
        }

        const logEntry: NotificationLogEntry = {
          id: `notif_em_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          channel: 'email',
          event,
          recipient: customerEmail,
          status: sendRes.status,
          provider: sendRes.provider,
          error: sendRes.error,
          createdAt: nowIso,
          sentAt: sendRes.success ? new Date().toISOString() : undefined
        }

        await logNotification(logEntry).catch((err) => {
          console.error('[NotificationLog] Failed to log email event:', err)
        })
      })
      .catch(async (err: any) => {
        result.email = {
          success: false,
          status: 'failed',
          error: err.message || 'Email dispatch exception'
        }

        const logEntry: NotificationLogEntry = {
          id: `notif_em_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          channel: 'email',
          event,
          recipient: customerEmail,
          status: 'failed',
          provider: 'unknown',
          error: err.message || 'Email dispatch exception',
          createdAt: nowIso
        }

        await logNotification(logEntry).catch(() => {})
      })

    tasks.push(emailPromise)
  }

  // 2. SMS Channel (if customer phone exists and event has an SMS message)
  const smsMessage = getSmsMessage(event, order, siteUrl)
  const customerPhone = order.customer.phone?.trim()
  if (smsMessage && customerPhone) {
    const smsPromise = sendSms({
      to: customerPhone,
      message: smsMessage
    })
      .then(async (sendRes) => {
        result.sms = {
          success: sendRes.success,
          status: sendRes.status,
          error: sendRes.error
        }

        const logEntry: NotificationLogEntry = {
          id: `notif_sms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          channel: 'sms',
          event,
          recipient: customerPhone,
          status: sendRes.status,
          provider: sendRes.provider,
          error: sendRes.error,
          createdAt: nowIso,
          sentAt: sendRes.success ? new Date().toISOString() : undefined
        }

        await logNotification(logEntry).catch((err) => {
          console.error('[NotificationLog] Failed to log SMS event:', err)
        })
      })
      .catch(async (err: any) => {
        result.sms = {
          success: false,
          status: 'failed',
          error: err.message || 'SMS dispatch exception'
        }

        const logEntry: NotificationLogEntry = {
          id: `notif_sms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          channel: 'sms',
          event,
          recipient: customerPhone,
          status: 'failed',
          provider: 'unknown',
          error: err.message || 'SMS dispatch exception',
          createdAt: nowIso
        }

        await logNotification(logEntry).catch(() => {})
      })

    tasks.push(smsPromise)
  }

  // Execute tasks with allSettled for complete channel independence
  await Promise.allSettled(tasks)

  return result
}
