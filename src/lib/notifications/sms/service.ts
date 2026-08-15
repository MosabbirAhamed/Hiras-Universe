import { SmsPayload, SmsProvider, SmsSendResult } from './types'
import { ConsoleSmsProvider } from './providers/ConsoleSmsProvider'
import { HttpSmsProvider } from './providers/HttpSmsProvider'

let activeSmsProvider: SmsProvider | null = null

export function getSmsProvider(): SmsProvider {
  if (activeSmsProvider) {
    return activeSmsProvider
  }

  const http = new HttpSmsProvider()
  if (http.isConfigured()) {
    activeSmsProvider = http
  } else {
    activeSmsProvider = new ConsoleSmsProvider()
  }

  return activeSmsProvider
}

/**
 * Set custom SMS provider (e.g. for unit tests)
 */
export function setSmsProvider(provider: SmsProvider | null) {
  activeSmsProvider = provider
}

export async function sendSms(payload: SmsPayload): Promise<SmsSendResult> {
  const provider = getSmsProvider()
  try {
    return await provider.send(payload)
  } catch (err: any) {
    return {
      success: false,
      provider: provider.name,
      status: 'failed',
      error: err.message || 'SMS dispatch encountered an unexpected error.'
    }
  }
}
