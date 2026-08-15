import { NextResponse } from 'next/server'
import { getPageById, updatePage, deletePage } from '../../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../../src/lib/serverHelpers'

export async function GET(req: Request, { params }: any) {
  const id = params.id
  const p = await getPageById(id)
  if (!p) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json(p)
}

export async function PUT(req: Request, { params }: any) {
  const { headers } = req
  const cookieHeader = headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const id = params.id
  const body = await req.json()
  const updated = await updatePage(id, body)
  if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: any) {
  const { headers } = req
  const cookieHeader = headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const id = params.id
  await deletePage(id)
  return NextResponse.json({ ok: true })
}
