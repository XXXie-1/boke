import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { articlesService } from '@/lib/articles'
import { generateMetadata as generateSEOMetadata, generateArticleStructuredData } from '@/lib/metadata'
import { ArticleMeta } from '@/components/ui/ArticleMeta'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const article = await articlesService.getArticleBySlug(params.slug)
    
    if (!article) {
      return {
        title: 'Article Not Found',
        description: 'The requested article could not be found.',
      }
    }

    return generateSEOMetadata({
      title: article.title,
      description: article.excerpt || undefined,
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`,
      ogImage: article.featured_image || undefined,
      ogType: 'article',
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
      author: article.author?.name || article.author?.email,
      tags: article.article_tags?.map((tag: any) => tag.tag.name) || [],
      readTime: article.read_time_minutes || undefined,
      viewCount: article.view_count || undefined,
    })
  } catch (error) {
    console.error('Error generating article metadata:', error)
    return generateSEOMetadata({
      title: 'Error',
      description: 'An error occurred while loading this article.',
    })
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  try {
    const article = await articlesService.getArticleBySlug(params.slug)
    
    if (!article || article.status !== 'published') {
      notFound()
    }

    const structuredData = generateArticleStructuredData(article)

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
        
        <article className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {article.author && (
                  <div className="flex items-center gap-3">
                    {article.author.avatar_url && (
                      <Image
                        src={article.author.avatar_url}
                        alt={article.author.name || 'Author'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {article.author.name || article.author.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Author
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <ArticleMeta
                readTime={article.read_time_minutes}
                viewCount={article.view_count}
                publishedAt={article.published_at || undefined}
              />
            </div>
            
            {article.featured_image && (
              <Image
                src={article.featured_image}
                alt={article.title}
                width={800}
                height={400}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            
            {article.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 italic">
                {article.excerpt}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-6">
              {article.article_tags?.map(({ tag }: any) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}
              {article.article_categories?.map(({ category }: any) => (
                <span
                  key={category.id}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>
          </header>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Article content would be rendered here using a Tiptap renderer */}
            <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {JSON.stringify(article.content, null, 2)}
            </div>
          </div>
        </article>
      </>
    )
  } catch (error) {
    console.error('Error loading article:', error)
    notFound()
  }
}