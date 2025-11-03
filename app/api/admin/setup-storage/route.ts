import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/media'

export async function POST(request: NextRequest) {
  try {
    const { bucket } = await request.json()
    
    if (!bucket) {
      return NextResponse.json(
        { error: 'Bucket name is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // Check if bucket exists, create if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === bucket)

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png', 
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/webm',
          'video/ogg',
        ],
        fileSizeLimit: 10485760, // 10MB
      })

      if (error) {
        throw new Error(`Failed to create bucket: ${error.message}`)
      }
    }

    return NextResponse.json({ 
      message: bucketExists ? 'Bucket already exists' : 'Bucket created successfully',
      bucket,
      exists: bucketExists
    })
  } catch (error) {
    console.error('Bucket setup failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup bucket' },
      { status: 500 }
    )
  }
}