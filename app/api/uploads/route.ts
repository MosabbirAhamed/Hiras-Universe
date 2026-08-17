import { NextResponse } from 'next/server'
import { createMediaFromUpload, getAllMedia, findMediaByFilename, deleteMediaById, findMediaById } from '../../../src/lib/repositories/mediaRepo'
import { mutationErrorResponse } from '../../../src/lib/apiResponse'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { requireAdmin } from '../../../src/lib/serverHelpers'
import path from 'path'

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

function safeExt(name: string) {
  return path.extname(name || '').toLowerCase()
}

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) {
    return NextResponse.json({ error: 'Admin authentication is required.' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File) || !file.name || file.size === 0) {
      return NextResponse.json({ error: 'Choose a non-empty image to upload.' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Images must be 5 MB or smaller.' }, { status: 400 })
    }

    const ext = safeExt(file.name)
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: 'Upload a JPG, PNG, or WebP image.' }, { status: 400 })
    }

    const safeName = path.basename(file.name.replace(/[^a-z0-9._-]/gi, '_'))
    const filename = `${Date.now()}-${safeName}`
    const existing = await findMediaByFilename(filename)
    if (existing) return NextResponse.json(existing)

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
    const media = await createMediaFromUpload({ filename, buffer, mimeType })
    return NextResponse.json(media, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('media.upload', error, 'Could not upload media. Please try again.')
  }
}

export async function GET() {
  try {
    const list = await getAllMedia()
    return NextResponse.json(list, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('media.list', error, 'Could not load media.')
  }
}

export async function DELETE(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) {
    return NextResponse.json({ error: 'Admin authentication is required.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const id = typeof body?.id === 'string' ? body.id : ''
    const force = body?.force === true
    if (!id) return NextResponse.json({ error: 'A media ID is required.' }, { status: 400 })

    const { getProducts, getCategories, getHomepageSections } = await import('../../../src/lib/repositories/fileRepo')
    const [products, categories, sections] = await Promise.all([getProducts(), getCategories(), getHomepageSections()])
    const usedBy: string[] = []
    const media = await findMediaById(id)
    if (!media) return NextResponse.json({ error: 'Media item not found.' }, { status: 404 })
    const url = media.url
    products.forEach(p => { if (p.images && p.images.includes(url)) usedBy.push(`product:${p.id}`) })
    categories.forEach(c => { if (c.image === url) usedBy.push(`category:${c.id}`) })
    sections.forEach(s => {
      const j = JSON.stringify(s)
      if (j.includes(url)) usedBy.push(`section:${s.id}`)
    })
    if (usedBy.length && !force) return NextResponse.json({ error: 'in_use', usedBy }, { status: 409 })

    const deleted = await deleteMediaById(id)
    if (!deleted) return NextResponse.json({ error: 'Media item not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, id, usedBy }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('media.delete', error, 'Could not delete media. Please try again.')
  }
}
