import { NextRequest, NextResponse } from 'next/server'
import { secureCommentsService } from '@/lib/secure-comments'
import { CommentModerationSchema } from '@/lib/schemas'
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

// PUT /api/admin/comments/[id] - Moderate a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin
    const isAuthenticated = await authenticateAdmin(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const commentId = params.id

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate moderation data
    const moderationData = CommentModerationSchema.parse(body)

    const result = await secureCommentsService.moderateComment(
      commentId,
      moderationData
    )

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error moderating comment:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid moderation data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to moderate comment' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/comments/[id] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin
    const isAuthenticated = await authenticateAdmin(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const commentId = params.id

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    await secureCommentsService.deleteComment(commentId)

    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Error deleting comment:', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Comment not found' },
          { status: 404 }
        )
      }

      if (error.message.includes('Cannot delete comment with replies')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
