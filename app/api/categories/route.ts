import { NextRequest, NextResponse } from 'next/server'
import { categoriesService } from '@/lib/articles'
import { CategoryInputSchema } from '@/lib/schemas'
import { z } from 'zod'

// GET /api/categories - Fetch all categories with article counts
export async function GET(request: NextRequest) {
  try {
    const categories = await categoriesService.getAllCategories()

    // Cache response for 10 minutes
    const response = NextResponse.json({ data: categories })
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    response.headers.set('Cache-Tag', 'categories')

    return response
  } catch (error) {
    console.error('Error fetching categories:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const categoryData = CategoryInputSchema.parse(body)

    const result = await categoriesService.createCategory(categoryData)

    // Revalidate cache
    const response = NextResponse.json({ data: result }, { status: 201 })
    response.headers.set('Cache-Tag', 'categories')

    return response
  } catch (error) {
    console.error('Error creating category:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid category data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
