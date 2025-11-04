import { Metadata } from 'next'
import Link from 'next/link'
import { categoriesService } from '@/lib/articles'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Categories',
  description: 'Browse all categories and discover articles by topic.',
  canonical: '/categories',
  keywords: ['categories', 'topics', 'subjects', 'blog'],
})

export default async function CategoriesPage() {
  try {
    const categories = await categoriesService.getAllCategories()

    // Sort by article count (most popular first)
    const sortedCategories = [...categories].sort((a, b) => (b.article_count || 0) - (a.article_count || 0))

    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Categories
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Browse all categories and discover articles by topic. Click on any category to see related articles.
          </p>
        </header>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No categories found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Categories haven't been created yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                      <svg 
                        className="w-6 h-6 text-green-600 dark:text-green-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {category.article_count || 0} {category.article_count === 1 ? 'article' : 'articles'}
                  </span>
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                    View articles →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Popular Categories Section */}
        {categories.length > 6 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Popular Categories
            </h2>
            <div className="flex flex-wrap gap-3">
              {sortedCategories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                    />
                  </svg>
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm opacity-75">({category.article_count || 0})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    )
  } catch (error) {
    console.error('Error loading categories page:', error)
    
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We encountered an error while loading the categories. Please try again later.
          </p>
        </div>
      </main>
    )
  }
}