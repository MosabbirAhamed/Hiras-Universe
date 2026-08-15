type RateLimitRecord = {
  requests: number[]
  failedAttempts: number[]
}

const clientLimits = new Map<string, RateLimitRecord>()

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of clientLimits.entries()) {
    record.requests = record.requests.filter((t) => now - t < 60000)
    record.failedAttempts = record.failedAttempts.filter((t) => now - t < 15 * 60000)
    if (record.requests.length === 0 && record.failedAttempts.length === 0) {
      clientLimits.delete(ip)
    }
  }
}, 10 * 60 * 1000)

export interface RateLimitCheckResult {
  allowed: boolean
  retryAfterSeconds?: number
  reason?: string
}

/**
 * In-process sliding window rate limiting for public tracking requests.
 * Constraints:
 * - Max 10 requests per minute per IP
 * - Max 5 failed attempts per 15 minutes per IP
 */
export function checkTrackingRateLimit(clientIp: string): RateLimitCheckResult {
  const now = Date.now()
  let record = clientLimits.get(clientIp)
  if (!record) {
    record = { requests: [], failedAttempts: [] }
    clientLimits.set(clientIp, record)
  }

  // Filter windows
  record.requests = record.requests.filter((t) => now - t < 60000)
  record.failedAttempts = record.failedAttempts.filter((t) => now - t < 15 * 60000)

  // 1. Check max requests (10 per minute)
  if (record.requests.length >= 10) {
    const oldest = record.requests[0]
    const retryAfterSeconds = Math.max(1, Math.ceil((60000 - (now - oldest)) / 1000))
    return {
      allowed: false,
      retryAfterSeconds,
      reason: 'Too many requests. Please wait a moment before trying again.'
    }
  }

  // 2. Check failed attempts (5 per 15 minutes)
  if (record.failedAttempts.length >= 5) {
    const oldestFailed = record.failedAttempts[0]
    const retryAfterSeconds = Math.max(1, Math.ceil((15 * 60000 - (now - oldestFailed)) / 1000))
    return {
      allowed: false,
      retryAfterSeconds,
      reason: 'Too many failed lookup attempts. Please try again later.'
    }
  }

  record.requests.push(now)
  return { allowed: true }
}

export function recordFailedTrackingAttempt(clientIp: string) {
  const now = Date.now()
  let record = clientLimits.get(clientIp)
  if (!record) {
    record = { requests: [now], failedAttempts: [] }
    clientLimits.set(clientIp, record)
  }
  record.failedAttempts.push(now)
}

/**
 * Clear rate limit store (useful for automated testing)
 */
export function clearRateLimits() {
  clientLimits.clear()
}
