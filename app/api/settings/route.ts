import { NextResponse } from 'next/server'
import { getSettings, saveSettings } from '../../../src/lib/repositories/fileRepo'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { requireAdmin } from '../../../src/lib/serverHelpers'

export async function GET() {
  const data = await getSettings()
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? undefined
  if (!requireAdmin(cookieHeader)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    // Basic server-side validation
    const allowed: any = {}
    allowed.storeName = typeof body.storeName === 'string' ? body.storeName : undefined
    allowed.description = typeof body.description === 'string' ? body.description : undefined
    allowed.contactEmail = typeof body.contactEmail === 'string' ? body.contactEmail : undefined
    allowed.supportEmail = typeof body.supportEmail === 'string' ? body.supportEmail : undefined
    allowed.phone = typeof body.phone === 'string' ? body.phone : undefined
    allowed.address = typeof body.address === 'string' ? body.address : undefined
    allowed.currency = typeof body.currency === 'string' ? body.currency : undefined
    allowed.currencySymbol = typeof body.currencySymbol === 'string' ? body.currencySymbol : undefined
    allowed.footerText = typeof body.footerText === 'string' ? body.footerText : undefined
    allowed.logo = typeof body.logo === 'string' ? body.logo : undefined
    allowed.favicon = typeof body.favicon === 'string' ? body.favicon : undefined
    allowed.social = typeof body.social === 'object' ? body.social : undefined
    allowed.defaultSeo = typeof body.defaultSeo === 'object' ? body.defaultSeo : undefined

    await saveSettings(allowed)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 400 })
  }
}
