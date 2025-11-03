// Base comment type from API
export interface Comment {
  id: string
  nickname: string
  content: string
  parent_id: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  replies?: Comment[]
}

// Comment with UI-specific properties
export interface CommentWithUI extends Comment {
  isOptimistic?: boolean
  isSubmitting?: boolean
  isCollapsed?: boolean
  isReplying?: boolean
  level?: number // For nesting depth
}

// Form data for comment submission
export interface CommentFormData {
  nickname: string
  content: string
  parent_id?: string | null
}

// Comment form validation state
export interface CommentFormState {
  nickname: string
  content: string
  isSubmitting: boolean
  errors: {
    nickname?: string
    content?: string
    general?: string
  }
  characterCount: {
    current: number
    max: number
  }
}

// Comment submission states
export type CommentSubmissionState = 'idle' | 'submitting' | 'success' | 'error'

// Moderation comment data
export interface ModerationComment extends Comment {
  article: {
    id: string
    title: string
    slug: string
  }
  ip_hash?: string
}

// Moderation actions
export interface ModerationAction {
  type: 'approve' | 'reject' | 'delete'
  commentId: string
  reason?: string
}

// Comments API response
export interface CommentsResponse {
  data: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
