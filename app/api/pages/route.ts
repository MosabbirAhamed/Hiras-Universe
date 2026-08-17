import { NextResponse } from 'next/server'
import { getPages, createPage } from '../../../src/lib/repositories/fileRepo'
import { mutationErrorResponse } from '../../../src/lib/apiResponse'
import { requireAdmin } from '../../../src/lib/serverHelpers'
import { slugify } from '../../../src/lib/productValidation'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const pageStatuses = ['draft', 'published', 'archived'] as const

type PageStatus = (typeof pageStatuses)[number]

function isPageStatus(value: unknown): value is PageStatus {
  return typeof value === 'string' && pageStatuses.includes(value as PageStatus)
}

export async function GET() {
  try {
    const pages = await getPages()
    return NextResponse.json(pages, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('pages.list', error, 'Could not load pages. Please try again.')
  }
}

export async function POST(req: Request) {
  if (!requireAdmin(req.headers.get('cookie') ?? undefined)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const title = typeof body?.title === 'string' ? body.title.trim() : ''
    const slug = slugify(typeof body?.slug === 'string' ? body.slug : '')
    const status = body?.status === undefined ? 'draft' : body.status

    if (!title || !slug) {
      return NextResponse.json({ error: 'Page title and slug are required.' }, { status: 400 })
    }
    if (!isPageStatus(status)) {
      return NextResponse.json({ error: 'Page status is invalid.' }, { status: 400 })
    }

    const pages = await getPages()
    if (pages.some((page) => page.slug === slug)) {
      return NextResponse.json({ error: 'Page slug must be unique.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const created = await createPage({
      id: `page-${randomUUID()}`,
      title,
      slug,
      content: typeof body?.content === 'string' ? body.content : '',
      status,
      seo: body?.seo && typeof body.seo === 'object' ? body.seo : {},
      createdAt: now,
      updatedAt: now,
    })
    return NextResponse.json(created, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('page.create', error, 'Could not create the page. Please try again.')
  }
}
