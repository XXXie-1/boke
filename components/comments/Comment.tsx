'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { MarkdownPreview } from '@/components/ui/MarkdownPreview'
import { CommentForm } from './CommentForm'
import { CommentWithUI, CommentFormData } from '@/types/comments'
import { formatCommentTimestamp, isOptimisticComment } from '@/lib/comment-utils'

interface CommentProps {
  comment: CommentWithUI
  onReply?: (parentId: string, data: CommentFormData) => Promise<void>
  onToggleCollapse?: (commentId: string) => void
  level?: number
  maxNestingLevel?: number
}

const Comment = ({
  comment,
  onReply,
  onToggleCollapse,
  level = 0,
  maxNestingLevel = 3
}: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(comment.isCollapsed || false)

  const handleReply = async (data: CommentFormData) => {
    if (onReply) {
      await onReply(comment.id, data)
      setIsReplying(false)
    }
  }

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    if (onToggleCollapse) {
      onToggleCollapse(comment.id)
    }
  }

  const hasReplies = comment.replies && comment.replies.length > 0
  const canReply = onReply && level < maxNestingLevel
  const isOptimistic = isOptimisticComment(comment.id)

  // Calculate indentation based on nesting level
  const indentClass = level > 0 ? `ml-${Math.min(level * 6, 12)}` : ''

  return (
    <div 
      className={`${indentClass} ${level > 0 ? 'border-l-2 border-muted pl-4' : ''}`}
      role="article"
      aria-label={`Comment by ${comment.nickname}`}
    >
      <div className="space-y-3">
        {/* Comment header */}
        <div className="flex items-start gap-3">
          <Avatar
            nickname={comment.nickname}
            size={40}
            className="flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground">
                {comment.nickname}
              </span>
              
              {isOptimistic && (
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  Posting...
                </span>
              )}
              
              <span className="text-sm text-muted-foreground">
                {formatCommentTimestamp(comment.created_at)}
              </span>
            </div>
          </div>

          {/* Collapse button for comments with replies */}
          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCollapse}
              className="text-xs"
              aria-expanded={!isCollapsed}
              aria-controls={`replies-${comment.id}`}
            >
              {isCollapsed ? (
                <span className="flex items-center gap-1">
                  <span>▶</span> Show {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span>▼</span> Hide replies
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Comment content */}
        <div className="pl-13">
          {isOptimistic ? (
            <div className="text-muted-foreground italic">
              {comment.content}
            </div>
          ) : (
            <MarkdownPreview 
              content={comment.content}
              className="text-sm leading-relaxed"
            />
          )}
        </div>

        {/* Comment actions */}
        {!isOptimistic && canReply && (
          <div className="pl-13">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs"
            >
              {isReplying ? 'Cancel Reply' : 'Reply'}
            </Button>
          </div>
        )}

        {/* Reply form */}
        {isReplying && (
          <div className="pl-13 mt-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <CommentForm
                articleId="" // Will be provided by parent
                parentId={comment.id}
                onSubmit={handleReply}
                onCancel={() => setIsReplying(false)}
                placeholder={`Replying to ${comment.nickname}...`}
                submitLabel="Post Reply"
                isReply={true}
              />
            </div>
          </div>
        )}

        {/* Replies */}
        {hasReplies && !isCollapsed && (
          <div 
            id={`replies-${comment.id}`}
            className="space-y-4 mt-4"
            role="list"
            aria-label={`Replies to ${comment.nickname}`}
          >
            {comment.replies?.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onToggleCollapse={onToggleCollapse}
                level={level + 1}
                maxNestingLevel={maxNestingLevel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { Comment }
