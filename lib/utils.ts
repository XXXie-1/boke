import slugify from 'slugify'
import { nanoid } from 'nanoid'
import { generateJSON } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

// Slug generation
export const generateSlug = (text: string, existingSlugs: string[] = []): string => {
  const baseSlug = slugify(text, {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  })

  let slug = baseSlug
  let counter = 1

  // Ensure uniqueness
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// Read time calculation (average reading speed: 200 words per minute)
export const calculateReadTime = (content: string): number => {
  // Remove HTML tags and count words
  const plainText = content.replace(/<[^>]*>/g, '')
  const wordCount = plainText.trim().split(/\s+/).length
  const readTime = Math.ceil(wordCount / 200)
  return Math.max(1, readTime) // Minimum 1 minute
}

// Tiptap JSON serialization
export const markdownToTiptapJSON = (markdown: string) => {
  const extensions = [
    StarterKit,
  ]

  return generateJSON(markdown, extensions)
}

export const tiptapJSONToMarkdown = (json: any): string => {
  // This would require a proper markdown export function
  // For now, we'll return a basic text extraction
  if (typeof json === 'object' && json.content) {
    return extractTextFromJSON(json)
  }
  return ''
}

const extractTextFromJSON = (node: any): string => {
  if (node.type === 'text') {
    return node.text || ''
  }
  
  if (node.content && Array.isArray(node.content)) {
    return node.content.map(extractTextFromJSON).join('')
  }
  
  return ''
}

// Extract plain text from Tiptap JSON for word count
export const extractPlainText = (json: any): string => {
  if (!json || typeof json !== 'object') {
    return ''
  }
  
  return extractTextFromJSON(json)
}

// Content validation
export const validateTiptapJSON = (json: any): boolean => {
  if (!json || typeof json !== 'object') {
    return false
  }
  
  if (json.type !== 'doc') {
    return false
  }
  
  if (!Array.isArray(json.content)) {
    return false
  }
  
  return true
}

// URL utilities
export const generateArticleUrl = (slug: string): string => {
  return `/articles/${slug}`
}

export const generateCategoryUrl = (slug: string): string => {
  return `/categories/${slug}`
}

export const generateTagUrl = (slug: string): string => {
  return `/tags/${slug}`
}

// Date utilities
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString()
}

export const formatDateFromAPI = (dateString: string): Date => {
  return new Date(dateString)
}

// Pagination utilities
export const calculatePagination = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    next: hasNextPage ? page + 1 : null,
    prev: hasPrevPage ? page - 1 : null,
  }
}

// Array utilities
export const uniqueArray = <T>(array: T[]): T[] => {
  return Array.from(new Set(array))
}

export const groupBy = <T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = key(item)
    groups[groupKey] = groups[groupKey] || []
    groups[groupKey].push(item)
    return groups
  }, {} as Record<K, T[]>)
}
