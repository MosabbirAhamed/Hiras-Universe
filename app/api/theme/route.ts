import { NextResponse } from 'next/server'
import { getTheme, saveTheme } from '../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../src/lib/serverHelpers'

export async function GET() {
  const theme = await getTheme()
  return NextResponse.json(theme)
}

export async function PUT(req: Request) {
  const { headers } = req
  const cookieHeader = headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  await saveTheme(body)
  return NextResponse.json(body)
}
