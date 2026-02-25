import { NextResponse } from "next/server"

interface TokenBucket {
  count: number
  resetTime: number
}

const store = new Map<string, TokenBucket>()

const WINDOW_MS = 60_000
const MAX_REQUESTS = 5

function cleanup() {
  const now = Date.now()
  store.forEach((bucket, key) => {
    if (now >= bucket.resetTime) store.delete(key)
  })
}

if (typeof setInterval !== "undefined") {
  setInterval(cleanup, WINDOW_MS * 2)
}

export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers)
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  )
}

export function rateLimit(request: Request): NextResponse | null {
  const ip = getClientIp(request)
  const now = Date.now()
  const bucket = store.get(ip)

  if (!bucket || now >= bucket.resetTime) {
    store.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return null
  }

  if (bucket.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    )
  }

  bucket.count++
  return null
}
