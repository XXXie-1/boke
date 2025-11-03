import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export function ArticlesListSkeleton() {
  return (
    <div className="space-y-8">
      {/* Featured Article Skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <Card className="overflow-hidden">
          <div className="h-64 md:h-96 bg-muted animate-pulse" />
          <CardHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                <div className="h-4 w-8 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regular Articles Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardHeader>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="h-6 w-12 bg-muted rounded-full animate-pulse" />
                    <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-10 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-6 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}