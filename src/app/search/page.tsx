'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { SearchBox } from '@/components/search/SearchBox'
import { articlesService } from '@/lib/articles'
import { ArticleWithRelations } from '@/lib/articles'
import { generateSearchMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'
import { MagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

// Loading component
function SearchLoading() {
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

// Search results component
function SearchResults() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<ArticleWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const searchResults = await articlesService.searchArticles(searchQuery, 20)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Perform initial search if query is provided
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  // Update URL when query changes
  useEffect(() => {
    const url = new URL(window.location.href)
    if (query.trim()) {
      url.searchParams.set('q', query.trim())
    } else {
      url.searchParams.delete('q')
    }
    window.history.replaceState({}, '', url.toString())
  }, [query])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Search
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Find articles, topics, and more across our blog.
        </p>

        {/* Search Box */}
        <div className="max-w-2xl">
          <SearchBox
            placeholder="Search articles, topics, and more..."
            onSearch={performSearch}
            initialValue={query}
            className="mb-4"
          />
        </div>
      </header>

      {/* Search Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MagnifyingGlassIcon className="h-5 w-5 animate-spin" />
            Searching...
          </div>
        </div>
      ) : hasSearched ? (
        <>
          {results.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                No results found for "{query}"
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Try adjusting your search terms, or browse our articles by tags or categories.
              </p>
              
              <div className="flex gap-4 justify-center">
                <a
                  href="/articles"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Articles
                </a>
                <a
                  href="/tags"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Browse Tags
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Search Results
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Found {results.length} {results.length === 1 ? 'article' : 'articles'} matching "{query}"
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {results.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    showTags={true}
                    showReadTime={true}
                    showViewCount={true}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : query.trim() ? (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Type your search query above and press Enter to see results.
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            What are you looking for?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Search for articles by title, content, or topics. Try searching for specific keywords or browse our content by tags and categories.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 max-w-2xl mx-auto">
            <a
              href="/articles"
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <DocumentTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="font-medium text-gray-900 dark:text-white">All Articles</span>
            </a>
            <a
              href="/tags"
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 bg-green-600 dark:bg-green-400 rounded-full mb-2"></div>
              <span className="font-medium text-gray-900 dark:text-white">Browse Tags</span>
            </a>
            <a
              href="/categories"
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 bg-purple-600 dark:bg-purple-400 rounded mb-2"></div>
              <span className="font-medium text-gray-900 dark:text-white">Categories</span>
            </a>
          </div>
        </div>
      )}
    </main>
  )
}

// Main page component
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchResults />
    </Suspense>
  )
}

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
  return generateSearchMetadata()
}