import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib'
import { generateAvatarSVG, getInitials } from '@/lib/avatars'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  nickname: string
  size?: number
  src?: string
  alt?: string
  fallback?: boolean
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, nickname, size = 40, src, alt, fallback = false, ...props }, ref) => {
    const avatarSize = `${size}px`
    const initials = getInitials(nickname)
    
    // If external image is provided and fallback is not forced, use it
    if (src && !fallback) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-200',
            className
          )}
          style={{ width: avatarSize, height: avatarSize }}
          {...props}
        >
          <img
            src={src}
            alt={alt || nickname}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to generated avatar on image load error
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = generateAvatarSVG(nickname, size)
              }
            }}
          />
        </div>
      )
    }
    
    // Use generated SVG avatar
    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0',
          className
        )}
        style={{ width: avatarSize, height: avatarSize }}
        {...props}
        dangerouslySetInnerHTML={{ __html: generateAvatarSVG(nickname, size) }}
      />
    )
  }
)

Avatar.displayName = 'Avatar'

export { Avatar }
