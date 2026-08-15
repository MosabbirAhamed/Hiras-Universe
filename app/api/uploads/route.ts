import { NextResponse } from 'next/server'
import { createMediaFromUpload, getAllMedia, findMediaByFilename, deleteMediaById, findMediaById } from '../../../src/lib/repositories/mediaRepo'
import { requireAdmin } from '../../../src/lib/serverHelpers'
import path from 'path'

type UploadBody = { filename: string; data: string }

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

function safeExt(name: string) {
  return path.extname(name || '').toLowerCase()
}

export async function POST(req: Request) {
  const { headers } = req
  const cookieHeader = headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json()) as UploadBody
  if (!body || !body.filename || !body.data) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const ext = safeExt(body.filename)
  if (!ALLOWED_EXT.includes(ext)) return NextResponse.json({ error: 'invalid_type' }, { status: 400 })
  const buf = Buffer.from(body.data, 'base64')
  if (buf.length > MAX_SIZE) return NextResponse.json({ error: 'too_large' }, { status: 400 })
  // avoid path traversal
  const filename = path.basename(body.filename.replace(/[^a-z0-9._-]/gi, '_'))

  const existing = await findMediaByFilename(filename)
  if (existing) {
    return NextResponse.json(existing)
  }

  // basic mime detection
  const mimeType = ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  const media = await createMediaFromUpload({ filename, buffer: buf, mimeType })
  return NextResponse.json(media)
}

export async function GET() {
  const list = await getAllMedia()
  return NextResponse.json(list)
}

export async function DELETE(req: Request) {
  const { headers } = req
  const cookieHeader = headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const id = body?.id
  const force = body?.force === true
  if (!id) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  // check usage in products/categories/homepage
  const { getProducts, getCategories, getHomepageSections } = await import('../../../src/lib/repositories/fileRepo')
  const [products, categories, sections] = await Promise.all([getProducts(), getCategories(), getHomepageSections()])
  const usedBy: string[] = []
  const media = await findMediaById(id)
  if (!media) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const url = media.url
  products.forEach(p => { if (p.images && p.images.includes(url)) usedBy.push(`product:${p.id}`) })
  categories.forEach(c => { if (c.image === url) usedBy.push(`category:${c.id}`) })
  sections.forEach(s => {
    const j = JSON.stringify(s)
    if (j.includes(url)) usedBy.push(`section:${s.id}`)
  })
  if (usedBy.length && !force) return NextResponse.json({ error: 'in_use', usedBy }, { status: 409 })

  const ok = await deleteMediaById(id)
  return NextResponse.json({ ok, usedBy })
}
