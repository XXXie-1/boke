'use server'

import { revalidateTag } from 'next/cache'
import { articlesService, tagsService, categoriesService, commentsService } from './articles'
import { ArticleInputSchema, ArticleUpdateInputSchema, TagInputSchema, CategoryInputSchema, CommentInputSchema } from './schemas'
import { z } from 'zod'

// Article Actions
export async function getArticles(query: any) {
  try {
    return await articlesService.getArticles(query)
  } catch (error) {
    console.error('Error fetching articles:', error)
    throw error
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    return await articlesService.getArticleBySlug(slug)
  } catch (error) {
    console.error('Error fetching article:', error)
    throw error
  }
}

export async function createArticle(data: any, tags?: string[], categories?: string[]) {
  try {
    const articleData = ArticleInputSchema.parse(data)
    const result = await articlesService.createArticle(articleData, tags, categories)
    
    // Revalidate cache
    revalidateTag('articles')
    
    return result
  } catch (error) {
    console.error('Error creating article:', error)
    throw error
  }
}

export async function updateArticle(slug: string, data: any, tags?: string[], categories?: string[]) {
  try {
    // Get article by slug to get ID
    const existingArticle = await articlesService.getArticleBySlug(slug)
    
    const updateData = ArticleUpdateInputSchema.parse(data)
    const result = await articlesService.updateArticle(existingArticle.id, updateData, tags, categories)
    
    // Revalidate cache
    revalidateTag('articles')
    revalidateTag(`article:${slug}`)
    
    return result
  } catch (error) {
    console.error('Error updating article:', error)
    throw error
  }
}

export async function deleteArticle(slug: string) {
  try {
    // Get article by slug to get ID
    const existingArticle = await articlesService.getArticleBySlug(slug)
    
    await articlesService.deleteArticle(existingArticle.id)
    
    // Revalidate cache
    revalidateTag('articles')
    revalidateTag(`article:${slug}`)
    
    return true
  } catch (error) {
    console.error('Error deleting article:', error)
    throw error
  }
}

export async function incrementArticleViewCount(slug: string) {
  try {
    // Get article by slug to get ID
    const article = await articlesService.getArticleBySlug(slug)
    
    const result = await articlesService.incrementViewCount(article.id)
    
    // Revalidate cache
    revalidateTag(`article:${slug}`)
    revalidateTag('article-views')
    
    return result
  } catch (error) {
    console.error('Error incrementing view count:', error)
    throw error
  }
}

// Tag Actions
export async function getAllTags() {
  try {
    return await tagsService.getAllTags()
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw error
  }
}

export async function getTagBySlug(slug: string) {
  try {
    return await tagsService.getTagBySlug(slug)
  } catch (error) {
    console.error('Error fetching tag:', error)
    throw error
  }
}

export async function createTag(data: any) {
  try {
    const tagData = TagInputSchema.parse(data)
    const result = await tagsService.createTag(tagData)
    
    // Revalidate cache
    revalidateTag('tags')
    
    return result
  } catch (error) {
    console.error('Error creating tag:', error)
    throw error
  }
}

// Category Actions
export async function getAllCategories() {
  try {
    return await categoriesService.getAllCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    return await categoriesService.getCategoryBySlug(slug)
  } catch (error) {
    console.error('Error fetching category:', error)
    throw error
  }
}

export async function createCategory(data: any) {
  try {
    const categoryData = CategoryInputSchema.parse(data)
    const result = await categoriesService.createCategory(categoryData)
    
    // Revalidate cache
    revalidateTag('categories')
    
    return result
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

// Comment Actions
export async function getCommentsByArticleId(articleId: string, status: 'approved' | 'pending' | 'rejected' = 'approved') {
  try {
    return await commentsService.getCommentsByArticleId(articleId, status)
  } catch (error) {
    console.error('Error fetching comments:', error)
    throw error
  }
}

export async function createComment(data: any) {
  try {
    const commentData = CommentInputSchema.parse(data)
    const result = await commentsService.createComment(commentData)
    
    // Revalidate cache
    revalidateTag('comments')
    revalidateTag(`article:${commentData.article_id}`)
    
    return result
  } catch (error) {
    console.error('Error creating comment:', error)
    throw error
  }
}

// Prefetch helpers for SSR/SSG
export async function prefetchArticleData(slug: string) {
  try {
    const [article, tags, categories] = await Promise.all([
      getArticleBySlug(slug),
      getAllTags(),
      getAllCategories(),
    ])
    
    return {
      article,
      tags,
      categories,
    }
  } catch (error) {
    console.error('Error prefetching article data:', error)
    throw error
  }
}

export async function prefetchArticlesList(query: any = {}) {
  try {
    const [articlesResult, tags, categories] = await Promise.all([
      getArticles({
        page: 1,
        limit: 10,
        status: 'published',
        ...query,
      }),
      getAllTags(),
      getAllCategories(),
    ])
    
    return {
      articles: articlesResult,
      tags,
      categories,
    }
  } catch (error) {
    console.error('Error prefetching articles list:', error)
    throw error
  }
}
