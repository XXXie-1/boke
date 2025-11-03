import * as React from 'react'
import { cn } from '@/lib/utils'

interface FooterProps {
  links?: Array<{
    title: string
    items: Array<{
      label: string
      href: string
    }>
  }>
  attribution?: React.ReactNode
  className?: string
}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      links = [
        {
          title: 'Product',
          items: [
            { label: 'Features', href: '#' },
            { label: 'Pricing', href: '#' },
            { label: 'Documentation', href: '#' },
          ],
        },
        {
          title: 'Company',
          items: [
            { label: 'About', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Careers', href: '#' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'Help Center', href: '#' },
            { label: 'Community', href: '#' },
            { label: 'Guides', href: '#' },
          ],
        },
        {
          title: 'Legal',
          items: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
          ],
        },
      ],
      attribution = (
        <div className="text-center text-sm text-muted-foreground">
          © 2024 Your Company. Built with Next.js and Tailwind CSS.
        </div>
      ),
      className,
      ...props
    },
    ref
  ) => {
    return (
      <footer
        ref={ref}
        className={cn('border-t bg-background', className)}
        {...props}
      >
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            {links.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className={
                  sectionIndex < 2
                    ? 'col-span-2 lg:col-span-2'
                    : 'col-span-2 lg:col-span-1'
                }
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t">{attribution}</div>
        </div>
      </footer>
    )
  }
)

Footer.displayName = 'Footer'

export { Footer }
