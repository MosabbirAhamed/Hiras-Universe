import { NextResponse } from 'next/server'
import { getNavigation, saveNavigation } from '../../../src/lib/repositories/fileRepo'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { requireAdmin } from '../../../src/lib/serverHelpers'

export async function GET() {
  const nav = await getNavigation()
  return NextResponse.json(nav || [], { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(req: Request) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  await saveNavigation(body)
  return NextResponse.json({ ok: true })
}
