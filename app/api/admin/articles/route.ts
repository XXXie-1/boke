import { NextResponse } from 'next/server'
import { articlesService } from '@/lib/articles'
import { ArticleInputSchema } from '@/lib/schemas'

export async function GET() {
  try {
    const articles = await articlesService.getArticles({
      page: 1,
      limit: 50,
      status: 'draft'
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = ArticleInputSchema.parse(body)

    const article = await articlesService.createArticle(
      validatedData,
      body.tags || [],
      body.categories || []
    )

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Failed to create article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}