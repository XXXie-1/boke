'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArticleEditor } from '@/components/editor/ArticleEditor'
import { type ArticleFormData } from '@/lib/editor-schemas'
import { generateJSON } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

export default function NewArticlePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [serviceRoleKey, setServiceRoleKey] = useState<string>('')

  useEffect(() => {
    // Get service role key from environment or localStorage for demo purposes
    // In production, this should be handled securely
    const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 
                localStorage.getItem('admin_service_role_key') || 
                ''
    setServiceRoleKey(key)
  }, [])

  const handleSave = async (data: ArticleFormData) => {
    if (!serviceRoleKey) {
      throw new Error('Admin service role key is required')
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-service-role-key': serviceRoleKey,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create article')
      }

      const article = await response.json()
      router.push(`/admin/articles/${article.id}/edit?success=true`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/articles')
  }

  // Initialize empty content for new article
  const initialContent = generateJSON('<p>Start writing your article...</p>', [StarterKit])

  return (
    <div className="min-h-screen bg-gray-50">
      {!serviceRoleKey && (
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
                  setServiceRoleKey(serviceRoleKey)
                }
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Authenticate
            </button>
          </div>
        </div>
      )}

      <ArticleEditor
        initialData={{
          content: initialContent,
        }}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  )
}