'use client'

import { useState, useCallback } from 'react'
import { mediaUploadService, type UploadResult } from '@/lib/media'
import { Button } from '@/components/ui/Button'

interface MediaUploadPanelProps {
  onMediaSelect: (media: UploadResult) => void
  onClose: () => void
  bucket?: string
  acceptedTypes?: string[]
  maxSize?: number
}

export function MediaUploadPanel({
  onMediaSelect,
  onClose,
  bucket = 'media',
  acceptedTypes = ['image/*', 'video/*'],
  maxSize = 10 * 1024 * 1024, // 10MB
}: MediaUploadPanelProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)
    setUploading(true)
    setProgress(0)

    try {
      const result = await mediaUploadService.uploadMedia({
        file,
        bucket,
        onProgress: (progressValue) => {
          setProgress(progressValue)
        },
      })

      onMediaSelect(result)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [bucket, onMediaSelect, onClose])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Upload Media</h3>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading... {progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-4xl">📁</div>
              <div>
                <p className="text-lg font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-gray-500">
                  Accepted: {acceptedTypes.join(', ')}
                </p>
                <p className="text-sm text-gray-500">
                  Max size: {formatFileSize(maxSize)}
                </p>
              </div>
              <input
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <Button asChild>
                <label htmlFor="file-input" className="cursor-pointer">
                  Choose Files
                </label>
              </Button>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-2">Supported formats:</p>
          <ul className="space-y-1">
            <li>• Images: JPEG, PNG, GIF, WebP</li>
            <li>• Videos: MP4, WebM, OGG</li>
            <li>• Maximum file size: {formatFileSize(maxSize)}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}