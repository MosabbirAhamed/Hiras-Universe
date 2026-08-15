import { NextResponse } from 'next/server'
import { defaultTheme } from '../../../../src/lib/repositories/defaultTheme'

export async function GET() {
  return NextResponse.json(defaultTheme)
}
