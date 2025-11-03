import { NextRequest, NextResponse } from 'next/server'
import { articlesService } from '@/lib/articles'
import { z } from 'zod'

// POST /api/articles/[slug]/view - Increment article view count
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // First get the article by slug to get the ID
    const article = await articlesService.getArticleBySlug(slug)

    // Increment view count
    const result = await articlesService.incrementViewCount(article.id)

    // Cache response for 5 minutes (view counts don't need to be perfectly fresh)
    const response = NextResponse.json({
      data: {
        article_id: article.id,
        view_count: result.view_count,
      },
    })

    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    )
    response.headers.set('Cache-Tag', `article:${slug},article-views`)

    return response
  } catch (error) {
    console.error('Error incrementing view count:', error)

    if (error instanceof Error && error.message === 'Article not found') {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    )
  }
}
