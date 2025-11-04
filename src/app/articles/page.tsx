'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Pagination } from '@/components/ui/Pagination'
import { SearchBox } from '@/components/search/SearchBox'
import { articlesService, tagsService, categoriesService, ArticleWithRelations, Tag, Category } from '@/lib/articles'
import { generateMetadata as generateBaseMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

// Loading component
function ArticlesLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    </main>
  )
}

// Articles list component
function ArticlesList() {
  const searchParams = useSearchParams()
  
  // State
  const [articles, setArticles] = useState<ArticleWithRelations[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get current filters from URL
  const getCurrentFilters = () => ({
    page: parseInt(searchParams.get('page') || '1', 10),
    tag: searchParams.get('tag') || undefined,
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
  })

  const [filters, setFilters] = useState(() => getCurrentFilters())

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  // Load articles when filters change
  useEffect(() => {
    loadArticles()
  }, [filters])

  // Update URL when filters change
  useEffect(() => {
    const url = new URL(window.location.href)
    
    // Update search params
    url.searchParams.set('page', filters.page.toString())
    if (filters.tag) url.searchParams.set('tag', filters.tag)
    if (filters.category) url.searchParams.set('category', filters.category)
    if (filters.search) url.searchParams.set('search', filters.search)
    
    // Remove empty params
    if (!filters.tag) url.searchParams.delete('tag')
    if (!filters.category) url.searchParams.delete('category')
    if (!filters.search) url.searchParams.delete('search')
    
    window.history.replaceState({}, '', url.toString())
  }, [filters])

  const loadInitialData = async () => {
    try {
      const [tagsData, categoriesData] = await Promise.all([
        tagsService.getAllTags(),
        categoriesService.getAllCategories()
      ])
      
      setTags(tagsData)
      setCategories(categoriesData)
    } catch (err) {
      console.error('Error loading initial data:', err)
    }
  }

  const loadArticles = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await articlesService.getArticles({
        page: filters.page,
        limit: 12,
        status: 'published',
        tag: filters.tag,
        category: filters.category,
        search: filters.search,
        sort_by: 'published_at',
        sort_order: 'desc'
      })

      setArticles(response.data)
      setPagination(response.pagination)
    } catch (err) {
      console.error('Error loading articles:', err)
      setError('Failed to load articles. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTagToggle = (tagSlug: string) => {
    const newTags = filters.tag === tagSlug ? undefined : tagSlug
    setFilters(prev => ({ ...prev, tag: newTags, page: 1 }))
  }

  const handleCategoryToggle = (categorySlug: string) => {
    const newCategory = filters.category === categorySlug ? undefined : categorySlug
    setFilters(prev => ({ ...prev, category: newCategory, page: 1 }))
  }

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query, page: 1 }))
  }

  const handleClearFilters = () => {
    setFilters(prev => ({ ...prev, tag: undefined, category: undefined, search: undefined, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const selectedTags = filters.tag ? [filters.tag] : []
  const selectedCategories = filters.category ? [filters.category] : []

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Articles
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Discover our latest articles on technology, development, and innovation.
        </p>

        {/* Search Box */}
        <div className="max-w-2xl mb-6">
          <SearchBox
            placeholder="Search articles..."
            onSearch={handleSearch}
            initialValue={filters.search || ''}
          />
        </div>
      </header>

      <div className="flex gap-8">
        {/* Sidebar with Filters */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <FilterPanel
            tags={tags}
            categories={categories}
            selectedTags={selectedTags}
            selectedCategories={selectedCategories}
            onTagToggle={handleTagToggle}
            onCategoryToggle={handleCategoryToggle}
            onClearFilters={handleClearFilters}
            className="sticky top-4"
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Active Filters Display */}
          {(filters.tag || filters.category || filters.search) && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  {filters.search && (
                    <span className="mr-4">
                      Search: "{filters.search}"
                    </span>
                  )}
                  {filters.tag && (
                    <span className="mr-4">
                      Tag: {tags.find(t => t.slug === filters.tag)?.name || filters.tag}
                    </span>
                  )}
                  {filters.category && (
                    <span className="mr-4">
                      Category: {categories.find(c => c.slug === filters.category)?.name || filters.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                Loading articles...
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                Error Loading Articles
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={loadArticles}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Articles Grid */}
          {!isLoading && !error && (
            <>
              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    No articles found
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {filters.search || filters.tag || filters.category
                      ? 'No articles match your current filters. Try adjusting your search or filters.'
                      : 'No articles have been published yet. Check back later!'}
                  </p>
                  {(filters.search || filters.tag || filters.category) && (
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 mb-8">
                    {articles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        showTags={true}
                        showCategories={true}
                        showReadTime={true}
                        showViewCount={true}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && (
                    <Pagination
                      pagination={pagination}
                      baseUrl="/articles"
                      className="justify-center"
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

// Main page component
export default function ArticlesPage() {
  return (
    <Suspense fallback={<ArticlesLoading />}>
      <ArticlesList />
    </Suspense>
  )
}

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
  return generateBaseMetadata({
    title: 'Articles',
    description: 'Discover our latest articles on technology, development, and innovation.',
    canonical: '/articles',
    keywords: ['articles', 'blog', 'technology', 'development', 'programming'],
  })
}