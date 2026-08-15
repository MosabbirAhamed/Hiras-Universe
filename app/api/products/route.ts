import { NextResponse } from 'next/server'
import { getCategories, getProducts, createProduct } from '../../../src/lib/repositories/fileRepo'
import { randomUUID } from 'crypto'
import { requireAdmin } from '../../../src/lib/serverHelpers'
import { validateProductWrite } from '../../../src/lib/productValidation'

export async function GET() {
  const products = await getProducts()
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  // require admin
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const validation = validateProductWrite(body, products, categories)
  if (!validation.ok) return NextResponse.json({ error: 'validation_failed', errors: validation.errors }, { status: 400 })
  const now = new Date().toISOString()
  const product = { ...validation.product, id: `p-${randomUUID()}`, createdAt: now, updatedAt: now }
  await createProduct(product)
  return NextResponse.json(product)
}
