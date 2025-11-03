'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CommentForm } from './CommentForm'
import { Comment } from './Comment'
import { CommentWithUI, CommentFormData, CommentsResponse } from '@/types/comments'
import { generateOptimisticId, isOptimisticComment } from '@/lib/comment-utils'

interface CommentsSectionProps {
  articleId: string
  initialComments?: CommentWithUI[]
  maxNestingLevel?: number
}

const CommentsSection = ({ 
  articleId, 
  initialComments = [],
  maxNestingLevel = 3 
}: CommentsSectionProps) => {
  const [comments, setComments] = useState<CommentWithUI[]>(initialComments)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set())

  // Fetch comments from API
  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/comments?article_id=${articleId}&status=approved&limit=50`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      
      const data: CommentsResponse = await response.json()
      setComments(data.data.map(comment => ({
        ...comment,
        isCollapsed: collapsedComments.has(comment.id)
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [articleId, collapsedComments])

  // Submit new comment
  const submitComment = async (data: CommentFormData) => {
    const optimisticComment: CommentWithUI = {
      id: generateOptimisticId(),
      nickname: data.nickname,
      content: data.content,
      parent_id: data.parent_id || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isOptimistic: true,
      isSubmitting: true,
      replies: []
    }

    // Add optimistic comment to state
    if (data.parent_id) {
      // It's a reply
      setComments(prev => prev.map(comment => {
        if (comment.id === data.parent_id) {
          return {
            ...comment,
            replies: [...(comment.replies || []), optimisticComment]
          }
        }
        return comment
      }))
    } else {
      // It's a top-level comment
      setComments(prev => [optimisticComment, ...prev])
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          article_id: articleId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit comment')
      }

      const result = await response.json()
      
      // Replace optimistic comment with real one after delay
      setTimeout(() => {
        setComments(prev => {
          const removeOptimistic = (comments: CommentWithUI[]): CommentWithUI[] => {
            return comments.map(comment => {
              if (comment.id === optimisticComment.id) {
                return {
                  ...result.data,
                  isOptimistic: false,
                  isSubmitting: false,
                  replies: []
                }
              }
              if (comment.replies) {
                return {
                  ...comment,
                  replies: removeOptimistic(comment.replies)
                }
              }
              return comment
            }).filter(comment => !isOptimisticComment(comment.id))
          }
          
          return removeOptimistic(prev)
        })
      }, 2000) // Keep optimistic comment visible for 2 seconds

    } catch (err) {
      // Remove optimistic comment on error
      setComments(prev => {
        const removeOptimistic = (comments: CommentWithUI[]): CommentWithUI[] => {
          return comments.filter(comment => comment.id !== optimisticComment.id).map(comment => {
            if (comment.replies) {
              return {
                ...comment,
                replies: removeOptimistic(comment.replies)
              }
            }
            return comment
          })
        }
        return removeOptimistic(prev)
      })
      
      throw err
    }
  }

  // Handle reply submission
  const handleReply = async (parentId: string, data: CommentFormData) => {
    await submitComment({ ...data, parent_id: parentId })
  }

  // Toggle comment collapse state
  const handleToggleCollapse = (commentId: string) => {
    setCollapsedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, isCollapsed: !comment.isCollapsed }
      }
      return comment
    }))
  }

  // Load comments on mount
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments()
    }
  }, [fetchComments, initialComments.length])

  const commentCount = comments.filter(c => !isOptimisticComment(c.id)).length

  return (
    <div className="space-y-6">
      {/* Comments header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Comments {commentCount > 0 && `(${commentCount})`}
            </span>
            
            {!showCommentForm && (
              <Button
                onClick={() => setShowCommentForm(true)}
                variant="outline"
                size="sm"
              >
                Add Comment
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        {/* Comment form */}
        {showCommentForm && (
          <CardContent className="border-b">
            <CommentForm
              articleId={articleId}
              onSubmit={submitComment}
              onCancel={() => setShowCommentForm(false)}
            />
          </CardContent>
        )}
      </Card>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-muted-foreground">Loading comments...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchComments} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments list */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {comments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-2">No comments yet</p>
                  <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6" role="list" aria-label="Comments">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <Comment
                      comment={comment}
                      onReply={handleReply}
                      onToggleCollapse={handleToggleCollapse}
                      maxNestingLevel={maxNestingLevel}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comment guidelines */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Comment Guidelines:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Be respectful and constructive</li>
              <li>Stay on topic</li>
              <li>No spam or self-promotion</li>
              <li>Comments are moderated before appearing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { CommentsSection }
