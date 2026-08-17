import 'server-only'

import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

export function mutationErrorResponse(
    operation: string,
    error: unknown,
    userMessage: string,
    status = 500
) {
    const errorId = randomUUID()
    console.error(`[${operation}] mutation failed`, { errorId, error })

    return NextResponse.json(
        { error: userMessage, errorId },
        { status, headers: { 'Cache-Control': 'no-store' } }
    )
}
