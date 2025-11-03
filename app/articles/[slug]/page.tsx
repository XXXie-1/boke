'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CommentsSection } from '@/components/comments/CommentsSection'

interface Article {
  id: string
  title: string
  slug: string
  content: any // Tiptap JSON content
  excerpt?: string
  featured_image?: string
  status: string
  created_at: string
  updated_at: string
  view_count?: number
}

const ArticlePage = () => {
  const params = useParams()
  const slug = params.slug as string
  
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/articles/${slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Article not found')
          }
          throw new Error('Failed to fetch article')
        }
        
        const data = await response.json()
        setArticle(data.data)
        
        // Increment view count
        fetch(`/api/articles/${slug}/view`, { method: 'POST' }).catch(() => {
          // Ignore view count errors
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchArticle()
    }
  }, [slug])

  // Extract plain text from Tiptap JSON for display
  const extractTextFromJSON = (content: any): string => {
    if (!content || typeof content !== 'object') {
      return ''
    }
    
    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || ''
      }
      
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('')
      }
      
      return ''
    }
    
    return extractText(content)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
                  <p className="text-muted-foreground mb-6">
                    {error || 'The article you\'re looking for doesn\'t exist or has been removed.'}
                  </p>
                  <a href="/" className="text-blue-600 hover:underline">
                    Return to homepage
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const articleText = extractTextFromJSON(article.content)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Article header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold leading-tight">
                {article.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Published {new Date(article.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {article.view_count !== undefined && (
                  <span>{article.view_count} views</span>
                )}
              </div>
            </CardHeader>
            
            {article.featured_image && (
              <div className="px-6">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            
            <CardContent>
              <div className="prose prose-lg max-w-none">
                {article.excerpt && (
                  <div className="text-lg text-muted-foreground mb-6 italic">
                    {article.excerpt}
                  </div>
                )}
                
                <div className="whitespace-pre-wrap leading-relaxed">
                  {articleText}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments section */}
          <CommentsSection 
            articleId={article.id}
            maxNestingLevel={3}
          />
        </div>
      </div>
    </div>
  )
}

export default ArticlePage
