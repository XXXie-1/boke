import Link from 'next/link'
import Image from 'next/image'
import { ArticleWithRelations } from '@/lib/articles'
import { formatDistanceToNow } from 'date-fns'

interface ArticleCardProps {
  article: ArticleWithRelations
  showExcerpt?: boolean
  showTags?: boolean
  showCategories?: boolean
  showAuthor?: boolean
  showReadTime?: boolean
  showViewCount?: boolean
  className?: string
}

export function ArticleCard({
  article,
  showExcerpt = true,
  showTags = true,
  showCategories = false,
  showAuthor = false,
  showReadTime = true,
  showViewCount = false,
  className = ''
}: ArticleCardProps) {
  return (
    <article className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <Link href={`/articles/${article.slug}`} className="block">
        {article.featured_image && (
          <div className="relative h-48 w-full">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover rounded-t-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {article.title}
          </h2>
          
          {showExcerpt && article.excerpt && (
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
              {article.excerpt}
            </p>
          )}
          
          {showCategories && article.article_categories && article.article_categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {article.article_categories.slice(0, 2).map(({ category }) => (
                <span
                  key={category.id}
                  className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
          
          {showTags && article.article_tags && article.article_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.article_tags.slice(0, 3).map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                  style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              {showAuthor && article.author && (
                <span className="flex items-center gap-1">
                  {article.author.avatar_url && (
                    <Image
                      src={article.author.avatar_url}
                      alt={article.author.name}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  )}
                  {article.author.name}
                </span>
              )}
              
              {showReadTime && article.read_time_minutes && (
                <span>{article.read_time_minutes} min read</span>
              )}
              
              {showViewCount && (
                <span>{article.view_count} views</span>
              )}
            </div>
            
            {article.published_at && (
              <time dateTime={article.published_at}>
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </time>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}