import { NextResponse } from 'next/server'
import { getPages, createPage } from '../../../src/lib/repositories/fileRepo'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { requireAdmin } from '../../../src/lib/serverHelpers'

export async function GET() {
  const pages = await getPages()
  return NextResponse.json(pages, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: Request) {
  const { headers } = req
  const cookieHeader = headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body?.title || !body?.slug) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
  const page = { id, title: body.title, slug: body.slug.replace(/^\//, '').toLowerCase(), content: body.content || '', status: body.status || 'draft', seo: body.seo || {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  await createPage(page)
  return NextResponse.json(page)
}
