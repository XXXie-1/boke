import { z } from 'zod'

// Extend the existing article schema for editor use
export const ArticleEditorSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: z.object({
    type: z.literal('doc'),
    content: z.array(z.any()),
  }),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  featured_image: z.string().url('Featured image must be a valid URL').optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  tags: z.array(z.string().uuid()).default([]),
  categories: z.array(z.string().uuid()).default([]),
  read_time_minutes: z.number().int().min(1).optional(),
})

// Media upload schema
export const MediaUploadSchema = z.object({
  file: z.instanceof(File),
  bucket: z.string().min(1, 'Bucket is required'),
  path: z.string().optional(),
  contentType: z.string().optional(),
})

// Form validation schema
export const ArticleFormSchema = ArticleEditorSchema.extend({
  // Allow string URLs for image fields that will be converted to proper URLs
  featured_image: z.string().url('Featured image must be a valid URL').optional().or(z.literal('')),
  // Allow empty arrays for tags and categories
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
})

// Export types
export type ArticleEditorInput = z.infer<typeof ArticleEditorSchema>
export type ArticleFormData = z.infer<typeof ArticleFormSchema>
export type MediaUploadInput = z.infer<typeof MediaUploadSchema>

// Validation helpers
export const validateArticleEditor = (data: unknown) => {
  return ArticleEditorSchema.safeParse(data)
}

export const validateArticleForm = (data: unknown) => {
  return ArticleFormSchema.safeParse(data)
}

export const validateMediaUpload = (data: unknown) => {
  return MediaUploadSchema.safeParse(data)
}

// Sanitization helpers
export const sanitizeArticleData = (data: ArticleFormData): ArticleEditorInput => {
  return {
    ...data,
    title: data.title.trim(),
    slug: data.slug.trim().toLowerCase(),
    excerpt: data.excerpt?.trim() || undefined,
    featured_image: data.featured_image?.trim() || undefined,
    content: data.content,
    status: data.status,
    tags: data.tags.filter(Boolean),
    categories: data.categories.filter(Boolean),
  }
}