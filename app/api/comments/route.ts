import { NextRequest, NextResponse } from 'next/server'
import { secureCommentsService } from '@/lib/secure-comments'
import { CommentInputSchema, CommentQuerySchema } from '@/lib/schemas'
import { z } from 'zod'

// GET /api/comments - Fetch comments with pagination and threading
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate query parameters
    const queryData = CommentQuerySchema.parse({
      article_id: searchParams.get('article_id'),
      status: searchParams.get('status') || 'approved',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
    })

    const result = await secureCommentsService.getComments(queryData)

    // Cache approved comments for 5 minutes
    const response = NextResponse.json(result)
    if (queryData.status === 'approved') {
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=300, stale-while-revalidate=600'
      )
      response.headers.set(
        'Cache-Tag',
        `comments,article:${queryData.article_id}`
      )
    }

    return response
  } catch (error) {
    console.error('Error fetching comments:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/comments - Create new comment with security measures
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const commentData = CommentInputSchema.parse(body)

    const result = await secureCommentsService.createComment(commentData)

    // Return success message (comments are pending by default)
    const response = NextResponse.json(
      {
        data: result,
        message: 'Comment submitted successfully and is pending approval.',
      },
      { status: 201 }
    )

    // Don't cache new comments
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')

    return response
  } catch (error) {
    console.error('Error creating comment:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid comment data', details: error.issues },
        { status: 400 }
      )
    }

    // Handle specific security errors
    if (error instanceof Error) {
      if (error.message.includes('Rate limit exceeded')) {
        return NextResponse.json({ error: error.message }, { status: 429 })
      }

      if (error.message.includes('inappropriate language')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
