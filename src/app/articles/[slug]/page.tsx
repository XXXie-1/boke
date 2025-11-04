import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { articlesService } from '@/lib/articles'
import { generateArticleMetadata } from '@/lib/metadata'
import { formatDistanceToNow } from 'date-fns'
import { ClockIcon, EyeIcon, TagIcon, FolderIcon } from '@heroicons/react/24/outline'

interface ArticlePageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const article = await articlesService.getArticleBySlug(params.slug)
    return generateArticleMetadata(article)
  } catch {
    return generateArticleMetadata({
      title: 'Article not found',
      slug: params.slug,
    } as any)
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    // Get the article first
    const article = await articlesService.getArticleBySlug(params.slug)
    
    // Get related articles and increment view count in parallel
    const [relatedArticles] = await Promise.all([
      articlesService.getRelatedArticles(article.id, 3)
    ])

    // Increment view count (non-blocking)
    articlesService.incrementViewCount(article.id).catch(console.error)

    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="mb-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/articles" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Articles
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{article.title}</span>
          </nav>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {article.author && (
              <div className="flex items-center gap-2">
                {article.author.avatar_url && (
                  <Image
                    src={article.author.avatar_url}
                    alt={article.author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span>{article.author.name}</span>
              </div>
            )}
            
            {article.published_at && (
              <time dateTime={article.published_at}>
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </time>
            )}
            
            {article.read_time_minutes && (
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>{article.read_time_minutes} min read</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              <span>{article.view_count} views</span>
            </div>
          </div>

          {/* Tags and Categories */}
          <div className="flex flex-wrap gap-3">
            {article.article_categories && article.article_categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.article_categories.map(({ category }: any) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    <FolderIcon className="h-3 w-3" />
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
            
            {article.article_tags && article.article_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.article_tags.map(({ tag }: any) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : undefined,
                      borderColor: tag.color ? tag.color : undefined,
                    }}
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="mb-8">
            <Image
              src={article.featured_image}
              alt={article.title}
              width={800}
              height={400}
              className="w-full h-auto rounded-lg shadow-lg"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg max-w-none dark:prose-invert mb-12">
          {article.excerpt && (
            <div className="text-xl text-gray-600 dark:text-gray-300 mb-8 italic border-l-4 border-blue-500 pl-4">
              {article.excerpt}
            </div>
          )}
          
          {/* Note: In a real implementation, you'd render the Tiptap JSON content here */}
          <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
            {typeof article.content === 'string' 
              ? article.content 
              : JSON.stringify(article.content, null, 2)
            }
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-gray-200 dark:border-gray-700 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Related Articles
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((relatedArticle: any) => (
                <ArticleCard
                  key={relatedArticle.id}
                  article={relatedArticle}
                  showTags={true}
                  showReadTime={true}
                  showViewCount={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* Navigation */}
        <nav className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <div className="flex justify-between">
            <Link
              href="/articles"
              className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to Articles
            </Link>
            
            {/* In a real implementation, you'd add previous/next article navigation here */}
          </div>
        </nav>
      </main>
    )
  } catch (error) {
    console.error('Error loading article:', error)
    notFound()
  }
}