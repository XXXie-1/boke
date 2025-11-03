import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { articlesService } from '@/lib/articles'
import { generateMetadata as generateSEOMetadata, generateBlogStructuredData } from '@/lib/metadata'
import { ArticleStats } from '@/components/ui/ArticleMeta'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Articles',
  description: 'Read our latest articles and blog posts on various topics.',
  canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles`,
})

export default async function ArticlesPage() {
  try {
    const articlesResponse = await articlesService.getArticles({
      page: 1,
      limit: 12,
      status: 'published',
      sort_by: 'published_at',
      sort_order: 'desc',
    })

    const articles = articlesResponse.data
    const structuredData = generateBlogStructuredData()

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
        
        <main className="max-w-6xl mx-auto px-4 py-8">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Articles
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Read our latest articles and blog posts on various topics.
            </p>
          </header>
          
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No articles found. Check back later for new content!
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <Link href={`/articles/${article.slug}`} className="block">
                    {article.featured_image && (
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {article.title}
                      </h2>
                      
                      {article.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.article_tags?.slice(0, 3).map(({ tag }: any) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      
                      <ArticleStats
                        readTime={article.read_time_minutes}
                        viewCount={article.view_count}
                        className="text-xs"
                      />
                      
                      {article.published_at && (
                        <time 
                          dateTime={article.published_at}
                          className="block text-xs text-gray-500 dark:text-gray-500 mt-2"
                        >
                          {new Date(article.published_at).toLocaleDateString()}
                        </time>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </main>
      </>
    )
  } catch (error) {
    console.error('Error loading articles:', error)
    
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Articles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We encountered an error while loading the articles. Please try again later.
          </p>
        </div>
      </main>
    )
  }
}