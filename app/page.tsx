'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string
  created_at: string
  view_count?: number
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/articles?status=published&limit=6')
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles')
        }
        
        const data = await response.json()
        setArticles(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog Platform</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Read articles and join the discussion with our commenting system
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/articles/sample-article">
              <Button>View Sample Article</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline">Admin Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Threaded Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Engage in meaningful discussions with nested comment threads and replies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Smart Avatars</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Unique, deterministic avatars generated from user nicknames for visual identity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Markdown Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Format your comments with Markdown syntax and live preview functionality.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Articles */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Articles</h2>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : articles.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-4">No articles published yet</p>
                  <p className="text-sm">Check back later for new content!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      <Link 
                        href={`/articles/${article.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {article.excerpt && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {article.view_count !== undefined && (
                        <span>{article.view_count} views</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Demo Notice */}
        <div className="mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-6">
              <h3 className="font-semibold text-blue-900 mb-2">Demo Information</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• This is a demonstration of the comment system with full moderation capabilities.</p>
                <p>• View the sample article to see the comment interface in action.</p>
                <p>• Access the admin dashboard to moderate comments (requires admin token).</p>
                <p>• Comments are moderated and only approved comments appear publicly.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
