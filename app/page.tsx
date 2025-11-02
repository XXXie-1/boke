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
import { Moon, Sun, Zap, Shield, Sparkles } from 'lucide-react'

export default function Home() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          <Container className="py-12">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background to-muted/20">
          <Container>
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                Design System v1.0
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                Minimalist Design System
              </h1>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                A Claude-inspired design system built with Next.js, TypeScript,
                and Tailwind CSS. Featuring dark mode support, accessible
                components, and fluid typography.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Get Started
                </Button>
                <Button variant="outline" size="lg">
                  View Components
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <Container>
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Key Features
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built with accessibility and performance in mind
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Moon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Dark Mode</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Seamless dark/light theme switching with system preference
                    detection and persistence.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Accessible</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    WCAG AA compliant components with proper focus management
                    and keyboard navigation.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Responsive</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Mobile-first design with fluid typography and adaptive
                    layouts for all screen sizes.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* Typography Section */}
        <section className="py-20 bg-muted/20">
          <Container>
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Typography System
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Fluid typography with optimal readability
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Prose>
                <h1>Heading 1</h1>
                <p>
                  This is a paragraph of text. The design system uses Inter font
                  for optimal readability across all devices. Text is balanced
                  and pretty for better reading experience.
                </p>

                <h2>Heading 2</h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>

                <h3>Heading 3</h3>
                <p>
                  <code>Inline code</code> elements are styled for clarity.
                  Links are
                  <a href="#">underlined with hover effects</a> for better
                  accessibility.
                </p>

                <blockquote>
                  "Design is not just what it looks like and feels like. Design
                  is how it works."
                </blockquote>
              </Prose>
            </div>
          </Container>
        </section>

        {/* Components Showcase */}
        <section className="py-20">
          <Container>
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Component Library
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Reusable components built with accessibility in mind
              </p>
            </div>

            <div className="space-y-12 max-w-4xl mx-auto">
              {/* Buttons */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              {/* Badges */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>

              {/* Loading States */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Loading States</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>
      <Footer />
    </>
  )
}
