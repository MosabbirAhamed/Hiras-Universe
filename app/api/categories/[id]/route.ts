import { NextResponse } from 'next/server'
import { getCategories, getCategoryById, saveCategories, deleteCategory } from '../../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../../src/lib/serverHelpers'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const cat = await getCategoryById(id)
  if (!cat) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(cat)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = params
  const body = await req.json()
  const cats = await getCategories()
  const idx = cats.findIndex(c => c.id === id)
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 })
  cats[idx] = { ...cats[idx], ...body }
  await saveCategories(cats)
  return NextResponse.json(cats[idx])
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = params
  const deleted = await deleteCategory(id)
  if (!deleted) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
