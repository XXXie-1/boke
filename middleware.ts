import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for the admin service role key in headers
    const serviceRoleKey = request.headers.get('x-admin-service-role-key')
    const expectedKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey || serviceRoleKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}