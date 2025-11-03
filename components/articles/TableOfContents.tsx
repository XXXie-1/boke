'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  level: number
  text: string
  node: any
}

interface TableOfContentsProps {
  headings: Heading[]
  activeSection: string
  setActiveSection: (section: string) => void
}

export function TableOfContents({ headings, activeSection, setActiveSection }: TableOfContentsProps) {
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100
      
      // Find the heading that's currently in view
      const currentHeading = headings.find((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          const elementBottom = elementTop + rect.height
          
          return scrollPosition >= elementTop && scrollPosition < elementBottom
        }
        return false
      })

      if (currentHeading) {
        setActiveSection(currentHeading.id)
      }
    }

    // Throttle scroll event
    let scrollTimeout: NodeJS.Timeout
    const throttledHandleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      scrollTimeout = setTimeout(handleScroll, 100)
    }

    window.addEventListener('scroll', throttledHandleScroll)
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [headings, setActiveSection])

  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId)
    if (element) {
      const offset = 80 // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">
        Contents
      </h4>
      <ul className="space-y-1">
        {headings.map((heading) => {
          const isActive = activeSection === heading.id
          const paddingLeft = (heading.level - 1) * 16

          return (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  'block w-full text-left text-sm transition-colors hover:text-foreground py-1',
                  isActive
                    ? 'text-primary font-medium border-l-2 border-primary pl-3'
                    : 'text-muted-foreground hover:text-foreground',
                  !isActive && 'pl-4'
                )}
                style={{
                  paddingLeft: isActive ? '12px' : `${paddingLeft + 16}px`
                }}
              >
                {heading.text}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}