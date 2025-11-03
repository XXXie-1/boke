import { Skeleton } from '@/components/ui/Skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-9 w-24" />
          </div>

          {/* Article Header Skeleton */}
          <header className="space-y-4">
            {/* Categories */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Title */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-5/6" />
            </div>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>

            {/* Tags */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
            </div>

            {/* Featured Image */}
            <Skeleton className="aspect-video w-full rounded-lg" />

            {/* Share Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-10" />
                <Skeleton className="h-8 w-10" />
                <Skeleton className="h-8 w-10" />
              </div>
            </div>
          </header>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents Skeleton - Desktop */}
            <aside className="lg:col-span-1 hidden lg:block">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Article Content Skeleton */}
            <div className="lg:col-span-3 space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              {/* Mobile TOC Skeleton */}
              <div className="lg:hidden">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Related Articles Skeleton */}
          <div className="mt-16 space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-12 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-10" />
                        <Skeleton className="h-4 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}