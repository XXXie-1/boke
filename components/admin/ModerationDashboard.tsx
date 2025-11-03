'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { MarkdownPreview } from '@/components/ui/MarkdownPreview'
import { ModerationComment, ModerationAction } from '@/types/comments'
import { formatCommentTimestamp } from '@/lib/comment-utils'

interface ModerationDashboardProps {
  adminToken?: string
}

const ModerationDashboard = ({ adminToken }: ModerationDashboardProps) => {
  const [comments, setComments] = useState<ModerationComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set())

  // Fetch pending comments
  const fetchComments = async (page: number = 1) => {
    setLoading(true)
    setError(null)
    
    try {
      const url = new URL('/api/admin/comments', window.location.origin)
      url.searchParams.set('page', page.toString())
      url.searchParams.set('limit', '20')
      
      if (adminToken) {
        url.searchParams.set('token', adminToken)
      }
      
      const response = await fetch(url.toString(), {
        headers: adminToken ? {
          'Authorization': `Bearer ${adminToken}`
        } : {}
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please check your admin credentials.')
        }
        throw new Error('Failed to fetch comments')
      }
      
      const data = await response.json()
      setComments(data.data)
      setTotalPages(data.pagination.totalPages)
      setCurrentPage(data.pagination.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Moderate comment
  const moderateComment = async (commentId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessing(prev => new Set(prev).add(commentId))
    
    try {
      const url = `/api/admin/comments/${commentId}`
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
        },
        body: JSON.stringify({
          status: action,
          moderation_reason: reason
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} comment`)
      }
      
      // Remove the moderated comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId))
      setSelectedComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
    }
  }

  // Delete comment
  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return
    }
    
    setProcessing(prev => new Set(prev).add(commentId))
    
    try {
      const url = `/api/admin/comments/${commentId}`
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: adminToken ? {
          'Authorization': `Bearer ${adminToken}`
        } : {}
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }
      
      // Remove the deleted comment from the list
      setComments(prev => prev.filter(comment => comment.id !== commentId))
      setSelectedComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
    }
  }

  // Bulk actions
  const bulkApprove = async () => {
    for (const commentId of Array.from(selectedComments)) {
      await moderateComment(commentId, 'approve')
    }
  }

  const bulkReject = async () => {
    const reason = prompt('Enter rejection reason (optional):')
    for (const commentId of Array.from(selectedComments)) {
      await moderateComment(commentId, 'reject', reason || undefined)
    }
  }

  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  // Load comments on mount
  useEffect(() => {
    fetchComments()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Comment Moderation</span>
            <div className="flex gap-2">
              <Button onClick={() => fetchComments(currentPage)} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="py-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk actions */}
      {selectedComments.size > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedComments.size} comment{selectedComments.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button onClick={bulkApprove} size="sm" variant="outline">
                  Approve Selected
                </Button>
                <Button onClick={bulkReject} size="sm" variant="outline">
                  Reject Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments list */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No pending comments to review</p>
            </div>
          ) : (
            <div className="divide-y">
              {comments.map((comment) => (
                <div key={comment.id} className="p-6 space-y-4">
                  {/* Comment header */}
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedComments.has(comment.id)}
                      onChange={() => toggleCommentSelection(comment.id)}
                      className="mt-1 rounded border-gray-300"
                    />
                    
                    <Avatar nickname={comment.nickname} size={40} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-medium">{comment.nickname}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCommentTimestamp(comment.created_at)}
                        </span>
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                      </div>
                      
                      {/* Article info */}
                      <div className="text-sm text-muted-foreground mb-3">
                        Article: <a href={`/articles/${comment.article.slug}`} className="text-blue-600 hover:underline">
                          {comment.article.title}
                        </a>
                      </div>
                      
                      {/* Comment content */}
                      <div className="bg-muted/30 rounded-md p-4 mb-4">
                        <MarkdownPreview content={comment.content} />
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => moderateComment(comment.id, 'approve')}
                          disabled={processing.has(comment.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processing.has(comment.id) ? 'Processing...' : 'Approve'}
                        </Button>
                        
                        <Button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason (optional):')
                            if (reason !== null) {
                              moderateComment(comment.id, 'reject', reason)
                            }
                          }}
                          disabled={processing.has(comment.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                        
                        <Button
                          onClick={() => deleteComment(comment.id)}
                          disabled={processing.has(comment.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => fetchComments(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => fetchComments(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { ModerationDashboard }
