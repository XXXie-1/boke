import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin, CSRFProtection } from '@/lib/security'

// Rate limiting for API routes
import { rateLimiter } from '@/lib/security'

// Paths that require CSRF protection
const CSRF_PROTECTED_PATHS = ['/api/comments', '/api/admin/']

// Paths that require rate limiting
const RATE_LIMITED_PATHS = ['/api/comments']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // CSRF protection for API routes
  if (CSRF_PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    // Skip CSRF for GET requests
    if (request.method !== 'GET') {
      // Validate origin
      if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
      }

      // For API routes, check CSRF token if it's a POST/PUT/DELETE request
      const sessionToken = request.cookies.get('csrf-token')?.value

      if (sessionToken) {
        const isValidToken = await CSRFProtection.validateToken(
          request,
          sessionToken
        )
        if (!isValidToken) {
          return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 }
          )
        }
      }
    }
  }

  // Rate limiting for API routes
  if (RATE_LIMITED_PATHS.some((path) => pathname.startsWith(path))) {
    const clientIP = getClientIP(request)
    const rateLimitKey = `api:${pathname}:${clientIP}`

    const rateLimitResult = await rateLimiter.isRateLimited(
      rateLimitKey,
      10,
      60
    ) // 10 requests per minute per IP per endpoint

    if (rateLimitResult.limited) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      )
    }

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', '10')
    response.headers.set(
      'X-RateLimit-Remaining',
      rateLimitResult.remaining.toString()
    )
    response.headers.set(
      'X-RateLimit-Reset',
      rateLimitResult.resetTime.toString()
    )
  }

  return response
}

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return request.ip || '127.0.0.1'
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
