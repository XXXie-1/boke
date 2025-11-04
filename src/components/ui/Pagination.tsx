import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Pagination as PaginationType } from '@/lib/articles'

interface PaginationProps {
  pagination: PaginationType
  baseUrl: string
  className?: string
}

export function Pagination({ pagination, baseUrl, className = '' }: PaginationProps) {
  const { page, totalPages, hasNext, hasPrev } = pagination

  if (totalPages <= 1) return null

  const createPageUrl = (pageNum: number) => {
    const url = new URL(baseUrl, 'http://localhost')
    url.searchParams.set('page', pageNum.toString())
    return url.pathname + url.search
  }

  // Generate page numbers to show
  const getVisiblePages = () => {
    const delta = 2 // Number of pages to show around current page
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i)
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      for (let i = 1; i < range[0]; i++) {
        rangeWithDots.push(i)
      }
    }

    rangeWithDots.push(...range)

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      for (let i = (range[range.length - 1] || 0) + 1; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <nav className={`flex items-center justify-between ${className}`} aria-label="Pagination">
      <div className="flex items-center gap-2">
        {/* Previous button */}
        {hasPrev ? (
          <Link
            href={createPageUrl(page - 1)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md cursor-not-allowed">
            <ChevronLeftIcon className="h-4 w-4" />
            Previous
          </span>
        )}

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {visiblePages.map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            ) : (
              <Link
                key={pageNum}
                href={createPageUrl(pageNum as number)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pageNum === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={pageNum === page ? 'page' : undefined}
              >
                {pageNum}
              </Link>
            )
          ))}
        </div>

        {/* Simple page info for mobile */}
        <div className="sm:hidden">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
        </div>

        {/* Next button */}
        {hasNext ? (
          <Link
            href={createPageUrl(page + 1)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Next page"
          >
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md cursor-not-allowed">
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </span>
        )}
      </div>

      {/* Results info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {((page - 1) * pagination.limit) + 1} to{' '}
        {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} results
      </div>
    </nav>
  )
}