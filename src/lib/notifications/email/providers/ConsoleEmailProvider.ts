import { EmailPayload, EmailProvider, EmailSendResult } from '../types'

export class ConsoleEmailProvider implements EmailProvider {
  name = 'console'

  async send(payload: EmailPayload): Promise<EmailSendResult> {
    const mockId = `mock_mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('----------------------------------------------------')
      console.log(`[ConsoleEmailProvider] Sending Mock Email to: ${payload.to}`)
      console.log(`Subject: ${payload.subject}`)
      console.log(`Message Preview: ${payload.text || payload.html.replace(/<[^>]*>/g, '').substring(0, 120)}...`)
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
