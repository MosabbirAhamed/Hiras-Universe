import { NextResponse } from 'next/server'
import { getPageById, getPages, updatePage, deletePage } from '../../../../src/lib/repositories/fileRepo'
import { mutationErrorResponse } from '../../../../src/lib/apiResponse'
import { requireAdmin } from '../../../../src/lib/serverHelpers'
import { slugify } from '../../../../src/lib/productValidation'

const pageStatuses = ['draft', 'published', 'archived'] as const

type PageStatus = (typeof pageStatuses)[number]
type RouteContext = { params: { id: string } }

function isPageStatus(value: unknown): value is PageStatus {
  return typeof value === 'string' && pageStatuses.includes(value as PageStatus)
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const page = await getPageById(params.id)
    if (!page) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
    return NextResponse.json(page, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('page.get', error, 'Could not load the page. Please try again.')
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  if (!requireAdmin(req.headers.get('cookie') ?? undefined)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const existing = await getPageById(params.id)
    if (!existing) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })

    const title = typeof body?.title === 'string' ? body.title.trim() : existing.title
    const slug = slugify(typeof body?.slug === 'string' ? body.slug : existing.slug)
    const status = body?.status === undefined ? existing.status ?? 'draft' : body.status

    if (!title || !slug) {
      return NextResponse.json({ error: 'Page title and slug are required.' }, { status: 400 })
    }
    if (!isPageStatus(status)) {
      return NextResponse.json({ error: 'Page status is invalid.' }, { status: 400 })
    }

    if (slug !== existing.slug) {
      const pages = await getPages()
      if (pages.some((page) => page.id !== params.id && page.slug === slug)) {
        return NextResponse.json({ error: 'Page slug must be unique.' }, { status: 400 })
      }
    }

    const updated = await updatePage(params.id, {
      title,
      slug,
      content: typeof body?.content === 'string' ? body.content : existing.content,
      status,
      seo: body?.seo && typeof body.seo === 'object' ? body.seo : existing.seo,
    })
    if (!updated) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
    return NextResponse.json(updated, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('page.update', error, 'Could not save the page. Please try again.')
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  if (!requireAdmin(req.headers.get('cookie') ?? undefined)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const deleted = await deletePage(params.id)
    if (!deleted) return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, id: params.id })
  } catch (error) {
    return mutationErrorResponse('page.delete', error, 'Could not delete the page. Please try again.')
  }
}
