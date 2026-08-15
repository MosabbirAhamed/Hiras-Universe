import { NextResponse } from 'next/server'
import { getNotificationLogs } from '../../../../src/lib/repositories/fileRepo'
import { requireAdmin } from '../../../../src/lib/serverHelpers'

export async function GET(req: Request) {
  if (!requireAdmin(req.headers.get('cookie') || '')) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 })
  }

  const logs = await getNotificationLogs()
  return NextResponse.json({ ok: true, logs })
}
