import { mockArticles, mockTags, mockCategories } from './mock-data'
import { calculatePagination } from './utils'

// Mock service for development when Supabase is not configured
export const mockService = {
  // Articles
  async getArticles(query: any) {
    const { page = 1, limit = 10, status, tag, category, search, sort_by = 'published_at', sort_order = 'desc' } = query
    
    let filteredArticles = [...mockArticles]
    
    // Apply filters
    if (status) {
      filteredArticles = filteredArticles.filter(article => article.status === status)
    }
    
    if (tag) {
      filteredArticles = filteredArticles.filter(article => 
        article.article_tags.some(({ tag: articleTag }) => articleTag.slug === tag)
      )
    }
    
    if (category) {
      filteredArticles = filteredArticles.filter(article => 
        article.article_categories.some(({ category: articleCategory }) => articleCategory.slug === category)
      )
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredArticles = filteredArticles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchLower))
      )
    }
    
    // Apply sorting
    filteredArticles.sort((a, b) => {
      let aValue: any = a[sort_order === 'asc' ? sort_by : sort_by]
      let bValue: any = b[sort_order === 'asc' ? sort_by : sort_by]
      
      if (sort_by === 'published_at' || sort_by === 'created_at' || sort_by === 'updated_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      
      if (sort_order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    // Apply pagination
    const total = filteredArticles.length
    const pagination = calculatePagination(page, limit, total)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex)
    
    return {
      data: paginatedArticles,
      pagination
    }
  },

  async getArticleBySlug(slug: string) {
    const article = mockArticles.find(a => a.slug === slug)
    if (!article) {
      throw new Error('Article not found')
    }
    return article
  },

  async getArticleById(id: string) {
    const article = mockArticles.find(a => a.id === id)
    if (!article) {
      throw new Error('Article not found')
    }
    return article
  },

  async incrementViewCount(articleId: string) {
    const article = mockArticles.find(a => a.id === articleId)
    if (!article) {
      throw new Error('Article not found')
    }
    article.view_count += 1
    return article.view_count
  },

  // Tags
  async getTagBySlug(slug: string) {
    const tag = mockTags.find(t => t.slug === slug)
    if (!tag) {
      throw new Error('Tag not found')
    }
    return tag
  },

  async getTags() {
    return mockTags
  },

  // Categories
  async getCategoryBySlug(slug: string) {
    const category = mockCategories.find(c => c.slug === slug)
    if (!category) {
      throw new Error('Category not found')
    }
    return category
  },

  async getCategories() {
    return mockCategories
  }
}