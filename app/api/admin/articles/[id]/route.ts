import { NextResponse } from 'next/server'
import { articlesService } from '@/lib/articles'
import { ArticleUpdateInputSchema } from '@/lib/schemas'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await articlesService.getArticleById(params.id)

    return NextResponse.json(article)
  } catch (error) {
    console.error('Failed to fetch article:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 404 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = ArticleUpdateInputSchema.parse(body)

    const article = await articlesService.updateArticle(
      params.id,
      validatedData,
      body.tags,
      body.categories
    )

    return NextResponse.json(article)
  } catch (error) {
    console.error('Failed to update article:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await articlesService.deleteArticle(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete article:', error)
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}