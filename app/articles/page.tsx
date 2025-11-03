import { Suspense } from 'react'
import { ArticlesList } from '@/components/articles/ArticlesList'
import { ArticlesListSkeleton } from '@/components/articles/ArticlesListSkeleton'

export const metadata = {
  title: 'Articles',
  description: 'Read our latest articles on various topics',
}

export default function ArticlesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Articles</h1>
          <p className="text-lg text-muted-foreground">
            Discover insights, tutorials, and stories from our community
          </p>
        </div>
        
        <Suspense fallback={<ArticlesListSkeleton />}>
          <ArticlesList />
        </Suspense>
      </div>
    </div>
  )
}