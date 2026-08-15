import { NextResponse } from 'next/server'
import { getTheme, saveTheme } from '../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../src/lib/serverHelpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const theme = await getTheme()
    return NextResponse.json(theme, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'theme_read_failed' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    if (!body || typeof body !== 'object' || !body.colors || typeof body.colors !== 'object') {
      return NextResponse.json({ error: 'invalid_theme' }, { status: 400 })
    }
    await saveTheme(body)
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'theme_save_failed' }, { status: 500 })
  }
}
