import React from 'react'

interface ArticleMetaProps {
  readTime?: number
  viewCount?: number
  publishedAt?: string
  className?: string
}

export function ArticleMeta({ 
  readTime, 
  viewCount, 
  publishedAt, 
  className = '' 
}: ArticleMetaProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className={`flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {readTime && (
        <span className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {readTime} min read
        </span>
      )}
      
      {viewCount !== undefined && (
        <span className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          {viewCount.toLocaleString()} views
        </span>
      )}
      
      {publishedAt && (
        <time dateTime={publishedAt} className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formatDate(publishedAt)}
        </time>
      )}
    </div>
  )
}

interface ArticleStatsProps {
  readTime?: number
  viewCount?: number
  className?: string
}

export function ArticleStats({ readTime, viewCount, className = '' }: ArticleStatsProps) {
  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 ${className}`}>
      {readTime && (
        <span>
          {readTime} min read
        </span>
      )}
      
      {readTime && viewCount !== undefined && (
        <span>•</span>
      )}
      
      {viewCount !== undefined && (
        <span>
          {viewCount.toLocaleString()} views
        </span>
      )}
    </div>
  )
}