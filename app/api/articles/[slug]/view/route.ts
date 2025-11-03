import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { mockService } from '@/lib/mock-service'
import { ViewCountSchema } from '@/lib/schemas'
import { z } from 'zod'

// POST /api/articles/[slug]/view - Increment article view count
export async function POST(
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

    const body = await request.json()
    
    // Validate request body
    const { article_id } = ViewCountSchema.parse(body)

    // Use mock service if Supabase is not configured
    const useMockService = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (useMockService) {
      try {
        const article = await mockService.getArticleBySlug(slug)
        if (article.id !== article_id) {
          return NextResponse.json(
            { error: 'Invalid article ID' },
            { status: 400 }
          )
        }

        const newViewCount = await mockService.incrementViewCount(article_id)
        const response = NextResponse.json({ 
          success: true,
          view_count: newViewCount
        })
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
        return response
      } catch (error) {
        if (error instanceof Error && error.message === 'Article not found') {
          return NextResponse.json(
            { error: 'Article not found' },
            { status: 404 }
          )
        }
        throw error
      }
    }

    // Supabase implementation
    const supabase = createSupabaseServerClient()

    // First get the article by slug to verify it exists
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }
      throw new Error(`Failed to fetch article: ${fetchError.message}`)
    }

    // Verify the article_id matches the slug
    if (article.id !== article_id) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      )
    }

    // Increment view count using RPC call for atomic operation
    const { data, error } = await supabase.rpc('increment_view_count', {
      article_uuid: article_id
    })

    if (error) {
      throw new Error(`Failed to increment view count: ${error.message}`)
    }

    // Cache the response for a short time
    const response = NextResponse.json({ 
      success: true,
      view_count: data
    })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

    return response
  } catch (error) {
    console.error('Error incrementing view count:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    )
  }
}