import { NextResponse } from 'next/server'
import { getNavigation, saveNavigation } from '../../../src/lib/repositories/fileRepo'
import { mutationErrorResponse } from '../../../src/lib/apiResponse'
import { requireAdmin } from '../../../src/lib/serverHelpers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type NavigationItem = {
  id: string
  label: string
  url?: string
  type?: string
  target?: string
  icon?: string | null
  badge?: string | null
  active: boolean
  desktopVisible: boolean
  mobileVisible: boolean
  location?: string
  order?: number
  children: NavigationItem[]
}

const allowedTypes = new Set(['custom', 'page', 'product', 'category'])
const allowedTargets = new Set(['_self', '_blank'])
const allowedLocations = new Set(['header', 'mobile', 'footer'])

function normalizeItems(value: unknown, ids: Set<string>): NavigationItem[] | null {
  if (!Array.isArray(value)) return null
  const result: NavigationItem[] = []

  for (const raw of value) {
    if (!raw || typeof raw !== 'object') return null
    const item = raw as Record<string, unknown>
    const id = typeof item.id === 'string' ? item.id.trim() : ''
    const label = typeof item.label === 'string' ? item.label.trim() : ''
    if (!id || !label || id.length > 120 || label.length > 160 || ids.has(id)) return null
    ids.add(id)

    const children = normalizeItems(item.children ?? [], ids)
    if (!children) return null

    const type = typeof item.type === 'string' && allowedTypes.has(item.type) ? item.type : 'custom'
    const location = typeof item.location === 'string' && allowedLocations.has(item.location) ? item.location : undefined
    const url = typeof item.url === 'string' ? item.url.trim().slice(0, 500) : undefined
    if (url && (!url.startsWith('/') && !url.startsWith('http://') && !url.startsWith('https://'))) return null

    result.push({
      id,
      label,
      ...(url ? { url } : {}),
      type,
      target: typeof item.target === 'string' && allowedTargets.has(item.target) ? item.target : '_self',
      icon: typeof item.icon === 'string' ? item.icon.slice(0, 80) : null,
      badge: typeof item.badge === 'string' ? item.badge.slice(0, 40) : null,
      active: item.active !== false,
      desktopVisible: item.desktopVisible !== false,
      mobileVisible: item.mobileVisible !== false,
      ...(location ? { location } : {}),
      ...(typeof item.order === 'number' && Number.isFinite(item.order) ? { order: item.order } : {}),
      children,
    })
  }

  return result
}

export async function GET() {
  const nav = await getNavigation()
  return NextResponse.json(nav || [], { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(req: Request) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const normalizedNavigation = normalizeItems(body, new Set<string>())
    if (!normalizedNavigation) {
      return NextResponse.json({ error: 'Navigation contains invalid or duplicate items.' }, { status: 400 })
    }
    const savedNavigation = await saveNavigation(normalizedNavigation)
    return NextResponse.json(savedNavigation, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    return mutationErrorResponse('navigation.save', error, 'Could not save navigation. Please try again.')
  }
}
