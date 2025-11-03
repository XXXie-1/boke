import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleDetail } from '@/components/articles/ArticleDetail'

interface PageProps {
  params: { slug: string }
}

async function getArticle(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/articles/${slug}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch article')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(params.slug)

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  return <ArticleDetail article={article} />
}