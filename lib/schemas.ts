import { z } from 'zod'

// Base schemas
export const SlugSchema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

export const ContentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(z.any()), // Tiptap JSON content
})

// Article schemas
export const ArticleBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: SlugSchema,
  content: ContentSchema,
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  featured_image: z.string().url('Featured image must be a valid URL').optional(),
  status: z.enum(['draft', 'published', 'archived']),
})

export const ArticleInsertSchema = ArticleBaseSchema.extend({
  author_id: z.string().uuid('Invalid author ID'),
})

export const ArticleUpdateSchema = ArticleBaseSchema.partial().extend({
  author_id: z.string().uuid('Invalid author ID').optional(),
})

export const ArticleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  author_id: z.string().uuid().optional(),
  tag: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'published_at', 'title', 'view_count']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Tag schemas
export const TagBaseSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'),
  slug: SlugSchema,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
})

export const TagInsertSchema = TagBaseSchema

export const TagUpdateSchema = TagBaseSchema.partial()

// Category schemas
export const CategoryBaseSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
  slug: SlugSchema,
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  parent_id: z.string().uuid().optional(),
})

export const CategoryInsertSchema = CategoryBaseSchema

export const CategoryUpdateSchema = CategoryBaseSchema.partial()

// Comment schemas
export const CommentBaseSchema = z.object({
  article_id: z.string().uuid('Invalid article ID'),
  author_id: z.string().uuid('Invalid author ID'),
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment must be less than 2000 characters'),
  parent_id: z.string().uuid('Invalid parent comment ID').optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
})

export const CommentInsertSchema = CommentBaseSchema

export const CommentUpdateSchema = CommentBaseSchema.partial()

// Article-Tag relationship schemas
export const ArticleTagSchema = z.object({
  article_id: z.string().uuid('Invalid article ID'),
  tag_id: z.string().uuid('Invalid tag ID'),
})

// Article-Category relationship schemas
export const ArticleCategorySchema = z.object({
  article_id: z.string().uuid('Invalid article ID'),
  category_id: z.string().uuid('Invalid category ID'),
})

// View count increment schema
export const ViewCountSchema = z.object({
  article_id: z.string().uuid('Invalid article ID'),
})

// Export types
export type ArticleInput = z.infer<typeof ArticleInsertSchema>
export type ArticleUpdateInput = z.infer<typeof ArticleUpdateSchema>
export type ArticleQuery = z.infer<typeof ArticleQuerySchema>
export type TagInput = z.infer<typeof TagInsertSchema>
export type TagUpdateInput = z.infer<typeof TagUpdateSchema>
export type CategoryInput = z.infer<typeof CategoryInsertSchema>
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>
export type CommentInput = z.infer<typeof CommentInsertSchema>
export type CommentUpdateInput = z.infer<typeof CommentUpdateSchema>
export type ArticleTagInput = z.infer<typeof ArticleTagSchema>
export type ArticleCategoryInput = z.infer<typeof ArticleCategorySchema>
export type ViewCountInput = z.infer<typeof ViewCountSchema>

// Export schemas for use as values
export const ArticleInputSchema = ArticleInsertSchema
export const ArticleUpdateInputSchema = ArticleUpdateSchema
export const TagInputSchema = TagInsertSchema
export const TagUpdateInputSchema = TagUpdateSchema
export const CategoryInputSchema = CategoryInsertSchema
export const CategoryUpdateInputSchema = CategoryUpdateSchema
export const CommentInputSchema = CommentInsertSchema
export const CommentUpdateInputSchema = CommentUpdateSchema
