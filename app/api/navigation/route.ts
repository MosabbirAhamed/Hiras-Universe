import { NextResponse } from 'next/server'
import { getNavigation, saveNavigation } from '../../../src/lib/repositories/fileRepo'
import { mutationErrorResponse } from '../../../src/lib/apiResponse'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { requireAdmin } from '../../../src/lib/serverHelpers'

export async function GET() {
  const nav = await getNavigation()
  return NextResponse.json(nav || [], { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(req: Request) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Navigation must be an array.' }, { status: 400 })
    }
    const savedNavigation = await saveNavigation(body)
    return NextResponse.json(savedNavigation, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('navigation.save', error, 'Could not save navigation. Please try again.')
  }
}
