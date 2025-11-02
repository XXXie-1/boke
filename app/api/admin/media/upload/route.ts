import { NextResponse } from 'next/server'
import { mediaUploadService } from '@/lib/media'
import { validateMediaUpload } from '@/lib/editor-schemas'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string || 'media'
    const path = formData.get('path') as string

    // Validate input
    const validation = validateMediaUpload({ file, bucket, path })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid upload data', details: validation.error.issues },
        { status: 400 }
      )
    }

    // Upload file
    const result = await mediaUploadService.uploadMedia({
      file,
      bucket,
      path,
      onProgress: (progress) => {
        // Progress would be handled differently in a real implementation
        // Could use Server-Sent Events or return a job ID for polling
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to upload media:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}