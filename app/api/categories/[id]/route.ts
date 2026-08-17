import { NextResponse } from 'next/server'
import { deleteCategory, getCategories, getCategoryById, updateCategory } from '../../../../src/lib/repositories/fileRepo'
import { mutationErrorResponse } from '../../../../src/lib/apiResponse'
import { requireAdmin } from '../../../../src/lib/serverHelpers'
import { slugify } from '../../../../src/lib/productValidation'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const cat = await getCategoryById(id)
  if (!cat) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(cat)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const categories = await getCategories()
    const existing = categories.find((category) => category.id === params.id)
    if (!existing) return NextResponse.json({ error: 'Category not found.' }, { status: 404 })

    const name = typeof body.name === 'string' ? body.name.trim() : existing.name
    const slug = slugify(typeof body.slug === 'string' ? body.slug : existing.slug || name)
    if (!name || !slug) {
      return NextResponse.json({ error: 'Category name and slug are required.' }, { status: 400 })
    }
    if (categories.some((category) => category.id !== params.id && category.slug === slug)) {
      return NextResponse.json({ error: 'Category slug must be unique.' }, { status: 400 })
    }
    const updated = await updateCategory(params.id, {
      ...existing,
      ...body,
      id: params.id,
      name,
      slug,
      description: typeof body.description === 'string' ? body.description.trim() : existing.description,
      image: typeof body.image === 'string' ? body.image : existing.image,
      active: typeof body.active === 'boolean' ? body.active : existing.active,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : existing.sortOrder,
    })
    if (!updated) return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    return mutationErrorResponse('category.update', error, 'Could not save the category. Please try again.')
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const deleted = await deleteCategory(params.id)
    if (!deleted) return NextResponse.json({ error: 'Category not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, id: params.id })
  } catch (error) {
    return mutationErrorResponse('category.delete', error, 'Could not delete the category. Please try again.')
  }
}
