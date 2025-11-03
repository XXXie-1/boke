'use client'

import * as React from 'react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Prose } from '@/components/ui/prose'
import { Header, Footer } from '@/components'

export default function ComponentsPage() {
  return (
    <div className="flex-1">
      <Container className="py-12">
        <div className="space-y-12">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Component Library
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All available components in our design system
            </p>
          </div>

          {/* Layout Components */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Layout Components</h2>

            <Card>
              <CardHeader>
                <CardTitle>Header</CardTitle>
                <CardDescription>
                  Responsive header with logo slot, search trigger, and theme
                  toggle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Header />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
                <CardDescription>
                  Footer with configurable links and attribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Footer />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Container</CardTitle>
                <CardDescription>
                  Responsive container with configurable max-width
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <Container size="sm">
                      <div className="bg-primary/10 p-4 rounded text-center">
                        Small Container (max-w-3xl)
                      </div>
                    </Container>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <Container size="lg">
                      <div className="bg-primary/10 p-4 rounded text-center">
                        Large Container (max-w-7xl)
                      </div>
                    </Container>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* UI Components */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">UI Components</h2>

            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>
                  Button component with multiple variants and sizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Variants</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button>Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Sizes</h4>
                    <div className="flex items-center gap-2">
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                      <Button size="icon">🔥</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>
                  Badge component for status indicators and labels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cards</CardTitle>
                <CardDescription>
                  Card component with header, content, and footer sections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Title</CardTitle>
                      <CardDescription>
                        Card description goes here
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>This is the card content area.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Another Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Card without description.</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skeleton</CardTitle>
                <CardDescription>
                  Loading skeleton component for better perceived performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-20 w-full rounded" />
                    <Skeleton className="h-20 w-full rounded" />
                    <Skeleton className="h-20 w-full rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prose</CardTitle>
                <CardDescription>
                  Typography component for content with proper styling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-6 rounded-lg">
                  <Prose>
                    <h3>Prose Component</h3>
                    <p>
                      This component provides consistent typography for content
                      areas. It includes proper styling for headings,
                      paragraphs, lists, code blocks, and other text elements.
                    </p>
                    <ul>
                      <li>Bullet point one</li>
                      <li>Bullet point two</li>
                      <li>Bullet point three</li>
                    </ul>
                  </Prose>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Features */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">Features</h2>

            <Card>
              <CardHeader>
                <CardTitle>Dark Mode Support</CardTitle>
                <CardDescription>
                  All components support dark/light theme switching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Use the theme toggle in the header to switch between light and
                  dark modes. The theme preference is automatically saved and
                  restored on subsequent visits.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>
                  WCAG AA compliant with proper keyboard navigation and screen
                  reader support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All interactive elements have proper focus management, ARIA
                  labels, and keyboard support. The design system respects user
                  preferences like reduced motion and high contrast modes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsive Design</CardTitle>
                <CardDescription>
                  Mobile-first approach with fluid typography and adaptive
                  layouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Components are designed to work seamlessly across all device
                  sizes. Typography scales fluidly, layouts adapt to available
                  space, and touch targets meet minimum size requirements.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </Container>
    </div>
  )
}
