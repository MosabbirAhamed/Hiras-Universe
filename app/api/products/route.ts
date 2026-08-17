import { NextRequest, NextResponse } from 'next/server'
import { getCategories, getProducts, getProductsByIds, createProduct } from '../../../src/lib/repositories/fileRepo'
import { randomUUID } from 'crypto'
import { mutationErrorResponse } from '../../../src/lib/apiResponse'
import { requireAdmin } from '../../../src/lib/serverHelpers'
import { validateProductWrite } from '../../../src/lib/productValidation'

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids')
    ?.split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  const products = ids?.length ? await getProductsByIds(ids.slice(0, 50)) : await getProducts()
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const [products, categories] = await Promise.all([getProducts(), getCategories()])
    const validation = validateProductWrite(body, products, categories)
    if (!validation.ok) {
      return NextResponse.json({ error: 'Please correct the highlighted product fields.', errors: validation.errors }, { status: 400 })
    }
    const now = new Date().toISOString()
    const product = { ...validation.product, id: `p-${randomUUID()}`, createdAt: now, updatedAt: now }
    const created = await createProduct(product)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return mutationErrorResponse('product.create', error, 'Could not create the product. Please try again.')
  }
}
