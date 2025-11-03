'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArticleEditor } from '@/components/editor/ArticleEditor'
import { type ArticleFormData } from '@/lib/editor-schemas'
import { articlesService } from '@/lib/articles'

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [article, setArticle] = useState<Partial<ArticleFormData> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [serviceRoleKey, setServiceRoleKey] = useState<string>('')

  useEffect(() => {
    // Get service role key from environment or localStorage for demo purposes
    const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 
                localStorage.getItem('admin_service_role_key') || 
                ''
    setServiceRoleKey(key)

    if (key && articleId) {
      fetchArticle(key)
    }
  }, [articleId])

  const fetchArticle = async (key: string) => {
    setIsFetching(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        headers: {
          'x-admin-service-role-key': key,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch article')
      }

      const articleData = await response.json()
      
      // Transform data for editor
      const editorData: Partial<ArticleFormData> = {
        id: articleData.id,
        title: articleData.title,
        slug: articleData.slug,
        content: typeof articleData.content === 'string' 
          ? JSON.parse(articleData.content) 
          : articleData.content,
        excerpt: articleData.excerpt,
        featured_image: articleData.featured_image,
        status: articleData.status,
        tags: articleData.article_tags?.map((tag: any) => tag.tag.id) || [],
        categories: articleData.article_categories?.map((cat: any) => cat.category.id) || [],
      }

      setArticle(editorData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch article')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSave = async (data: ArticleFormData) => {
    if (!serviceRoleKey) {
      throw new Error('Admin service role key is required')
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-service-role-key': serviceRoleKey,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update article')
      }

      const updatedArticle = await response.json()
      setArticle(prev => ({ ...prev, ...updatedArticle }))
      
      // Show success message
      const url = new URL(window.location.href)
      url.searchParams.set('success', 'true')
      window.history.replaceState({}, '', url.toString())
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/articles')
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Article</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/articles')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Articles
          </button>
        </div>
      </div>
    )
  }

  if (!serviceRoleKey) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Admin Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please enter the Supabase service role key to access the admin panel.
          </p>
          <input
            type="password"
            placeholder="Enter service role key"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            onChange={(e) => setServiceRoleKey(e.target.value)}
          />
          <button
            onClick={() => {
              if (serviceRoleKey) {
                localStorage.setItem('admin_service_role_key', serviceRoleKey)
                fetchArticle(serviceRoleKey)
              }
            }}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Authenticate
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ArticleEditor
        initialData={article || {}}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  )
}