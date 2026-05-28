// Simple in-memory sliding-window rate limiter.
// Swap the store for @upstash/redis in production for multi-instance support.

interface Window { count: number; resetAt: number }
const store = new Map<string, Window>()

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { success: boolean } {
  const now = Date.now()
  const rec = store.get(key)

  if (!rec || now > rec.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }

  if (rec.count >= limit) return { success: false }
  rec.count++
  return { success: true }
}

export function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
