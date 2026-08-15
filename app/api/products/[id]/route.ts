import { NextResponse } from 'next/server'
import { getCategories, getProductById, getProducts, updateProduct, deleteProduct } from '../../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../../src/lib/serverHelpers'
import { validateProductWrite } from '../../../../src/lib/productValidation'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const p = await getProductById(id)
  if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(p)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = params
  const existing = await getProductById(id)
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const body = await req.json()
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const validation = validateProductWrite({ ...existing, ...body, id }, products, categories, id)
  if (!validation.ok) return NextResponse.json({ error: 'validation_failed', errors: validation.errors }, { status: 400 })
  const updated = await updateProduct(id, { ...validation.product, id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() })
  if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return PUT(req, { params })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = params
  const existing = await getProductById(id)
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })
  await deleteProduct(id)
  return NextResponse.json({ ok: true })
}
