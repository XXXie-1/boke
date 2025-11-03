'use client'

import { Suspense } from 'react'
import { ArticlesList } from './ArticlesList'
import { ArticlesListSkeleton } from './ArticlesListSkeleton'
import { FolderOpen } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

interface CategoryArticlesProps {
  category: Category
}

export function CategoryArticles({ category }: CategoryArticlesProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen className="h-6 w-6" />
            <h1 className="text-4xl font-bold tracking-tight">{category.name}</h1>
          </div>
          {category.description ? (
            <p className="text-lg text-muted-foreground">
              {category.description}
            </p>
          ) : (
            <p className="text-lg text-muted-foreground">
              Browse all articles in the <span className="font-medium">{category.name}</span> category
            </p>
          )}
        </div>
        
        <Suspense fallback={<ArticlesListSkeleton />}>
          <ArticlesList />
        </Suspense>
      </div>
    </div>
  )
}