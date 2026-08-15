import { NextResponse } from 'next/server'
import { getHomepageSections, saveHomepageSections } from '../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../src/lib/serverHelpers'

export async function GET() {
  const sections = await getHomepageSections()
  return NextResponse.json(sections)
}

export async function PUT(req: Request) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  // expect an array of sections
  await saveHomepageSections(body)
  return NextResponse.json({ ok: true })
}
