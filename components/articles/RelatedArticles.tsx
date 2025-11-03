'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Clock, Eye, User } from 'lucide-react'

interface RelatedArticle {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at: string
  view_count: number
  read_time_minutes?: number
  author: {
    name: string
    avatar_url?: string
  }
  article_tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
      color?: string
    }
  }>
}

interface RelatedArticlesProps {
  currentArticleId: string
  tags: string[]
  categories: string[]
}

export function RelatedArticles({ currentArticleId, tags, categories }: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        setLoading(true)
        
        // Build query parameters for related articles
        const params = new URLSearchParams({
          limit: '3',
          status: 'published',
          sort_by: 'published_at',
          sort_order: 'desc'
        })

        // Add tags for matching
        if (tags.length > 0) {
          params.set('tag', tags[0]) // Use first tag as primary filter
        } else if (categories.length > 0) {
          params.set('category', categories[0]) // Use first category as fallback
        }

        const response = await fetch(`/api/articles?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch related articles')
        }
        
        const data = await response.json()
        
        // Filter out the current article and limit to 3 articles
        const filtered = data.data
          .filter((article: RelatedArticle) => article.id !== currentArticleId)
          .slice(0, 3)
        
        setRelatedArticles(filtered)
      } catch (error) {
        console.error('Failed to fetch related articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedArticles()
  }, [currentArticleId, tags, categories])

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardHeader>
                <div className="space-y-3">
                  <div className="h-6 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="h-6 w-12 bg-muted rounded-full animate-pulse" />
                    <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-10 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-6 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (relatedArticles.length === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Related Articles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Card key={article.id} className="group overflow-hidden transition-all duration-200 hover:shadow-lg">
            <Link href={`/articles/${article.slug}`} className="block">
              {article.featured_image ? (
                <div className="relative h-48 overflow-hidden bg-muted">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <div className="text-muted-foreground">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span className="truncate">{article.author.name}</span>
                  <span>•</span>
                  <Calendar className="h-4 w-4" />
                  <time dateTime={article.published_at}>
                    {formatDate(article.published_at)}
                  </time>
                </div>
                
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-lg">
                  {article.title}
                </CardTitle>
                
                {article.excerpt && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mt-2">
                    {article.excerpt}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {article.article_tags.slice(0, 2).map(({ tag }) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                        style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color } : undefined}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {article.read_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.read_time_minutes}m</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.view_count}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}