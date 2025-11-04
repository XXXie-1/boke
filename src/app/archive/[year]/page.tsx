import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { Pagination } from '@/components/ui/Pagination'
import { archiveService } from '@/lib/articles'
import { generateArchiveMetadata } from '@/lib/metadata'

interface YearArchivePageProps {
  params: { year: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: YearArchivePageProps): Promise<Metadata> {
  const year = parseInt(params.year, 10)
  
  if (isNaN(year) || year < 2000 || year > new Date().getFullYear() + 1) {
    return generateArchiveMetadata(year)
  }
  
  return generateArchiveMetadata(year)
}

export default async function YearArchivePage({ params, searchParams }: YearArchivePageProps) {
  const year = parseInt(params.year, 10)
  const page = parseInt(searchParams.page || '1', 10)

  // Validate year
  if (isNaN(year) || year < 2000 || year > new Date().getFullYear() + 1) {
    notFound()
  }

  try {
    // Get all articles for the year (no month filter)
    const articlesResponse = await archiveService.getArticlesByDate(year, 0, page, 12)
    const { data: articles, pagination } = articlesResponse

    // Get archive dates to show month breakdown
    const archiveDates = await archiveService.getArchiveDates()
    const yearMonths = archiveDates.filter(date => date.year === year)

    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <nav className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/archive" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Archive
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{year}</span>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {year} Archive
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Browse {pagination.total} {pagination.total === 1 ? 'article' : 'articles'} published in {year}
          </p>
        </header>

        {/* Month Breakdown */}
        {yearMonths.length > 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Articles by Month
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {yearMonths.map((monthData) => (
                <Link
                  key={`${year}-${monthData.month}`}
                  href={`/archive/${year}/${monthData.month}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white font-medium">
                    {monthData.monthName}
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                    {monthData.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No articles found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              There are no articles published in {year}.
            </p>
            <Link
              href="/archive"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse All Archives
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
              baseUrl={`/archive/${year}`}
              className="justify-center"
            />
          </>
        )}
      </main>
    )
  } catch (error) {
    console.error('Error loading year archive page:', error)
    notFound()
  }
}