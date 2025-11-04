import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { Pagination } from '@/components/ui/Pagination'
import { archiveService } from '@/lib/articles'
import { generateArchiveMetadata } from '@/lib/metadata'

interface ArchivePageProps {
  params: { year: string; month: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: ArchivePageProps): Promise<Metadata> {
  const year = parseInt(params.year, 10)
  const month = parseInt(params.month, 10)
  
  // Validate year and month
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return generateArchiveMetadata(year, month)
  }
  
  return generateArchiveMetadata(year, month)
}

export default async function ArchivePage({ params, searchParams }: ArchivePageProps) {
  const year = parseInt(params.year, 10)
  const month = parseInt(params.month, 10)
  const page = parseInt(searchParams.page || '1', 10)

  // Validate year and month
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    notFound()
  }

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' })

  try {
    const articlesResponse = await archiveService.getArticlesByDate(year, month, page, 12)
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
            <Link href="/archive" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Archive
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/archive/${year}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {year}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{monthName}</span>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {monthName} {year} Archive
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Browse {pagination.total} {pagination.total === 1 ? 'article' : 'articles'} published in {monthName} {year}
          </p>
        </header>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No articles found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              There are no articles published in {monthName} {year}.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/archive/${year}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View {year} Archive
              </Link>
              <Link
                href="/archive"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Browse All Archives
              </Link>
            </div>
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
              baseUrl={`/archive/${year}/${month}`}
              className="justify-center"
            />
          </>
        )}
      </main>
    )
  } catch (error) {
    console.error('Error loading archive page:', error)
    notFound()
  }
}