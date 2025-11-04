import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeHeaders } from '@/lib/security-helpers';

// Rate limit configurations for different endpoint types
const RATE_LIMITS = {
  // API endpoints - stricter limits
  '/api/': { windowMs: 15 * 60 * 1000, max: 100 }, // 15 minutes, 100 requests
  
  // Authentication endpoints - very strict
  '/api/auth': { windowMs: 15 * 60 * 1000, max: 5 }, // 15 minutes, 5 requests
  
  // Public endpoints - more lenient
  '/public': { windowMs: 15 * 60 * 1000, max: 1000 }, // 15 minutes, 1000 requests
  
  // Default rate limit
  'default': { windowMs: 15 * 60 * 1000, max: 200 } // 15 minutes, 200 requests
};

function getRateLimitConfig(pathname: string) {
  for (const [prefix, config] of Object.entries(RATE_LIMITS)) {
    if (prefix === 'default') continue;
    if (pathname.startsWith(prefix)) {
      return config;
    }
  }
  return RATE_LIMITS.default;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static assets, Next.js internals, and health checks
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/health' ||
    pathname === '/api/health'
  ) {
    return NextResponse.next();
  }

  // Get rate limit configuration for this path
  const rateLimitConfig = getRateLimitConfig(pathname);
  
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, rateLimitConfig);
  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(rateLimitResult.resetTime / 1000)} seconds.`,
        retryAfter: rateLimitResult.resetTime
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitConfig.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
        },
      }
    );
  }

  // Create response and add security headers
  const response = NextResponse.next();

  // Add rate limit headers to successful responses
  response.headers.set('X-RateLimit-Limit', rateLimitConfig.max.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

  // Sanitize headers to prevent security issues
  sanitizeHeaders(request.headers, response.headers);

  // Add additional security headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Remove server information
    response.headers.delete('X-Powered-By');
  }

  // Add CORS headers for API routes (restrictive)
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'https://vercel.app',
      // Add your production domains here
    ];

    if (allowedOrigins.includes(origin || '')) {
      response.headers.set('Access-Control-Allow-Origin', origin || '');
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, { status: 200 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};