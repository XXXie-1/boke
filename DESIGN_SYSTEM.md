# Design System

A minimalist, Claude-inspired design system built with Next.js 14, TypeScript, and Tailwind CSS. Features dark mode support, accessible components, and fluid typography.

## Features

- 🎨 **Minimalist Design** - Claude-inspired aesthetic with soft-muted color palette
- 🌓 **Dark Mode** - Seamless theme switching with system preference detection
- ♿ **Accessible** - WCAG AA compliant components with proper focus management
- 📱 **Responsive** - Mobile-first design with fluid typography
- ⚡ **Performance** - Optimized for fast loading and smooth interactions
- 🎯 **TypeScript** - Full type safety and developer experience

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the design system.

### Build

```bash
npm run build
```

## Components

### Layout Components

#### Header

Responsive header with logo slot, search trigger, and theme toggle.

```tsx
import { Header } from '@/components'

;<Header logo={<YourLogo />} onSearchClick={() => console.log('search')} />
```

#### Footer

Footer with configurable links and attribution.

```tsx
import { Footer } from '@/components'

;<Footer
  links={[
    {
      title: 'Product',
      items: [
        { label: 'Features', href: '#' },
        { label: 'Pricing', href: '#' },
      ],
    },
  ]}
/>
```

#### Container

Responsive container with configurable max-width.

```tsx
import { Container } from '@/components/ui/container'

;<Container size="lg">
  <div>Your content</div>
</Container>
```

### UI Components

#### Button

Button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui/Button'

;<Button variant="default" size="md">
  Click me
</Button>
```

**Variants:** `default`, `secondary`, `outline`, `ghost`, `destructive`
**Sizes:** `sm`, `md`, `lg`, `icon`

#### Card

Card component with header, content, and footer sections.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

;<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

#### Badge

Badge component for status indicators and labels.

```tsx
import { Badge } from '@/components/ui/badge'

;<Badge variant="default">New</Badge>
```

**Variants:** `default`, `secondary`, `outline`, `destructive`

#### Skeleton

Loading skeleton component for better perceived performance.

```tsx
import { Skeleton } from '@/components/ui/skeleton'

;<Skeleton className="h-4 w-32" />
```

#### Prose

Typography component for content with proper styling.

```tsx
import { Prose } from '@/components/ui/prose'

;<Prose>
  <h1>Content Title</h1>
  <p>Your content here</p>
</Prose>
```

### Theme System

#### Theme Provider

The theme provider is automatically configured in the root layout.

```tsx
import { ThemeProvider } from '@/components/theme-provider'

;<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

#### Theme Toggle

Accessible theme toggle component.

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

;<ThemeToggle />
```

## Design Tokens

### Colors

The design system uses a soft-muted color palette with CSS custom properties:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 262.1 83.3% 57.8%;
  --muted: 210 40% 96%;
  --accent: 142.1 76.2% 36.3%;
  --destructive: 0 84.2% 60.2%;
}
```

### Typography

Fluid typography with Inter font:

- **Font Family:** Inter (system-ui fallback)
- **Scale:** xs (0.75rem) to 9xl (8rem)
- **Features:** Text balance, pretty text wrapping, antialiasing

### Spacing

Consistent spacing scale with additional utilities:

- **Base:** 0.25rem to 32rem
- **Extended:** 0.5, 1.5, 2.5, 3.5 rem units
- **Custom:** 18 (4.5rem), 88 (22rem), 128 (32rem)

### Motion

Subtle animations with respect for user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are disabled for users who prefer reduced motion */
}
```

## Accessibility

- **WCAG AA Compliance** - All components meet contrast requirements
- **Keyboard Navigation** - Full keyboard support for interactive elements
- **Screen Reader Support** - Proper ARIA labels and semantic markup
- **Focus Management** - Visible focus indicators and logical tab order
- **Reduced Motion** - Respects user motion preferences

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.
