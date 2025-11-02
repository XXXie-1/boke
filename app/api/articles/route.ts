import { NextRequest, NextResponse } from 'next/server'
import { articlesService } from '@/lib/articles'
import { ArticleQuerySchema, ArticleInputSchema } from '@/lib/schemas'
import { z } from 'zod'

// GET /api/articles - Fetch articles with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const query = ArticleQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      status: searchParams.get('status') || undefined,
      author_id: searchParams.get('author_id') || undefined,
      tag: searchParams.get('tag') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: searchParams.get('sort_order') || 'desc',
    })

    const result = await articlesService.getArticles(query)

    // Cache response for 5 minutes
    const response = NextResponse.json({
      data: result.data,
      pagination: result.pagination,
    })

    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    // Add revalidation tags
    response.headers.set('Cache-Tag', 'articles')

    return response
  } catch (error) {
    console.error('Error fetching articles:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

// POST /api/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const articleData = ArticleInputSchema.parse(body)
    
    const tags = body.tags || []
    const categories = body.categories || []

    const result = await articlesService.createArticle(articleData, tags, categories)

    // Revalidate cache
    const response = NextResponse.json({ data: result }, { status: 201 })
    response.headers.set('Cache-Tag', 'articles')

    return response
  } catch (error) {
    console.error('Error creating article:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid article data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}
