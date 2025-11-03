import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryArticles } from '@/components/articles/CategoryArticles'

interface PageProps {
  params: { slug: string }
}

async function getCategory(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/categories/${slug}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch category')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategory(params.slug)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} - Articles`,
    description: category.description || `Read all articles in the ${category.name} category`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const category = await getCategory(params.slug)

  if (!category) {
    notFound()
  }

  return <CategoryArticles category={category} />
}