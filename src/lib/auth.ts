import crypto from 'crypto'

const TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24 // 24h

function getAdminSecret() {
  if (process.env.ADMIN_SECRET) return process.env.ADMIN_SECRET
  if (process.env.NODE_ENV !== 'production') return 'dev-secret'
  throw new Error('ADMIN_SECRET is required in production')
}

export function createAdminToken(): string {
  const payload = `${Date.now()}`
  const SECRET = getAdminSecret()
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return false
    const SECRET = getAdminSecret()
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
    const expectedBytes = Buffer.from(expected, 'hex')
    const sigBytes = Buffer.from(sig, 'hex')
    if (expectedBytes.length !== sigBytes.length || !crypto.timingSafeEqual(expectedBytes, sigBytes)) return false
    const ts = parseInt(payload, 10)
    if (Number.isNaN(ts)) return false
    return Date.now() - ts < TOKEN_EXPIRY_MS
  } catch (e) {
    return false
  }
}

export {}
