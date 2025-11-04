import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { Pagination } from '@/components/ui/Pagination'
import { tagsService } from '@/lib/articles'
import { generateTagMetadata } from '@/lib/metadata'

interface TagPageProps {
  params: { slug: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  try {
    const tag = await tagsService.getTagBySlug(params.slug)
    return generateTagMetadata(tag)
  } catch {
    return generateTagMetadata({ name: 'Tag not found', slug: params.slug })
  }
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const page = parseInt(searchParams.page || '1', 10)

  try {
    const [tag, articlesResponse] = await Promise.all([
      tagsService.getTagBySlug(params.slug),
      tagsService.getArticlesByTag(params.slug, page, 12)
    ])

    const { data: articles, pagination } = articlesResponse

    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <nav className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tags" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Tags
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{tag.name}</span>
          </nav>
          
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {tag.name}
            </h1>
            {tag.color && (
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: tag.color }}
              />
            )}
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Browse {tag.article_count} {tag.article_count === 1 ? 'article' : 'articles'} tagged with "{tag.name}"
          </p>
        </header>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No articles found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              There are no articles with the tag "{tag.name}" yet.
            </p>
            <Link
              href="/articles"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse all articles
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  showTags={true}
                  showReadTime={true}
                  showViewCount={true}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              pagination={pagination}
              baseUrl={`/tags/${params.slug}`}
              className="justify-center"
            />
          </>
        )}
      </main>
    )
  } catch (error) {
    console.error('Error loading tag page:', error)
    notFound()
  }
}