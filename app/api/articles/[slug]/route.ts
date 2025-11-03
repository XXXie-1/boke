import { NextRequest, NextResponse } from 'next/server'
import { articlesService } from '@/lib/articles'
import { ArticleUpdateInputSchema } from '@/lib/schemas'
import { z } from 'zod'

// GET /api/articles/[slug] - Get single article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }

    const article = await articlesService.getArticleBySlug(slug)

    // Cache response for 1 hour
    const response = NextResponse.json({ data: article })
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200')
    
    // Add specific revalidation tags
    response.headers.set('Cache-Tag', `article:${slug},articles`)

    return response
  } catch (error) {
    console.error('Error fetching article:', error)
    
    if (error instanceof Error && error.message === 'Article not found') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

// PUT /api/articles/[slug] - Update article by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const body = await request.json()

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }

    // First get the article by slug to get the ID
    const existingArticle = await articlesService.getArticleBySlug(slug)

    // Validate request body
    const updateData = ArticleUpdateInputSchema.parse(body)
    
    const tags = body.tags !== undefined ? body.tags : undefined
    const categories = body.categories !== undefined ? body.categories : undefined

    const result = await articlesService.updateArticle(
      existingArticle.id,
      updateData,
      tags,
      categories
    )

    // Revalidate cache
    const response = NextResponse.json({ data: result })
    response.headers.set('Cache-Tag', `article:${slug},articles`)

    return response
  } catch (error) {
    console.error('Error updating article:', error)
    
    if (error instanceof Error && error.message === 'Article not found') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid article data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

// DELETE /api/articles/[slug] - Delete article by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }

    // First get the article by slug to get the ID
    const existingArticle = await articlesService.getArticleBySlug(slug)

    await articlesService.deleteArticle(existingArticle.id)

    // Revalidate cache
    const response = NextResponse.json({ success: true })
    response.headers.set('Cache-Tag', `article:${slug},articles`)

    return response
  } catch (error) {
    console.error('Error deleting article:', error)
    
    if (error instanceof Error && error.message === 'Article not found') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}
