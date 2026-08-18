import { NextResponse } from 'next/server'
import { deleteCategory, getCategories, getCategoryById, getProducts, updateCategory } from '../../../../src/lib/repositories/fileRepo'
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
    const parentId = typeof body.parentId === 'string' && body.parentId ? body.parentId : null
    if (parentId === params.id) {
      return NextResponse.json({ error: 'A category cannot be its own parent.' }, { status: 400 })
    }
    if (parentId && !categories.some((category) => category.id === parentId)) {
      return NextResponse.json({ error: 'The selected parent category does not exist.' }, { status: 400 })
    }
    const descendants = new Set<string>()
    const collectDescendants = (id: string) => {
      categories.filter((category) => category.parentId === id).forEach((category) => {
        descendants.add(category.id)
        collectDescendants(category.id)
      })
    }
    collectDescendants(params.id)
    if (parentId && descendants.has(parentId)) {
      return NextResponse.json({ error: 'A category cannot be nested beneath one of its descendants.' }, { status: 400 })
    }
    const products = await getProducts()
    const selectedProductIds: string[] = Array.isArray(body.selectedProductIds)
      ? Array.from(new Set<string>(body.selectedProductIds.filter((id: unknown): id is string => typeof id === 'string')))
      : (existing.selectedProductIds ?? [])
    if (selectedProductIds.some((id) => !products.some((product) => product.id === id))) {
      return NextResponse.json({ error: 'One or more selected products do not exist.' }, { status: 400 })
    }
    const updated = await updateCategory(params.id, {
      ...existing,
      id: params.id,
      name,
      slug,
      description: typeof body.description === 'string' ? body.description.trim() : existing.description,
      image: typeof body.image === 'string' ? body.image : existing.image,
      bannerImage: typeof body.bannerImage === 'string' ? body.bannerImage : existing.bannerImage,
      parentId,
      featured: typeof body.featured === 'boolean' ? body.featured : existing.featured,
      active: typeof body.active === 'boolean' ? body.active : existing.active,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : existing.sortOrder,
      seoTitle: typeof body.seoTitle === 'string' ? body.seoTitle.trim() : existing.seoTitle,
      seoDescription: typeof body.seoDescription === 'string' ? body.seoDescription.trim() : existing.seoDescription,
      selectedProductIds,
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
