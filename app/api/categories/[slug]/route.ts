import { NextRequest, NextResponse } from 'next/server'
import { categoriesService } from '@/lib/articles'

// GET /api/categories/[slug] - Get category by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const category = await categoriesService.getCategoryBySlug(slug)

    const response = NextResponse.json({ data: category })
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=7200'
    )
    response.headers.set('Cache-Tag', `category:${slug},categories`)

    return response
  } catch (error) {
    console.error('Error fetching category:', error)

    if (error instanceof Error && error.message === 'Category not found') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}
