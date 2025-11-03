import { NextRequest, NextResponse } from 'next/server'
import { commentsService, articlesService } from '@/lib/articles'
import { CommentInputSchema } from '@/lib/schemas'
import { z } from 'zod'

// GET /api/comments - Fetch comments with optional article filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('article_id')
    const status = searchParams.get('status') as 'approved' | 'pending' | 'rejected' || 'approved'

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      )
    }

    const comments = await commentsService.getCommentsByArticleId(articleId, status)

    // Cache response for 5 minutes
    const response = NextResponse.json({ data: comments })
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('Cache-Tag', `comments,article:${articleId}`)

    return response
  } catch (error) {
    console.error('Error fetching comments:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/comments - Create new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const commentData = CommentInputSchema.parse(body)

    // Verify article exists
    await articlesService.getArticleById(commentData.article_id)

    const result = await commentsService.createComment(commentData)

    // Revalidate cache
    const response = NextResponse.json({ data: result }, { status: 201 })
    response.headers.set('Cache-Tag', `comments,article:${commentData.article_id}`)

    return response
  } catch (error) {
    console.error('Error creating comment:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid comment data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Article not found') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
