import { cn } from '@/lib'
import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  showCharacterCount?: boolean
  maxLength?: number
  currentLength?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    error, 
    label, 
    showCharacterCount = false, 
    maxLength, 
    currentLength = 0,
    id,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`
    const hasError = !!error
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            className={cn(
              'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              hasError && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            maxLength={maxLength}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${textareaId}-error` : undefined}
            {...props}
          />
          {showCharacterCount && maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              <span className={currentLength > maxLength * 0.9 ? 'text-orange-500' : ''}>
                {currentLength}/{maxLength}
              </span>
            </div>
          )}
        </div>
        {error && (
          <p 
            id={`${textareaId}-error`}
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
