'use client'

import * as React from 'react'
import { Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

interface HeaderProps {
  logo?: React.ReactNode
  onSearchClick?: () => void
  className?: string
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ logo, onSearchClick, className, ...props }, ref) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          className
        )}
        {...props}
      >
        <div className="container flex h-16 items-center">
          {/* Logo Slot */}
          <div className="mr-4 flex">
            {logo || (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    A
                  </span>
                </div>
                <span className="font-semibold text-lg">App</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
            <a
              href="#"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Home
            </a>
            <a
              href="#"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              About
            </a>
            <a
              href="#"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Contact
            </a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 ml-auto">
            {/* Search Trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearchClick}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="border-t md:hidden">
            <nav className="container py-4 space-y-2">
              <a
                href="#"
                className="block py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#"
                className="block py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#"
                className="block py-2 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
            </nav>
          </div>
        )}
      </header>
    )
  }
)

Header.displayName = 'Header'

export { Header }
