# SEO and Feeds Implementation

This document outlines the SEO and feed functionality implemented in the blog platform.

## Features Implemented

### 1. Metadata Generation
- **Open Graph tags** for social media sharing
- **Twitter Card** meta tags
- **Canonical URLs** for SEO
- **Structured Data** (JSON-LD) for articles and blog
- **View count** and **reading time** in meta tags
- **Robots meta tags** with noindex support

### 2. Dynamic Sitemap
- **Location**: `/sitemap.xml`
- Automatically includes all published articles
- Includes static pages (home, articles listing)
- Updates based on `published_at` and `updated_at` timestamps
- Proper XML format with priorities and change frequencies

### 3. RSS and Atom Feeds
- **RSS Feed**: `/rss.xml`
- **Atom Feed**: `/atom.xml`
- Both feeds include:
  - Latest 20 published articles
  - Article titles, descriptions, and publication dates
  - Author information
  - Reading time and view counts
  - Featured images as enclosures (RSS)

### 4. Reading Time Calculation
- **Function**: `calculateReadTimeFromTiptapJSON()`
- Calculates based on word count (200 words per minute)
- Works with Tiptap JSON content format
- Minimum 1 minute for any content
- Automatically calculated when creating/updating articles

### 5. Article Metadata Display
- **Component**: `ArticleMeta` and `ArticleStats`
- Displays reading time, view count, and publication date
- Responsive design with icons
- Used in article pages and listing pages

### 6. Robots.txt
- **Location**: `/robots.txt`
- Dynamic generation based on site URL
- Blocks API routes and admin areas
- Includes sitemap reference

## Environment Variables

Add these to your `.env` file:

```env
# SEO and Metadata
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=Your Blog Name
NEXT_PUBLIC_DEFAULT_OG_IMAGE=https://yourdomain.com/og-image.png
```

## Usage Examples

### Generating Metadata for Pages

```typescript
import { generateMetadata } from '@/lib/metadata'

export const metadata = generateMetadata({
  title: 'Article Title',
  description: 'Article description',
  canonical: 'https://example.com/article/slug',
  ogImage: 'https://example.com/image.jpg',
  readTime: 5,
  viewCount: 100,
})
```

### Generating Structured Data

```typescript
import { generateArticleStructuredData } from '@/lib/metadata'

// In your page component
const structuredData = generateArticleStructuredData(article)

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: structuredData }}
    />
    {/* Rest of your page content */}
  </>
)
```

### Displaying Article Meta Information

```typescript
import { ArticleMeta } from '@/components/ui/ArticleMeta'

<ArticleMeta
  readTime={article.read_time_minutes}
  viewCount={article.view_count}
  publishedAt={article.published_at}
/>
```

## Validation and Testing

### Google Rich Results Test
- Article pages include proper Article structured data
- Validates with Google's Rich Results testing tool
- Includes headline, image, author, publisher, and dates

### RSS/Atom Feed Validation
- Feeds validate against RSS 2.0 and Atom 1.0 standards
- Proper XML formatting and encoding
- Include all required elements

### Meta Tag Analysis
- Open Graph tags populate correctly
- Twitter cards display properly
- Canonical URLs are set correctly
- View counts and reading time included in meta tags

## File Structure

```
lib/
├── metadata.ts          # SEO metadata generation utilities
├── utils.ts            # Reading time calculation functions
└── articles.ts         # Updated with reading time calculation

app/
├── sitemap.xml/route.ts     # Dynamic sitemap generation
├── rss.xml/route.ts         # RSS feed generation
├── atom.xml/route.ts        # Atom feed generation
├── robots.txt/route.ts      # Dynamic robots.txt
├── layout.tsx              # Updated with SEO meta tags
├── page.tsx                # Home page with structured data
├── articles/page.tsx        # Articles listing with SEO
└── articles/[slug]/page.ts # Individual article pages with full SEO

components/ui/
└── ArticleMeta.tsx          # Article metadata display component

__tests__/
├── metadata.test.ts         # Metadata utilities tests
└── reading-time.test.ts     # Reading time calculation tests
```

## Performance Considerations

- **Caching**: Feeds and sitemap cached for 1 hour
- **Pagination**: Sitemap handles up to 1000 articles (can be increased)
- **Database Queries**: Optimized queries with proper indexing
- **Static Generation**: Metadata generated at build time when possible

## SEO Best Practices Implemented

1. **Semantic HTML5** structure
2. **Proper heading hierarchy** (h1, h2, etc.)
3. **Alt text** for images
4. **Internal linking** between articles
5. **URL structure** with descriptive slugs
6. **Mobile-friendly** responsive design
7. **Fast loading** with optimized images
8. **Secure HTTPS** URLs
9. **XML sitemaps** for search engines
10. **Structured data** for rich snippets