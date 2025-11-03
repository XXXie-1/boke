import { NextRequest, NextResponse } from 'next/server'
import { secureCommentsService } from '@/lib/secure-comments'
import { z } from 'zod'

// Admin authentication middleware
async function authenticateAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  const adminToken = process.env.ADMIN_SECRET_TOKEN

  if (!adminToken) {
    console.error('ADMIN_SECRET_TOKEN not configured')
    return false
  }

  // Check Bearer token
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    return token === adminToken
  }

  // Check query parameter for development/testing
  const { searchParams } = new URL(request.url)
  const queryToken = searchParams.get('token')
  return queryToken === adminToken
}

// GET /api/admin/comments - Get pending comments for moderation
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const isAuthenticated = await authenticateAdmin(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await secureCommentsService.getPendingComments(page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching pending comments:', error)

    return NextResponse.json(
      { error: 'Failed to fetch pending comments' },
      { status: 500 }
    )
  }
}
