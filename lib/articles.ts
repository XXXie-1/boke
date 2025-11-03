import {
  createSupabaseServerClient,
  Article,
  ArticleInsert,
  ArticleUpdate,
  Tag,
  Category,
  Comment,
  ArticleStats,
} from './supabase'
import {
  ArticleQuery,
  ArticleInput,
  ArticleUpdateInput,
  TagInput,
  CategoryInput,
  CommentInput,
  ArticleTagInput,
  ArticleCategoryInput,
  ViewCountInput,
  ArticleInputSchema,
  ArticleUpdateInputSchema,
  ArticleQuerySchema,
  TagInputSchema,
  CategoryInputSchema,
  CommentInputSchema,
} from './schemas'
import {
  generateSlug,
  calculateReadTime,
  extractPlainText,
  validateTiptapJSON,
  calculatePagination,
} from './utils'

// Get Supabase client
const getSupabaseClient = () => createSupabaseServerClient()

// Articles CRUD operations
export const articlesService = {
  // Get all articles with pagination and filtering
  async getArticles(query: ArticleQuery) {
    const supabase = getSupabaseClient()
    const {
      page,
      limit,
      status,
      author_id,
      tag,
      category,
      search,
      sort_by,
      sort_order,
    } = query

    let queryBuilder = supabase.from('articles').select(
      `
        *,
        author:profiles(id, name, email, avatar_url),
        article_tags(tag:tags(id, name, slug, color)),
        article_categories(category:categories(id, name, slug, description))
      `,
      { count: 'exact' }
    )

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
      queryBuilder = queryBuilder.contains('article_categories.category.slug', [
        category,
      ])
    }

    if (search) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%`
      )
    }

    // Apply sorting
    queryBuilder = queryBuilder.order(sort_by, {
      ascending: sort_order === 'asc',
    })

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
  },

  // Get single article by slug
  async getArticleBySlug(slug: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('articles')
      .select(
        `
        *,
        author:profiles(id, name, email, avatar_url),
        article_tags(tag:tags(id, name, slug, color)),
        article_categories(category:categories(id, name, slug, description)),
        comments(
          id,
          content,
          author:profiles(id, name, email, avatar_url),
          parent_id,
          status,
          created_at,
          updated_at
        )
      `
      )
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
  },

  // Get single article by ID
  async getArticleById(id: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('articles')
      .select(
        `
        *,
        author:profiles(id, name, email, avatar_url),
        article_tags(tag:tags(id, name, slug, color)),
        article_categories(category:categories(id, name, slug, description))
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Article not found')
      }
      throw new Error(`Failed to fetch article: ${error.message}`)
    }

    return data
  },

  // Create new article
  async createArticle(
    input: ArticleInput,
    tags?: string[],
    categories?: string[]
  ) {
    const supabase = getSupabaseClient()

    // Generate unique slug if needed
    let slug = input.slug
    if (!slug) {
      slug = generateSlug(input.title)
      // Check for uniqueness
      const existingSlugs = await this.getExistingSlugs()
      slug = generateSlug(input.title, existingSlugs)
    }

    // Calculate read time
    const plainText = extractPlainText(input.content)
    const readTime = calculateReadTime(plainText)

    // Validate content
    if (!validateTiptapJSON(input.content)) {
      throw new Error('Invalid content format')
    }

    const articleData = {
      ...input,
      slug,
      read_time_minutes: readTime,
      view_count: 0,
    }

    const { data, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create article: ${error.message}`)
    }

    // Handle tags
    if (tags && tags.length > 0) {
      await this.attachTagsToArticle(data.id, tags)
    }

    // Handle categories
    if (categories && categories.length > 0) {
      await this.attachCategoriesToArticle(data.id, categories)
    }

    return data
  },

  // Update article
  async updateArticle(
    id: string,
    input: ArticleUpdateInput,
    tags?: string[],
    categories?: string[]
  ) {
    const supabase = getSupabaseClient()

    const updateData: any = {
      ...input,
      // Convert content to string if it's an object
      ...(input.content && {
        content:
          typeof input.content === 'string'
            ? input.content
            : JSON.stringify(input.content),
      }),
    }

    // Recalculate read time if content changed
    if (input.content) {
      if (!validateTiptapJSON(input.content)) {
        throw new Error('Invalid content format')
      }

      const plainText = extractPlainText(input.content)
      updateData.read_time_minutes = calculateReadTime(plainText)
    }

    // Generate new slug if title changed and no slug provided
    if (input.title && !input.slug) {
      const existingSlugs = await this.getExistingSlugs(id)
      updateData.slug = generateSlug(input.title, existingSlugs)
    }

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update article: ${error.message}`)
    }

    // Update tags if provided
    if (tags !== undefined) {
      await this.updateArticleTags(id, tags)
    }

    // Update categories if provided
    if (categories !== undefined) {
      await this.updateArticleCategories(id, categories)
    }

    return data
  },

  // Delete article
  async deleteArticle(id: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from('articles').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete article: ${error.message}`)
    }

    return true
  },

  // Increment view count
  async incrementViewCount(articleId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.rpc('increment_view_count', {
      article_id: articleId,
    })

    if (error) {
      // Fallback to manual increment if RPC function doesn't exist
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
        throw new Error(
          `Failed to increment view count: ${updateError.message}`
        )
      }

      return { view_count: newViewCount }
    }

    return data
  },

  // Get article stats
  async getArticleStats(articleId: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('article_stats')
      .select('*')
      .eq('article_id', articleId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch article stats: ${error.message}`)
    }

    return data
  },

  // Helper methods
  async getExistingSlugs(excludeId?: string) {
    const supabase = getSupabaseClient()

    let query = supabase.from('articles').select('slug')

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch existing slugs: ${error.message}`)
    }

    return data?.map((article) => article.slug) || []
  },

  async attachTagsToArticle(articleId: string, tagIds: string[]) {
    const supabase = getSupabaseClient()

    const relations = tagIds.map((tagId) => ({
      article_id: articleId,
      tag_id: tagId,
    }))

    const { error } = await supabase.from('article_tags').insert(relations)

    if (error) {
      throw new Error(`Failed to attach tags: ${error.message}`)
    }
  },

  async attachCategoriesToArticle(articleId: string, categoryIds: string[]) {
    const supabase = getSupabaseClient()

    const relations = categoryIds.map((categoryId) => ({
      article_id: articleId,
      category_id: categoryId,
    }))

    const { error } = await supabase
      .from('article_categories')
      .insert(relations)

    if (error) {
      throw new Error(`Failed to attach categories: ${error.message}`)
    }
  },

  async updateArticleTags(articleId: string, tagIds: string[]) {
    const supabase = getSupabaseClient()

    // Remove existing tags
    const { error: deleteError } = await supabase
      .from('article_tags')
      .delete()
      .eq('article_id', articleId)

    if (deleteError) {
      throw new Error(`Failed to remove existing tags: ${deleteError.message}`)
    }

    // Attach new tags
    if (tagIds.length > 0) {
      await this.attachTagsToArticle(articleId, tagIds)
    }
  },

  async updateArticleCategories(articleId: string, categoryIds: string[]) {
    const supabase = getSupabaseClient()

    // Remove existing categories
    const { error: deleteError } = await supabase
      .from('article_categories')
      .delete()
      .eq('article_id', articleId)

    if (deleteError) {
      throw new Error(
        `Failed to remove existing categories: ${deleteError.message}`
      )
    }

    // Attach new categories
    if (categoryIds.length > 0) {
      await this.attachCategoriesToArticle(articleId, categoryIds)
    }
  },
}

// Tags CRUD operations
export const tagsService = {
  async getAllTags() {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('tags')
      .select(
        `
        *,
        article_tags(count)
      `
      )
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch tags: ${error.message}`)
    }

    return (
      data?.map((tag) => ({
        ...tag,
        article_count: tag.article_tags?.[0]?.count || 0,
      })) || []
    )
  },

  async getTagBySlug(slug: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Tag not found')
      }
      throw new Error(`Failed to fetch tag: ${error.message}`)
    }

    return data
  },

  async createTag(input: TagInput) {
    const supabase = getSupabaseClient()

    // Generate slug if not provided
    let slug = input.slug
    if (!slug) {
      slug = generateSlug(input.name)
    }

    const tagData = { ...input, slug }

    const { data, error } = await supabase
      .from('tags')
      .insert(tagData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create tag: ${error.message}`)
    }

    return data
  },

  async updateTag(id: string, input: Partial<TagInput>) {
    const supabase = getSupabaseClient()

    const updateData: Partial<TagInput> = { ...input }

    // Generate new slug if name changed and no slug provided
    if (input.name && !input.slug) {
      updateData.slug = generateSlug(input.name)
    }

    const { data, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update tag: ${error.message}`)
    }

    return data
  },

  async deleteTag(id: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from('tags').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete tag: ${error.message}`)
    }

    return true
  },
}

// Categories CRUD operations
export const categoriesService = {
  async getAllCategories() {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .select(
        `
        *,
        parent:categories(id, name, slug),
        children:categories(id, name, slug),
        article_categories(count)
      `
      )
      .is('parent_id', null)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    return (
      data?.map((category) => ({
        ...category,
        article_count: category.article_categories?.[0]?.count || 0,
      })) || []
    )
  },

  async getCategoryBySlug(slug: string) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('categories')
      .select(
        `
        *,
        parent:categories(id, name, slug),
        children:categories(id, name, slug)
      `
      )
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Category not found')
      }
      throw new Error(`Failed to fetch category: ${error.message}`)
    }

    return data
  },

  async createCategory(input: CategoryInput) {
    const supabase = getSupabaseClient()

    // Generate slug if not provided
    let slug = input.slug
    if (!slug) {
      slug = generateSlug(input.name)
    }

    const categoryData = { ...input, slug }

    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`)
    }

    return data
  },

  async updateCategory(id: string, input: Partial<CategoryInput>) {
    const supabase = getSupabaseClient()

    const updateData: Partial<CategoryInput> = { ...input }

    // Generate new slug if name changed and no slug provided
    if (input.name && !input.slug) {
      updateData.slug = generateSlug(input.name)
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`)
    }

    return data
  },

  async deleteCategory(id: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`)
    }

    return true
  },
}

// Comments CRUD operations
export const commentsService = {
  async getCommentsByArticleId(
    articleId: string,
    status: 'approved' | 'pending' | 'rejected' = 'approved'
  ) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        author:profiles(id, name, email, avatar_url),
        parent:comments(id, content),
        replies:comments(
          id,
          content,
          author:profiles(id, name, email, avatar_url),
          created_at
        )
      `
      )
      .eq('article_id', articleId)
      .eq('status', status)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`)
    }

    return data || []
  },

  async createComment(input: CommentInput) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('comments')
      .insert(input)
      .select(
        `
        *,
        author:profiles(id, name, email, avatar_url)
      `
      )
      .single()

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`)
    }

    return data
  },

  async updateComment(id: string, input: Partial<CommentInput>) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('comments')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update comment: ${error.message}`)
    }

    return data
  },

  async deleteComment(id: string) {
    const supabase = getSupabaseClient()

    const { error } = await supabase.from('comments').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete comment: ${error.message}`)
    }

    return true
  },
}
