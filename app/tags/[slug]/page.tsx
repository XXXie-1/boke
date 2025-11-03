import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TagArticles } from '@/components/articles/TagArticles'

interface PageProps {
  params: { slug: string }
}

async function getTag(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tags/${slug}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch tag')
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching tag:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tag = await getTag(params.slug)

  if (!tag) {
    return {
      title: 'Tag Not Found',
    }
  }

  return {
    title: `${tag.name} - Articles`,
    description: `Read all articles tagged with ${tag.name}`,
  }
}

export default async function TagPage({ params }: PageProps) {
  const tag = await getTag(params.slug)

  if (!tag) {
    notFound()
  }

  return <TagArticles tag={tag} />
}