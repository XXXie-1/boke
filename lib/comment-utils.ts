// Format timestamp for comments
export function formatCommentTimestamp(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`
  }
  
  // For older comments, show the actual date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Sanitize and prepare content for display
export function prepareCommentContent(content: string): string {
  // Basic HTML sanitization - remove potentially dangerous tags
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: URLs
}

// Validate comment content length
export function validateCommentLength(content: string, maxLength: number = 1000): {
  isValid: boolean
  remaining: number
  message?: string
} {
  const length = content.length
  const remaining = maxLength - length
  
  if (length === 0) {
    return {
      isValid: false,
      remaining,
      message: 'Comment cannot be empty'
    }
  }
  
  if (length > maxLength) {
    return {
      isValid: false,
      remaining,
      message: `Comment must be less than ${maxLength} characters`
    }
  }
  
  return {
    isValid: true,
    remaining
  }
}

// Validate nickname
export function validateNickname(nickname: string): {
  isValid: boolean
  message?: string
} {
  const trimmed = nickname.trim()
  
  if (trimmed.length === 0) {
    return {
      isValid: false,
      message: 'Nickname is required'
    }
  }
  
  if (trimmed.length < 2) {
    return {
      isValid: false,
      message: 'Nickname must be at least 2 characters'
    }
  }
  
  if (trimmed.length > 20) {
    return {
      isValid: false,
      message: 'Nickname must be less than 20 characters'
    }
  }
  
  // Check for invalid characters
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return {
      isValid: false,
      message: 'Nickname can only contain letters, numbers, spaces, hyphens, and underscores'
    }
  }
  
  return {
    isValid: true
  }
}

// Generate a unique ID for optimistic updates
export function generateOptimisticId(): string {
  return `optimistic-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Check if a comment is an optimistic update
export function isOptimisticComment(commentId: string): boolean {
  return commentId.startsWith('optimistic-')
}
