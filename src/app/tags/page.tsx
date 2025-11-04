import { Metadata } from 'next'
import Link from 'next/link'
import { tagsService } from '@/lib/articles'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Tags',
  description: 'Browse all tags and discover articles by topic.',
  canonical: '/tags',
  keywords: ['tags', 'topics', 'categories', 'blog'],
})

export default async function TagsPage() {
  try {
    const tags = await tagsService.getAllTags()

    // Group tags by first letter for better organization
    const tagsByLetter = tags.reduce((acc, tag) => {
      const firstLetter = tag.name[0].toUpperCase()
      if (!acc[firstLetter]) {
        acc[firstLetter] = []
      }
      acc[firstLetter].push(tag)
      return acc
    }, {} as Record<string, typeof tags>)

    const sortedLetters = Object.keys(tagsByLetter).sort()

    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Tags
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Browse all tags and discover articles by topic. Click on any tag to see related articles.
          </p>
        </header>

        {tags.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No tags found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tags haven't been created yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tag Cloud */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Popular Tags
              </h2>
              <div className="flex flex-wrap gap-3">
                {tags
                  .sort((a, b) => (b.article_count || 0) - (a.article_count || 0))
                  .slice(0, 20)
                  .map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : undefined,
                        border: tag.color ? `1px solid ${tag.color}40` : undefined,
                      }}
                    >
                      {tag.color && (
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      <span className="font-medium">{tag.name}</span>
                      <span className="text-sm opacity-75">({tag.article_count || 0})</span>
                    </Link>
                  ))}
              </div>
            </div>

            {/* Alphabetical List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                All Tags ({tags.length})
              </h2>
              
              {sortedLetters.map((letter) => (
                <div key={letter} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {letter}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {tagsByLetter[letter].map((tag: any) => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.slug}`}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          {tag.color && (
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                          )}
                          <span className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {tag.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {tag.article_count || 0}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    )
  } catch (error) {
    console.error('Error loading tags page:', error)
    
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Tags
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We encountered an error while loading the tags. Please try again later.
          </p>
        </div>
      </main>
    )
  }
}