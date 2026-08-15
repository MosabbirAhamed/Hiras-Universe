/* eslint-disable no-unused-vars */
export interface SmsPayload {
  to: string
  message: string
}

export interface SmsSendResult {
  success: boolean
  provider: string
  status: 'sent' | 'failed' | 'mocked'
  messageId?: string
  error?: string
}

export interface SmsProvider {
  name: string
  send: (payload: SmsPayload) => Promise<SmsSendResult>
}
