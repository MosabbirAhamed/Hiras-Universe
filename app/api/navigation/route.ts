import { NextResponse } from 'next/server'
import { getNavigation, saveNavigation } from '../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../src/lib/serverHelpers'

export async function GET() {
  const nav = await getNavigation()
  return NextResponse.json(nav || [])
}

export async function PUT(req: Request) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  await saveNavigation(body)
  return NextResponse.json({ ok: true })
}
