import { NextResponse } from 'next/server'
import { getHomepageSections, saveHomepageSections } from '../../../src/lib/repositories/fileRepo'
import { mutationErrorResponse } from '../../../src/lib/apiResponse'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { requireAdmin } from '../../../src/lib/serverHelpers'

export async function GET() {
  const sections = await getHomepageSections()
  return NextResponse.json(sections, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(req: Request) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Homepage sections must be an array.' }, { status: 400 })
    }
    const savedSections = await saveHomepageSections(body)
    return NextResponse.json(savedSections, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('homepage.save', error, 'Could not save homepage sections. Please try again.')
  }
}
