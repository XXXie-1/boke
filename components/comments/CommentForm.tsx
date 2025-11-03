'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { MarkdownPreview } from '@/components/ui/MarkdownPreview'
import { CommentFormData, CommentFormState, CommentSubmissionState } from '@/types/comments'
import { validateNickname, validateCommentLength } from '@/lib/comment-utils'

interface CommentFormProps {
  articleId: string
  parentId?: string | null
  onSubmit: (data: CommentFormData) => Promise<void>
  onCancel?: () => void
  placeholder?: string
  submitLabel?: string
  isReply?: boolean
}

const CommentForm = ({
  articleId,
  parentId = null,
  onSubmit,
  onCancel,
  placeholder = 'Share your thoughts...',
  submitLabel = 'Post Comment',
  isReply = false
}: CommentFormProps) => {
  const [formState, setFormState] = useState<CommentFormState>({
    nickname: '',
    content: '',
    isSubmitting: false,
    errors: {},
    characterCount: {
      current: 0,
      max: 1000
    }
  })
  
  const [submissionState, setSubmissionState] = useState<CommentSubmissionState>('idle')
  const [showPreview, setShowPreview] = useState(false)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Load saved nickname from localStorage
  useEffect(() => {
    const savedNickname = localStorage.getItem('comment-nickname')
    if (savedNickname) {
      setFormState(prev => ({ ...prev, nickname: savedNickname }))
    }
  }, [])

  const handleNicknameChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      nickname: value,
      errors: { ...prev.errors, nickname: undefined }
    }))
  }

  const handleContentChange = (value: string) => {
    const validation = validateCommentLength(value)
    setFormState(prev => ({
      ...prev,
      content: value,
      characterCount: {
        ...prev.characterCount,
        current: value.length
      },
      errors: {
        ...prev.errors,
        content: validation.isValid ? undefined : validation.message
      }
    }))
  }

  const validateForm = (): boolean => {
    const nicknameValidation = validateNickname(formState.nickname)
    const contentValidation = validateCommentLength(formState.content)

    const errors: CommentFormState['errors'] = {}
    
    if (!nicknameValidation.isValid) {
      errors.nickname = nicknameValidation.message
    }
    
    if (!contentValidation.isValid) {
      errors.content = contentValidation.message
    }

    setFormState(prev => ({ ...prev, errors }))

    return nicknameValidation.isValid && contentValidation.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }))
    setSubmissionState('submitting')

    try {
      // Save nickname to localStorage for future use
      localStorage.setItem('comment-nickname', formState.nickname.trim())

      const commentData: CommentFormData = {
        nickname: formState.nickname.trim(),
        content: formState.content.trim(),
        parent_id: parentId
      }

      await onSubmit(commentData)
      
      setSubmissionState('success')
      
      // Reset form after successful submission
      setFormState(prev => ({
        ...prev,
        content: '',
        characterCount: { ...prev.characterCount, current: 0 },
        errors: {}
      }))
      
      // Reset submission state after delay
      setTimeout(() => {
        setSubmissionState('idle')
      }, 2000)

    } catch (error) {
      setSubmissionState('error')
      setFormState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          general: error instanceof Error ? error.message : 'Failed to post comment'
        }
      }))
      
      // Reset submission state after delay
      setTimeout(() => {
        setSubmissionState('idle')
      }, 5000)
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const isFormValid = formState.nickname.trim().length > 0 && 
                     formState.content.trim().length > 0 && 
                     formState.characterCount.current <= formState.characterCount.max

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nickname field - only show for top-level comments */}
      {!isReply && (
        <Input
          label="Nickname"
          value={formState.nickname}
          onChange={(e) => handleNicknameChange(e.target.value)}
          placeholder="Enter your nickname"
          error={formState.errors.nickname}
          disabled={formState.isSubmitting}
          maxLength={20}
          aria-required="true"
        />
      )}

      {/* Content textarea */}
      <Textarea
        label={isReply ? 'Reply' : 'Comment'}
        value={formState.content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder={placeholder}
        error={formState.errors.content}
        disabled={formState.isSubmitting}
        showCharacterCount={true}
        maxLength={1000}
        currentLength={formState.characterCount.current}
        onKeyDown={handleKeyDown}
        ref={contentTextareaRef}
        aria-required="true"
        rows={4}
      />

      {/* Markdown preview toggle */}
      {formState.content && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          {showPreview && (
            <div className="border rounded-md p-4 bg-muted/30">
              <div className="text-sm text-muted-foreground mb-2">Preview:</div>
              <MarkdownPreview content={formState.content} />
            </div>
          )}
        </div>
      )}

      {/* General error message */}
      {formState.errors.general && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{formState.errors.general}</p>
        </div>
      )}

      {/* Success message */}
      {submissionState === 'success' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            {isReply ? 'Reply posted successfully! It will be visible after approval.' : 'Comment posted successfully! It will be visible after approval.'}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!isFormValid || formState.isSubmitting}
          className="min-w-[120px]"
        >
          {formState.isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {isReply ? 'Posting...' : 'Submitting...'}
            </span>
          ) : (
            submitLabel
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={formState.isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Form help text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Markdown formatting is supported</p>
        <p>• Press Ctrl/Cmd + Enter to submit</p>
        <p>• Comments are moderated and will appear after approval</p>
      </div>
    </form>
  )
}

export { CommentForm }
