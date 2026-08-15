/* eslint-disable no-unused-vars */
export interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailSendResult {
  success: boolean
  provider: string
  status: 'sent' | 'failed' | 'mocked'
  messageId?: string
  error?: string
}

export interface EmailProvider {
  name: string
  send: (payload: EmailPayload) => Promise<EmailSendResult>
}
