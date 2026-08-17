import { NextResponse } from 'next/server'
import { createCategory, getCategories } from '../../../src/lib/repositories/fileRepo'
import { mutationErrorResponse } from '../../../src/lib/apiResponse'
import { requireAdmin } from '../../../src/lib/serverHelpers'
import { slugify } from '../../../src/lib/productValidation'
import { randomUUID } from 'crypto'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.toLowerCase()
  let categories = await getCategories()
  if (q) {
    categories = categories.filter(c => c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q))
  }
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const slug = slugify(typeof body.slug === 'string' ? body.slug : name)
    if (!name || !slug) {
      return NextResponse.json({ error: 'Category name and slug are required.' }, { status: 400 })
    }
    const categories = await getCategories()
    if (categories.some((category) => category.slug === slug)) {
      return NextResponse.json({ error: 'Category slug must be unique.' }, { status: 400 })
    }
    const created = await createCategory({
      id: `c-${randomUUID()}`,
      name,
      slug,
      description: typeof body.description === 'string' ? body.description.trim() : undefined,
      image: typeof body.image === 'string' ? body.image : undefined,
      active: body.active !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return mutationErrorResponse('category.create', error, 'Could not create the category. Please try again.')
  }
}
