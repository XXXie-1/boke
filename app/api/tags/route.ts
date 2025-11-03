import { NextRequest, NextResponse } from 'next/server'
import { tagsService } from '@/lib/articles'
import { TagInputSchema } from '@/lib/schemas'
import { z } from 'zod'

// GET /api/tags - Fetch all tags with article counts
export async function GET(request: NextRequest) {
  try {
    const tags = await tagsService.getAllTags()

    // Cache response for 10 minutes
    const response = NextResponse.json({ data: tags })
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=600, stale-while-revalidate=1200'
    )
    response.headers.set('Cache-Tag', 'tags')

    return response
  } catch (error) {
    console.error('Error fetching tags:', error)

    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const tagData = TagInputSchema.parse(body)

    const result = await tagsService.createTag(tagData)

    // Revalidate cache
    const response = NextResponse.json({ data: result }, { status: 201 })
    response.headers.set('Cache-Tag', 'tags')

    return response
  } catch (error) {
    console.error('Error creating tag:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid tag data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
