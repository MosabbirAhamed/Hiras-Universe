import { verifyAdminToken } from './auth'

export function parseCookies(cookieHeader?: string) {
  const obj: Record<string,string> = {}
  if (!cookieHeader) return obj
  const parts = cookieHeader.split(';')
  for (const p of parts) {
    const idx = p.indexOf('=')
    if (idx === -1) continue
    const key = p.slice(0, idx).trim()
    const val = decodeURIComponent(p.slice(idx+1).trim())
    obj[key] = val
  }
  return obj
}

export function requireAdmin(cookieHeader?: string) {
  const cookies = parseCookies(cookieHeader)
  const token = cookies['admin_token']
  if (!token) return false
  return verifyAdminToken(token)
}

export {}
