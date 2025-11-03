'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TiptapRenderer } from './TiptapRenderer'
import { TableOfContents } from './TableOfContents'
import { ReadingProgress } from './ReadingProgress'
import { RelatedArticles } from './RelatedArticles'
import { 
  Calendar, 
  Clock, 
  Eye, 
  User, 
  Share2, 
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  content: any
  published_at: string
  view_count: number
  read_time_minutes?: number
  author: {
    name: string
    avatar_url?: string
    email?: string
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

interface ArticleDetailProps {
  article: Article
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  const [viewCount, setViewCount] = useState(article.view_count)
  const [copied, setCopied] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<string>('')

  // Increment view count
  useEffect(() => {
    const incrementViewCount = async () => {
      try {
        await fetch(`/api/articles/${article.slug}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ article_id: article.id }),
        })
        
        setViewCount(prev => prev + 1)
      } catch (error) {
        console.error('Failed to increment view count:', error)
      }
    }

    incrementViewCount()
  }, [article.id, article.slug])

  // Copy link functionality
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  // Social share functions
  const shareOnTwitter = () => {
    const text = `Check out this article: ${article.title}`
    const url = window.location.href
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const shareOnFacebook = () => {
    const url = window.location.href
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = window.location.href
    const title = article.title
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const headings = useMemo(() => {
    if (!article.content?.content) return []
    
    const extractHeadings = (content: any[]): any[] => {
      const headings: any[] = []
      
      const traverse = (nodes: any[]) => {
        nodes.forEach((node, index) => {
          if (node.type === 'heading' && node.attrs?.level) {
            const text = node.content?.map((textNode: any) => textNode.text || '').join('') || ''
            const id = `heading-${node.attrs.level}-${index}`
            headings.push({
              id,
              level: node.attrs.level,
              text,
              node
            })
          }
          
          if (node.content) {
            traverse(node.content)
          }
        })
      }
      
      traverse(content)
      return headings
    }
    
    return extractHeadings(article.content.content)
  }, [article.content])

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <ReadingProgress contentRef={contentRef} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/articles">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <article className="space-y-6">
            <header className="space-y-4">
              {/* Categories */}
              {article.article_categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.article_categories.map(({ category }) => (
                    <Link key={category.id} href={`/categories/${category.slug}`}>
                      <Badge variant="outline" className="hover:bg-accent">
                        {category.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  {article.author.avatar_url ? (
                    <Image
                      src={article.author.avatar_url}
                      alt={article.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="font-medium">{article.author.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={article.published_at}>
                    {formatDate(article.published_at)}
                  </time>
                </div>

                {article.read_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{article.read_time_minutes} min read</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{viewCount} views</span>
                </div>
              </div>

              {/* Tags */}
              {article.article_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.article_tags.map(({ tag }) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`}>
                      <Badge
                        variant="secondary"
                        className="text-xs hover:bg-accent"
                        style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color } : undefined}
                      >
                        #{tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Featured Image */}
              {article.featured_image && (
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
                </div>
              )}

              {/* Share Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                <span className="text-sm font-medium">Share this article:</span>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className={copied ? 'bg-green-50 border-green-200 text-green-700' : ''}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareOnTwitter}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareOnFacebook}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareOnLinkedIn}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content with TOC */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Table of Contents - Desktop */}
              {headings.length > 0 && (
                <aside className="lg:col-span-1 hidden lg:block">
                  <div className="sticky top-24 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Table of Contents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TableOfContents
                          headings={headings}
                          activeSection={activeSection}
                          setActiveSection={setActiveSection}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </aside>
              )}

              {/* Article Content */}
              <div className="lg:col-span-3" ref={contentRef}>
                <div className="prose prose-lg max-w-none">
                  <TiptapRenderer content={article.content} />
                </div>

                {/* Mobile TOC */}
                {headings.length > 0 && (
                  <div className="lg:hidden mt-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Table of Contents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TableOfContents
                          headings={headings}
                          activeSection={activeSection}
                          setActiveSection={setActiveSection}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Related Articles */}
          <div className="mt-16">
            <RelatedArticles
              currentArticleId={article.id}
              tags={article.article_tags.map(({ tag }) => tag.slug)}
              categories={article.article_categories.map(({ category }) => category.slug)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}