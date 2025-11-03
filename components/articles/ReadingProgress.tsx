'use client'

import { useEffect, useState } from 'react'

interface ReadingProgressProps {
  contentRef: React.RefObject<HTMLElement>
}

export function ReadingProgress({ contentRef }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const targetScrollTop = contentRef.current.offsetTop

      // Calculate the height of the content area
      const contentHeight = contentRef.current.offsetHeight
      const viewportHeight = windowHeight

      // Calculate progress based on content area
      let contentProgress = 0
      
      if (scrollTop >= targetScrollTop) {
        const scrolledInContent = scrollTop - targetScrollTop
        const totalScrollable = contentHeight - viewportHeight
        
        if (totalScrollable > 0) {
          contentProgress = Math.min((scrolledInContent / totalScrollable) * 100, 100)
        } else {
          contentProgress = 100
        }
      }

      setProgress(contentProgress)
    }

    // Throttle scroll event for performance
    let scrollTimeout: NodeJS.Timeout
    const throttledHandleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      scrollTimeout = setTimeout(handleScroll, 16) // ~60fps
    }

    window.addEventListener('scroll', throttledHandleScroll)
    handleScroll() // Initial calculation

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [contentRef])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border">
      <div 
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}