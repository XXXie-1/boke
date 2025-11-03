import { NextRequest, NextResponse } from 'next/server'
import { tagsService } from '@/lib/articles'

// GET /api/tags/[slug] - Get single tag by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const tag = await tagsService.getTagBySlug(slug)

    // Cache response for 1 hour
    const response = NextResponse.json({ data: tag })
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=7200'
    )
    response.headers.set('Cache-Tag', `tag:${slug},tags`)

    return response
  } catch (error) {
    console.error('Error fetching tag:', error)

    if (error instanceof Error && error.message === 'Tag not found') {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 })
  }
}
