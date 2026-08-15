import { NextResponse } from 'next/server'
import { createAdminToken } from '../../../../src/lib/auth'

export async function POST(req: Request) {
  const { password } = await req.json()
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'admin' : '')
  if (!ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD is not configured' }, { status: 500 })
  }
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const token = createAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', sameSite: 'lax' })
  return res
}
