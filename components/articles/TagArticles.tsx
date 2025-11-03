'use client'

import { Suspense } from 'react'
import { ArticlesList } from './ArticlesList'
import { ArticlesListSkeleton } from './ArticlesListSkeleton'
import { Badge } from '@/components/ui/Badge'
import { Tag } from 'lucide-react'

interface Tag {
  id: string
  name: string
  slug: string
  color?: string
}

interface TagArticlesProps {
  tag: Tag
}

export function TagArticles({ tag }: TagArticlesProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="h-6 w-6" />
            <h1 className="text-4xl font-bold tracking-tight">Tag: {tag.name}</h1>
            <Badge
              variant="secondary"
              style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color } : undefined}
            >
              #{tag.name}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Browse all articles tagged with <span className="font-medium">{tag.name}</span>
          </p>
        </div>
        
        <Suspense fallback={<ArticlesListSkeleton />}>
          <ArticlesList />
        </Suspense>
      </div>
    </div>
  )
}