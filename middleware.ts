import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24

function getAdminSecret() {
  if (process.env.ADMIN_SECRET) return process.env.ADMIN_SECRET
  return process.env.NODE_ENV === 'production' ? '' : 'dev-secret'
}

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

async function verifyAdminToken(token?: string) {
  const secret = getAdminSecret()
  if (!token || !secret) return false

  const [payload, sig] = token.split('.')
  if (!payload || !sig || sig.length !== 64) return false

  const ts = Number(payload)
  if (!Number.isFinite(ts) || Date.now() - ts >= TOKEN_EXPIRY_MS) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const expected = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)))
  return timingSafeEqual(expected, hexToBytes(sig))
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const ok = await verifyAdminToken(req.cookies.get('admin_token')?.value)
    if (!ok) return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
