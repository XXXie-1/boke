import * as React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Container } from '@/components/ui/container'

interface LoadingLayoutProps {
  children?: React.ReactNode
  className?: string
}

function LoadingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    </header>
  )
}

function LoadingContent() {
  return (
    <main className="flex-1">
      <Container className="py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  )
}

function LoadingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={
                i < 2 ? 'col-span-2 lg:col-span-2' : 'col-span-2 lg:col-span-1'
              }
            >
              <Skeleton className="h-5 w-20 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-24" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t">
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </footer>
  )
}

export function LoadingLayout({ children, className }: LoadingLayoutProps) {
  if (children) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <LoadingHeader />
      <LoadingContent />
      <LoadingFooter />
    </div>
  )
}

export { LoadingHeader, LoadingContent, LoadingFooter }
