import { createServerSupabaseClient, Article, Tag, Category, ReadingHistory, ArticleStats } from './supabase'
import { SupabasePerformance } from './supabase'

// Get Supabase client for server-side operations
const getSupabaseClient = () => createServerSupabaseClient()

// Pagination utilities
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ArticleQuery {
  page?: number
  limit?: number
  status?: 'draft' | 'published' | 'archived'
  author_id?: string
  tag?: string
  category?: string
  search?: string
  year?: number
  month?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface ArticleWithRelations extends Article {
  article_tags?: { tag: Tag }[]
  article_categories?: { category: Category }[]
  author?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
}

export function calculatePagination(page: number, limit: number, total: number): Pagination {
  const totalPages = Math.ceil(total / limit)
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// Articles service with discovery features
export const articlesService = {
  // Get all articles with pagination and filtering
  async getArticles(query: ArticleQuery = {}) {
    return SupabasePerformance.trackOperation('getArticles', async () => {
      const supabase = getSupabaseClient()
      const { 
        page = 1, 
        limit = 12, 
        status, 
        author_id, 
        tag, 
        category, 
        search, 
        year,
        month,
        sort_by = 'published_at', 
        sort_order = 'desc' 
      } = query
      
      let queryBuilder = supabase
        .from('articles')
        .select(`
          *,
          author:profiles(id, name, email, avatar_url),
          article_tags(tag:tags(id, name, slug, color)),
          article_categories(category:categories(id, name, slug, description))
        `, { count: 'exact' })

      // Apply filters
      if (status) {
        queryBuilder = queryBuilder.eq('status', status)
      }
      
      if (author_id) {
        queryBuilder = queryBuilder.eq('author_id', author_id)
      }
      
      if (tag) {
        queryBuilder = queryBuilder.contains('article_tags.tag.slug', [tag])
      }
      
      if (category) {
        queryBuilder = queryBuilder.contains('article_categories.category.slug', [category])
      }
      
      if (search) {
        queryBuilder = queryBuilder.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`)
      }

      // Archive filtering by year and month
      if (year) {
        const startDate = new Date(year, month ? month - 1 : 0, 1).toISOString()
        const endDate = new Date(year, month ? month : 12, month ? 0 : 31, 23, 59, 59).toISOString()
        queryBuilder = queryBuilder
          .gte('published_at', startDate)
          .lt('published_at', endDate)
      }

      // Apply sorting
      queryBuilder = queryBuilder.order(sort_by, { ascending: sort_order === 'asc' })

      // Apply pagination
      const offset = (page - 1) * limit
      queryBuilder = queryBuilder.range(offset, offset + limit - 1)

      const { data, error, count } = await queryBuilder

      if (error) {
        throw new Error(`Failed to fetch articles: ${error.message}`)
      }

      const pagination = calculatePagination(page, limit, count || 0)

      return {
        data: data || [],
        pagination,
      }
    })
  },

  // Get single article by slug
  async getArticleBySlug(slug: string) {
    return SupabasePerformance.trackOperation('getArticleBySlug', async () => {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(id, name, email, avatar_url),
          article_tags(tag:tags(id, name, slug, color)),
          article_categories(category:categories(id, name, slug, description))
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Article not found')
        }
        throw new Error(`Failed to fetch article: ${error.message}`)
      }

      return data
    })
  },

  // Search articles using full-text search
  async searchArticles(query: string, limit = 10, offset = 0) {
    return SupabasePerformance.trackOperation('searchArticles', async () => {
      const supabase = getSupabaseClient()
      
      // Try using the search function first
      try {
        const { data, error } = await supabase.rpc('search_articles', {
          query,
          limit,
          offset
        })

        if (error) throw error
        return data || []
      } catch {
        // Fallback to basic text search
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            author:profiles(id, name, email, avatar_url),
            article_tags(tag:tags(id, name, slug, color)),
            article_categories(category:categories(id, name, slug, description))
          `)
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
          .order('published_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error
        return data || []
      }
    })
  },

  // Get related articles based on shared tags
  async getRelatedArticles(articleId: string, limit = 5) {
    return SupabasePerformance.trackOperation('getRelatedArticles', async () => {
      const supabase = getSupabaseClient()
      
      // Try using the related articles function first
      try {
        const { data, error } = await supabase.rpc('get_related_articles', {
          article_id: articleId,
          limit
        })

        if (error) throw error
        return data || []
      } catch {
        // Fallback: get articles with shared tags
        // First get the tags of the current article
        const { data: articleTags } = await supabase
          .from('article_tags')
          .select('tag_id')
          .eq('article_id', articleId)

        if (!articleTags || articleTags.length === 0) {
          return []
        }

        const tagIds = articleTags.map(at => at.tag_id)
        
        // Get other articles with the same tags
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            author:profiles(id, name, email, avatar_url),
            article_tags(tag:tags(id, name, slug, color))
          `)
          .eq('status', 'published')
          .neq('id', articleId)
          .in('article_tags.tag_id', tagIds)
          .order('published_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        return data || []
      }
    })
  },

  // Get reading history for a user
  async getReadingHistory(userId: string, limit = 20) {
    return SupabasePerformance.trackOperation('getReadingHistory', async () => {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('reading_history')
        .select(`
          *,
          article:articles(id, title, slug, excerpt, featured_image, published_at, read_time_minutes)
        `)
        .eq('user_id', userId)
        .order('read_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    })
  },

  // Add article to reading history
  async addToReadingHistory(userId: string, articleId: string, readPercentage?: number) {
    return SupabasePerformance.trackOperation('addToReadingHistory', async () => {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('reading_history')
        .upsert({
          user_id: userId,
          article_id: articleId,
          read_percentage: readPercentage,
          read_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    })
  },

  // Increment view count
  async incrementViewCount(articleId: string) {
    return SupabasePerformance.trackOperation('incrementViewCount', async () => {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase.rpc('increment_view_count', {
        article_id: articleId
      })

      if (error) {
        // Fallback to manual increment
        const { data: article } = await supabase
          .from('articles')
          .select('view_count')
          .eq('id', articleId)
          .single()

        if (!article) {
          throw new Error('Article not found')
        }

        const newViewCount = article.view_count + 1
        
        const { error: updateError } = await supabase
          .from('articles')
          .update({ view_count: newViewCount })
          .eq('id', articleId)

        if (updateError) {
          throw new Error(`Failed to increment view count: ${updateError.message}`)
        }

        return { view_count: newViewCount }
      }

      return data
    })
  },
}

// Tags service
export const tagsService = {
  async getAllTags() {
    return SupabasePerformance.trackOperation('getAllTags', async () => {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          article_tags(count)
        `)
        .order('name')

      if (error) throw error

      return data?.map(tag => ({
        ...tag,
        article_count: tag.article_tags?.[0]?.count || 0,
      })) || []
    })
  },

  async getTagBySlug(slug: string) {
    return SupabasePerformance.trackOperation('getTagBySlug', async () => {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          article_tags(count)
        `)
        .eq('slug', slug)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Tag not found')
        }
        throw error
      }

      return {
        ...data,
        article_count: data.article_tags?.[0]?.count || 0,
      }
    })
  },

  async getArticlesByTag(tagSlug: string, page = 1, limit = 12) {
    return SupabasePerformance.trackOperation('getArticlesByTag', async () => {
      return articlesService.getArticles({
        tag: tagSlug,
        page,
        limit,
        status: 'published',
        sort_by: 'published_at',
        sort_order: 'desc'
      })
    })
  },
}

// Categories service
export const categoriesService = {
  async getAllCategories() {
    return SupabasePerformance.trackOperation('getAllCategories', async () => {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          article_categories(count)
        `)
        .order('name')

      if (error) throw error

      return data?.map(category => ({
        ...category,
        article_count: category.article_categories?.[0]?.count || 0,
      })) || []
    })
  },

  async getCategoryBySlug(slug: string) {
    return SupabasePerformance.trackOperation('getCategoryBySlug', async () => {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          article_categories(count)
        `)
        .eq('slug', slug)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Category not found')
        }
        throw error
      }

      return {
        ...data,
        article_count: data.article_categories?.[0]?.count || 0,
      }
    })
  },

  async getArticlesByCategory(categorySlug: string, page = 1, limit = 12) {
    return SupabasePerformance.trackOperation('getArticlesByCategory', async () => {
      return articlesService.getArticles({
        category: categorySlug,
        page,
        limit,
        status: 'published',
        sort_by: 'published_at',
        sort_order: 'desc'
      })
    })
  },
}

// Archive service
export const archiveService = {
  async getArchiveDates() {
    return SupabasePerformance.trackOperation('getArchiveDates', async () => {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('articles')
        .select('published_at')
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })

      if (error) throw error

      // Group by year and month
      const archiveMap = new Map<string, number>()
      
      data?.forEach(article => {
        if (article.published_at) {
          const date = new Date(article.published_at)
          const year = date.getFullYear()
          const month = date.getMonth() + 1
          const key = `${year}-${month.toString().padStart(2, '0')}`
          
          archiveMap.set(key, (archiveMap.get(key) || 0) + 1)
        }
      })

      // Convert to array and sort
      return Array.from(archiveMap.entries())
        .map(([key, count]) => {
          const [year, month] = key.split('-')
          return {
            year: parseInt(year),
            month: parseInt(month),
            monthName: new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' }),
            count
          }
        })
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year
          return b.month - a.month
        })
    })
  },

  async getArticlesByDate(year: number, month: number, page = 1, limit = 12) {
    return SupabasePerformance.trackOperation('getArticlesByDate', async () => {
      return articlesService.getArticles({
        year,
        month,
        page,
        limit,
        status: 'published',
        sort_by: 'published_at',
        sort_order: 'desc'
      })
    })
  },
}

// Export types for convenience
export type { Article, Tag, Category, ReadingHistory, ArticleStats } from './supabase'