import { NextResponse } from 'next/server'
import { getCategories, getProductById, getProducts, updateProduct, deleteProduct } from '../../../../src/lib/repositories/fileRepo'
import { mutationErrorResponse } from '../../../../src/lib/apiResponse'
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

  try {
    const body = await req.json()
    const [products, categories] = await Promise.all([getProducts(), getCategories()])
    const existing = products.find((product) => product.id === id)
    if (!existing) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })

    const validation = validateProductWrite({ ...existing, ...body, id }, products, categories, id)
    if (!validation.ok) {
      return NextResponse.json({ error: 'Please correct the highlighted product fields.', errors: validation.errors }, { status: 400 })
    }
    const updated = await updateProduct(id, {
      ...validation.product,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    })
    if (!updated) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    return mutationErrorResponse('product.update', error, 'Could not save the product. Please try again.')
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return PUT(req, { params })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const deleted = await deleteProduct(params.id)
    if (!deleted) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, id: params.id })
  } catch (error) {
    return mutationErrorResponse('product.delete', error, 'Could not delete the product. Please try again.')
  }
}
