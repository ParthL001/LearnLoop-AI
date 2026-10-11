/**
 * Lightweight, in-memory sliding window rate limiter middleware.
 * Prevents denial-of-service and overloading of local LLM inference engines.
 */
export function createRateLimiter({
  windowMs = 60000, // 1 minute
  max = 30, // 30 requests per minute
  message = 'Too many requests to AI tutor service. Please slow down and try again shortly.'
} = {}) {
  const requests = new Map()

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client'
    const now = Date.now()

    const timestamps = (requests.get(ip) || []).filter((time) => now - time < windowMs)
    timestamps.push(now)
    requests.set(ip, timestamps)

    // Periodic cleanup of stale IPs
    if (requests.size > 2000) {
      for (const [key, times] of requests.entries()) {
        const active = times.filter((t) => now - t < windowMs)
        if (active.length === 0) {
          requests.delete(key)
        } else {
          requests.set(key, active)
        }
      }
    }

    if (timestamps.length > max) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfterSeconds: Math.ceil((windowMs - (now - timestamps[0])) / 1000)
      })
    }

    next()
  }
}
