import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client for storage operations
export const createSupabaseAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Media upload utilities
export interface UploadOptions {
  file: File
  bucket: string
  path?: string
  contentType?: string
  onProgress?: (progress: number) => void
}

export interface UploadResult {
  url: string
  path: string
  size: number
  contentType: string
}

export class MediaUploadService {
  private supabase = createSupabaseAdminClient()

  async uploadMedia(options: UploadOptions): Promise<UploadResult> {
    const { file, bucket, path, contentType, onProgress } = options

    // Generate unique path if not provided
    const filePath = path || this.generateFilePath(file.name)

    // Validate file
    this.validateFile(file)

    try {
      // Upload file
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: contentType || file.type,
          upsert: false,
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return {
        url: publicUrl,
        path: data.path,
        size: file.size,
        contentType: file.type,
      }
    } catch (error) {
      throw new Error(`Media upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteMedia(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path])

      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }

      return true
    } catch (error) {
      throw new Error(`Media deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn)

      if (error) {
        throw new Error(`Signed URL creation failed: ${error.message}`)
      }

      return data.signedUrl
    } catch (error) {
      throw new Error(`Signed URL creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private generateFilePath(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    const nameWithoutExt = originalName.replace(`.${extension}`, '')
    const slug = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '-')
    
    return `uploads/${timestamp}-${random}-${slug}.${extension}`
  }

  private validateFile(file: File): void {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB')
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Allowed types: JPEG, PNG, GIF, WebP, MP4, WebM, OGG')
    }
  }
}

export const mediaUploadService = new MediaUploadService()