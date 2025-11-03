import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

const Prose = React.forwardRef<HTMLDivElement, ProseProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'prose-sm',
      md: 'prose-base',
      lg: 'prose-lg',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'prose prose-gray dark:prose-invert max-w-none',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)

Prose.displayName = 'Prose'

export { Prose }
