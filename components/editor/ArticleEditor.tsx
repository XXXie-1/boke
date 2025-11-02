'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { ArticlePreview } from '@/components/editor/ArticlePreview'
import { MediaUploadPanel } from '@/components/editor/MediaUploadPanel'
import { type UploadResult } from '@/lib/media'
import { validateArticleForm, sanitizeArticleData, type ArticleFormData } from '@/lib/editor-schemas'
import { extractPlainText, calculateReadTime } from '@/lib/utils'

interface ArticleEditorProps {
  initialData?: Partial<ArticleFormData>
  onSave: (data: ArticleFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function ArticleEditor({
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}: ArticleEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [showMediaPanel, setShowMediaPanel] = useState(false)
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    content: { type: 'doc', content: [] },
    excerpt: '',
    featured_image: '',
    status: 'draft',
    tags: [],
    categories: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [readTime, setReadTime] = useState(0)

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }))
    }
  }, [initialData])

  // Calculate read time when content changes
  useEffect(() => {
    if (formData.content) {
      const plainText = extractPlainText(formData.content)
      const calculatedReadTime = calculateReadTime(plainText)
      setReadTime(calculatedReadTime)
    }
  }, [formData.content])

  const handleInputChange = (field: keyof ArticleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleTitleChange = (title: string) => {
    handleInputChange('title', title)
    
    // Auto-generate slug if slug is empty
    if (!formData.slug || formData.slug === '') {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
      handleInputChange('slug', slug)
    }
  }

  const handleMediaSelect = (media: UploadResult) => {
    handleInputChange('featured_image', media.url)
  }

  const handleSave = async () => {
    // Validate form data
    const validation = validateArticleForm(formData)
    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.error.issues.forEach(issue => {
        const path = issue.path.join('.')
        newErrors[path] = issue.message
      })
      setErrors(newErrors)
      return
    }

    // Sanitize data
    const sanitizedData = sanitizeArticleData(formData)
    
    // Add calculated read time
    sanitizedData.read_time_minutes = readTime

    try {
      await onSave(sanitizedData)
    } catch (error) {
      console.error('Save failed:', error)
      setErrors({ submit: 'Failed to save article. Please try again.' })
    }
  }

  const insertImageIntoEditor = (imageUrl: string) => {
    // This would need to be implemented to insert images at cursor position
    // For now, we'll just update the featured image
    handleInputChange('featured_image', imageUrl)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">
              {initialData?.id ? 'Edit Article' : 'Create New Article'}
            </h1>
            <div className="flex gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Article'}
              </Button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Title and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter article title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="article-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>
          </div>

          {/* Excerpt and Featured Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the article"
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) => handleInputChange('featured_image', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowMediaPanel(true)}
                >
                  Upload
                </Button>
              </div>
              {errors.featured_image && (
                <p className="mt-1 text-sm text-red-600">{errors.featured_image}</p>
              )}
            </div>
          </div>

          {/* Tags, Categories, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <select
                multiple
                value={formData.tags}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  handleInputChange('tags', selected)
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                <option value="">Select tags...</option>
                {/* This would be populated with actual tags from API */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.categories[0] || ''}
                onChange={(e) => {
                  const value = e.target.value
                  handleInputChange('categories', value ? [value] : [])
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category...</option>
                {/* This would be populated with actual categories from API */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Read Time Display */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated read time:</span>
              <span className="font-medium">{readTime} minute{readTime !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('edit')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'edit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Content Editor or Preview */}
          <div className="min-h-[500px]">
            {activeTab === 'edit' ? (
              <TiptapEditor
                content={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="Start writing your article..."
              />
            ) : (
              <div className="p-4 border rounded-lg">
                <ArticlePreview
                  content={formData.content}
                  title={formData.title}
                  featuredImage={formData.featured_image}
                />
              </div>
            )}
          </div>

          {/* Error display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>

      {/* Media Upload Panel */}
      {showMediaPanel && (
        <MediaUploadPanel
          onMediaSelect={handleMediaSelect}
          onClose={() => setShowMediaPanel(false)}
        />
      )}
    </div>
  )
}