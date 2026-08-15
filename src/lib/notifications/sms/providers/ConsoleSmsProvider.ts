import { SmsPayload, SmsProvider, SmsSendResult } from '../types'

export class ConsoleSmsProvider implements SmsProvider {
  name = 'console'

  async send(payload: SmsPayload): Promise<SmsSendResult> {
    const mockId = `mock_sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    if (process.env.NODE_ENV !== 'test') {
      console.log('----------------------------------------------------')
      console.log(`[ConsoleSmsProvider] Sending Mock SMS to: ${payload.to}`)
      console.log(`Message: ${payload.message}`)
      console.log('----------------------------------------------------')
    }

    return {
      success: true,
      provider: this.name,
      status: 'mocked',
      messageId: mockId
    }
  }
}
