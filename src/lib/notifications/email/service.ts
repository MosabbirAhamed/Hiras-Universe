import { EmailPayload, EmailProvider, EmailSendResult } from './types'
import { ConsoleEmailProvider } from './providers/ConsoleEmailProvider'
import { SmtpEmailProvider } from './providers/SmtpEmailProvider'

let activeEmailProvider: EmailProvider | null = null

export function getEmailProvider(): EmailProvider {
  if (activeEmailProvider) {
    return activeEmailProvider
  }

  const smtp = new SmtpEmailProvider()
  if (smtp.isConfigured()) {
    activeEmailProvider = smtp
  } else {
    activeEmailProvider = new ConsoleEmailProvider()
  }

  return activeEmailProvider
}

/**
 * Set custom email provider (e.g. for unit tests or custom integrations)
 */
export function setEmailProvider(provider: EmailProvider | null) {
  activeEmailProvider = provider
}

export async function sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
  const provider = getEmailProvider()
  try {
    return await provider.send(payload)
  } catch (err: any) {
    return {
      success: false,
      provider: provider.name,
      status: 'failed',
      error: err.message || 'Email dispatch encountered an unexpected error.'
    }
  }
}
