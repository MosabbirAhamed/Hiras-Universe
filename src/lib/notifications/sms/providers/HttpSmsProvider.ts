import { SmsPayload, SmsProvider, SmsSendResult } from '../types'

export class HttpSmsProvider implements SmsProvider {
  name = 'http-gateway'

  isConfigured(): boolean {
    return Boolean(
      process.env.SMS_API_ENDPOINT &&
      process.env.SMS_API_KEY
    )
  }

  async send(payload: SmsPayload): Promise<SmsSendResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        status: 'failed',
        error: 'SMS gateway environment variables (SMS_API_ENDPOINT, SMS_API_KEY) are not configured.'
      }
    }

    try {
      const endpoint = process.env.SMS_API_ENDPOINT as string
      const apiKey = process.env.SMS_API_KEY as string
      const senderId = process.env.SMS_SENDER_ID || 'HIRAS_UNIV'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          recipient: payload.to,
          senderId,
          message: payload.message
        })
      })

      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        return {
          success: false,
          provider: this.name,
          status: 'failed',
          error: `SMS Gateway returned HTTP ${res.status}: ${errBody}`
        }
      }

      const msgId = `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      return {
        success: true,
        provider: this.name,
        status: 'sent',
        messageId: msgId
      }
    } catch (err: any) {
      return {
        success: false,
        provider: this.name,
        status: 'failed',
        error: err.message || 'SMS HTTP transmission failed.'
      }
    }
  }
}
