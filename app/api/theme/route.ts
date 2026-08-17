import { NextResponse } from 'next/server'
import { getTheme, saveTheme } from '../../../src/lib/repositories/fileRepo'
import { mutationErrorResponse } from '../../../src/lib/apiResponse'
import { requireAdmin } from '../../../src/lib/serverHelpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const theme = await getTheme()
    return NextResponse.json(theme, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('theme.read', error, 'Could not load theme settings.')
  }
}

export async function PUT(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    if (!body || typeof body !== 'object' || !body.colors || typeof body.colors !== 'object') {
      return NextResponse.json({ error: 'Theme colors are required.' }, { status: 400 })
    }
    const savedTheme = await saveTheme(body)
    return NextResponse.json(savedTheme, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('theme.save', error, 'Could not save theme settings. Please try again.')
  }
}
