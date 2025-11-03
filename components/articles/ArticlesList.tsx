'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Clock, Eye, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Article {
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
  article_categories: Array<{
    category: {
      id: string
      name: string
      slug: string
    }
  }>
}

interface ArticlesResponse {
  data: Article[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

function ArticleCard({ article, isFeatured = false }: { article: Article; isFeatured?: boolean }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className={cn(
      'group overflow-hidden transition-all duration-200 hover:shadow-lg',
      isFeatured && 'md:col-span-2 md:row-span-2'
    )}>
      <Link href={`/articles/${article.slug}`} className="block">
        {article.featured_image && (
          <div className={cn(
            'relative overflow-hidden bg-muted',
            isFeatured ? 'h-64 md:h-96' : 'h-48'
          )}>
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <User className="h-4 w-4" />
            <span>{article.author.name}</span>
            <span>•</span>
            <Calendar className="h-4 w-4" />
            <time dateTime={article.published_at}>
              {formatDate(article.published_at)}
            </time>
          </div>
          
          <CardTitle className={cn(
            'line-clamp-2 group-hover:text-primary transition-colors',
            isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'
          )}>
            {article.title}
          </CardTitle>
          
          {article.excerpt && (
            <p className="text-muted-foreground line-clamp-3 mt-2">
              {article.excerpt}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {article.article_tags.map(({ tag }) => (
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
                  <span>{article.read_time_minutes} min</span>
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
  )
}

export function ArticlesList() {
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<ArticlesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentPage = parseInt(searchParams.get('page') || '1')
  const tag = searchParams.get('tag')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '12',
      status: 'published'
    })

    if (tag) params.set('tag', tag)
    if (category) params.set('category', category)
    if (search) params.set('search', search)

    return params.toString()
  }, [currentPage, tag, category, search])

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/articles?${queryParams}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles')
        }
        
        const data = await response.json()
        setArticles(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [queryParams])

  if (loading) {
    return <ArticlesListSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Failed to load articles</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!articles?.data.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No articles found</p>
        <Link href="/articles">
          <Button variant="outline">Browse All Articles</Button>
        </Link>
      </div>
    )
  }

  const featuredArticle = articles.data[0]
  const regularArticles = articles.data.slice(1)

  return (
    <div className="space-y-8">
      {/* Featured Article */}
      {featuredArticle && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Featured Article</h2>
          <ArticleCard article={featuredArticle} isFeatured />
        </div>
      )}

      {/* Regular Articles Grid */}
      {regularArticles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {articles.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={!articles.pagination.hasPrevPage}
            asChild={articles.pagination.hasPrevPage}
          >
            {articles.pagination.hasPrevPage ? (
              <Link href={`/articles?${new URLSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                page: (currentPage - 1).toString()
              }).toString()}`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Link>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </>
            )}
          </Button>

          <span className="text-sm text-muted-foreground px-4">
            Page {articles.pagination.page} of {articles.pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!articles.pagination.hasNextPage}
            asChild={articles.pagination.hasNextPage}
          >
            {articles.pagination.hasNextPage ? (
              <Link href={`/articles?${new URLSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                page: (currentPage + 1).toString()
              }).toString()}`}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}