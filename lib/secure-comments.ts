import { createSupabaseServerClient } from './supabase'
import {
  CommentInput,
  CommentUpdateInput,
  CommentModerationInput,
  CommentQueryInput,
} from './schemas'
import {
  sanitizeHTML,
  containsProfanity,
  hashIPAddress,
  rateLimiter,
} from './security'
import { headers } from 'next/headers'

const getSupabaseClient = () => createSupabaseServerClient()

// Get client IP address
function getClientIP(): string {
  const headersList = headers()

  // Try various headers that might contain the IP
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ]

  for (const header of ipHeaders) {
    const ip = headersList.get(header)
    if (ip) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return ip.split(',')[0].trim()
    }
  }

  // Fallback to a default
  return '127.0.0.1'
}

export const secureCommentsService = {
  // Get comments with threading and pagination
  async getComments(query: CommentQueryInput) {
    const supabase = getSupabaseClient()
    const { article_id, status, page, limit } = query

    const offset = (page - 1) * limit

    // Get top-level comments (no parent_id)
    const { data: topLevelComments, error: topLevelError } = await supabase
      .from('comments')
      .select(
        `
        id,
        nickname,
        content,
        parent_id,
        status,
        created_at,
        updated_at
      `
      )
      .eq('article_id', article_id)
      .eq('status', status)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (topLevelError) {
      throw new Error(`Failed to fetch comments: ${topLevelError.message}`)
    }

    // Get replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      (topLevelComments || []).map(async (comment) => {
        const { data: replies, error: repliesError } = await supabase
          .from('comments')
          .select(
            `
            id,
            nickname,
            content,
            parent_id,
            status,
            created_at,
            updated_at
          `
          )
          .eq('article_id', article_id)
          .eq('status', status)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true })

        if (repliesError) {
          console.error('Error fetching replies:', repliesError)
          return { ...comment, replies: [] }
        }

        return { ...comment, replies: replies || [] }
      })
    )

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', article_id)
      .eq('status', status)
      .is('parent_id', null)

    if (countError) {
      console.error('Error getting comment count:', countError)
    }

    return {
      data: commentsWithReplies,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  },

  // Create a new comment with security measures
  async createComment(input: CommentInput) {
    const supabase = getSupabaseClient()
    const clientIP = getClientIP()

    // Check rate limiting
    const rateLimitKey = `comment:${input.article_id}:${hashIPAddress(clientIP)}`
    const rateLimitResult = await rateLimiter.isRateLimited(
      rateLimitKey,
      3,
      300
    ) // 3 comments per 5 minutes per IP per article

    if (rateLimitResult.limited) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)} minutes.`
      )
    }

    // Sanitize content
    const sanitizedContent = sanitizeHTML(input.content)

    // Check for profanity
    if (containsProfanity(input.nickname) || containsProfanity(input.content)) {
      throw new Error('Comment contains inappropriate language')
    }

    // Verify article exists
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, status')
      .eq('id', input.article_id)
      .single()

    if (articleError || !article) {
      throw new Error('Article not found')
    }

    if (article.status !== 'published') {
      throw new Error('Cannot comment on unpublished articles')
    }

    // If parent_id is provided, verify it exists and belongs to the same article
    if (input.parent_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('comments')
        .select('id, article_id, status')
        .eq('id', input.parent_id)
        .single()

      if (parentError || !parentComment) {
        throw new Error('Parent comment not found')
      }

      if (parentComment.article_id !== input.article_id) {
        throw new Error('Parent comment does not belong to this article')
      }

      if (parentComment.status !== 'approved') {
        throw new Error('Cannot reply to unapproved comments')
      }
    }

    // Prepare comment data
    const commentData = {
      article_id: input.article_id,
      nickname: sanitizeHTML(input.nickname),
      content: sanitizedContent,
      ip_hash: hashIPAddress(clientIP),
      parent_id: input.parent_id || null,
      status: 'pending', // Comments start as pending
    }

    // Use RPC function for secure insertion
    const { data, error } = await supabase.rpc('create_comment_secure', {
      p_article_id: commentData.article_id,
      p_nickname: commentData.nickname,
      p_content: commentData.content,
      p_ip_hash: commentData.ip_hash,
      p_parent_id: commentData.parent_id,
    })

    if (error) {
      // Fallback to direct insert if RPC doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('comments')
        .insert(commentData)
        .select(
          `
          id,
          nickname,
          content,
          parent_id,
          status,
          created_at,
          updated_at
        `
        )
        .single()

      if (fallbackError) {
        throw new Error(`Failed to create comment: ${fallbackError.message}`)
      }

      return fallbackData
    }

    return data
  },

  // Moderate comments (admin only)
  async moderateComment(commentId: string, moderation: CommentModerationInput) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('comments')
      .update({
        status: moderation.status,
        moderation_reason: moderation.moderation_reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select(
        `
        id,
        nickname,
        content,
        parent_id,
        status,
        moderation_reason,
        created_at,
        updated_at
      `
      )
      .single()

    if (error) {
      throw new Error(`Failed to moderate comment: ${error.message}`)
    }

    return data
  },

  // Delete comment (admin only)
  async deleteComment(commentId: string) {
    const supabase = getSupabaseClient()

    // First check if comment has replies
    const { data: replies, error: repliesError } = await supabase
      .from('comments')
      .select('id')
      .eq('parent_id', commentId)

    if (repliesError) {
      throw new Error(`Failed to check for replies: ${repliesError.message}`)
    }

    if (replies && replies.length > 0) {
      throw new Error(
        'Cannot delete comment with replies. Delete replies first.'
      )
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      throw new Error(`Failed to delete comment: ${error.message}`)
    }

    return true
  },

  // Get comments for moderation (admin only)
  async getPendingComments(page: number = 1, limit: number = 50) {
    const supabase = getSupabaseClient()

    const offset = (page - 1) * limit

    const { data, error, count } = await supabase
      .from('comments')
      .select(
        `
        id,
        nickname,
        content,
        ip_hash,
        parent_id,
        status,
        moderation_reason,
        created_at,
        updated_at,
        article:articles(id, title, slug)
      `,
        { count: 'exact' }
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to fetch pending comments: ${error.message}`)
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  },
}
