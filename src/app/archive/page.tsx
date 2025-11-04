import { Metadata } from 'next'
import Link from 'next/link'
import { archiveService } from '@/lib/articles'
import { generateMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata({
  title: 'Archive',
  description: 'Browse our complete article archive organized by year and month.',
  canonical: '/archive',
  keywords: ['archive', 'history', 'blog posts', 'articles'],
})

export default async function ArchivePage() {
  try {
    const archiveDates = await archiveService.getArchiveDates()

    // Group by year
    const archiveByYear = archiveDates.reduce((acc, date) => {
      if (!acc[date.year]) {
        acc[date.year] = []
      }
      acc[date.year].push(date)
      return acc
    }, {} as Record<number, typeof archiveDates>)

    const sortedYears = Object.keys(archiveByYear)
      .map(year => parseInt(year, 10))
      .sort((a, b) => b - a)

    // Calculate total articles
    const totalArticles = archiveDates.reduce((sum, date) => sum + date.count, 0)

    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Archive
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Browse our complete article archive organized by year and month. 
            {totalArticles > 0 && ` ${totalArticles} ${totalArticles === 1 ? 'article' : 'articles'} published since ${sortedYears[sortedYears.length - 1]}.`}
          </p>
        </header>

        {archiveDates.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No articles found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              There are no articles in the archive yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recent Years */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Recent Years
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedYears.slice(0, 6).map((year) => {
                  const yearData = archiveByYear[year]
                  const totalInYear = yearData.reduce((sum, month) => sum + month.count, 0)
                  
                  return (
                    <Link
                      key={year}
                      href={`/archive/${year}`}
                      className="group block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {year}
                        </h3>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                          {totalInYear} {totalInYear === 1 ? 'article' : 'articles'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {yearData.slice(0, 3).map((monthData) => (
                          <div key={`${year}-${monthData.month}`} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {monthData.monthName}
                            </span>
                            <span className="text-gray-500 dark:text-gray-500">
                              {monthData.count}
                            </span>
                          </div>
                        ))}
                        {yearData.length > 3 && (
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            +{yearData.length - 3} more months
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Complete Archive */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Complete Archive
              </h2>
              
              {sortedYears.map((year) => {
                const yearData = archiveByYear[year]
                const totalInYear = yearData.reduce((sum, month) => sum + month.count, 0)
                
                return (
                  <div key={year} className="mb-8 last:mb-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {year}
                      </h3>
                      <span className="text-gray-600 dark:text-gray-400">
                        {totalInYear} {totalInYear === 1 ? 'article' : 'articles'}
                      </span>
                    </div>
                    
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {yearData.map((monthData) => (
                        <Link
                          key={`${year}-${monthData.month}`}
                          href={`/archive/${year}/${monthData.month}`}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <span className="text-gray-900 dark:text-white">
                            {monthData.monthName}
                          </span>
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                            {monthData.count}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Statistics */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Archive Statistics
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {totalArticles}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Total Articles
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {sortedYears.length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Years Active
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {archiveDates.length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Months with Posts
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.round(totalArticles / Math.max(archiveDates.length, 1))}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Avg. per Month
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    )
  } catch (error) {
    console.error('Error loading archive page:', error)
    
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Archive
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We encountered an error while loading the archive. Please try again later.
          </p>
        </div>
      </main>
    )
  }
}