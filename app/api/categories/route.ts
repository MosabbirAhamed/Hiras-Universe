import { NextResponse } from 'next/server'
import { getCategories, saveCategories } from '../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../src/lib/serverHelpers'
import { randomUUID } from 'crypto'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.toLowerCase()
  let categories = await getCategories()
  if (q) {
    categories = categories.filter(c => c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q))
  }
  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const ok = requireAdmin(req.headers.get('cookie') ?? undefined)
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const cats = await getCategories()
  const cat = { id: `c-${randomUUID()}`, ...body }
  cats.push(cat)
  await saveCategories(cats)
  return NextResponse.json(cat)
}
