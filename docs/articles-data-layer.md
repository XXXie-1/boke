# Articles Data Layer Documentation

## Overview

This document describes the comprehensive article data layer implementation for the Next.js application with Supabase backend. The data layer provides TypeScript domain models, CRUD operations, API handlers, and caching strategies.

## Architecture

### Core Components

1. **TypeScript Models** (`lib/supabase.ts`)
   - Database types aligned with Supabase schema
   - Generated types for articles, tags, categories, comments
   - View and function types for advanced operations

2. **Zod Schemas** (`lib/schemas.ts`)
   - Input validation schemas for all entities
   - Query parameter validation
   - Type-safe API payloads

3. **Data Access Layer** (`lib/articles.ts`)
   - Service-based architecture for CRUD operations
   - Parameterized Supabase queries
   - Business logic for slug generation and read time

4. **API Routes** (`app/api/*`)
   - RESTful endpoints with proper HTTP methods
   - Error handling and validation
   - Response caching with revalidation tags

5. **Server Actions** (`lib/actions.ts`)
   - Client-side callable functions
   - Automatic cache revalidation
   - Prefetch helpers for SSR/SSG

## Database Schema

### Articles Table
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL, -- Tiptap JSON format
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tags Table
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT, -- Hex color code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Junction Tables
```sql
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE article_categories (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (article_id, category_id)
);
```

## API Endpoints

### Articles
- `GET /api/articles` - List articles with pagination and filtering
- `POST /api/articles` - Create new article
- `GET /api/articles/[slug]` - Get single article by slug
- `PUT /api/articles/[slug]` - Update article by slug
- `DELETE /api/articles/[slug]` - Delete article by slug
- `POST /api/articles/[slug]/view` - Increment view count

### Tags
- `GET /api/tags` - List all tags with article counts
- `POST /api/tags` - Create new tag
- `GET /api/tags/[slug]` - Get single tag by slug

### Categories
- `GET /api/categories` - List all categories with article counts
- `POST /api/categories` - Create new category
- `GET /api/categories/[slug]` - Get single category by slug

### Comments
- `GET /api/comments` - Get comments by article ID
- `POST /api/comments` - Create new comment

## Caching Strategy

### Cache Headers
All API responses include appropriate cache headers:

- **Articles list**: 5 minutes (s-maxage=300)
- **Single article**: 1 hour (s-maxage=3600)
- **Tags/Categories**: 10 minutes (s-maxage=600)
- **Comments**: 5 minutes (s-maxage=300)
- **View counts**: 5 minutes (s-maxage=300)

### Revalidation Tags
Cache invalidation uses Next.js revalidation tags:

- `articles` - All article-related data
- `article:[slug]` - Specific article data
- `tags` - All tag data
- `tag:[slug]` - Specific tag data
- `categories` - All category data
- `category:[slug]` - Specific category data
- `comments` - All comment data
- `article-views` - View count data

### Server Actions Revalidation
Server Actions automatically revalidate relevant cache tags:

```typescript
// Creating an article
revalidateTag('articles')

// Updating an article
revalidateTag('articles')
revalidateTag(`article:${slug}`)

// Incrementing view count
revalidateTag(`article:${slug}`)
revalidateTag('article-views')
```

## Usage Examples

### Client-side with Server Actions
```typescript
import { createArticle, getArticles } from '@/lib/actions'

// Fetch articles
const { data: articles, pagination } = await getArticles({
  page: 1,
  limit: 10,
  status: 'published'
})

// Create article
const newArticle = await createArticle({
  title: 'My Article',
  content: { type: 'doc', content: [...] },
  author_id: 'user-id',
  status: 'draft'
}, ['tag1', 'tag2'], ['category1'])
```

### Server-side API calls
```typescript
// API Route Handler
import { articlesService } from '@/lib/articles'

export async function GET(request: NextRequest) {
  const result = await articlesService.getArticles(query)
  
  const response = NextResponse.json(result)
  response.headers.set('Cache-Control', 'public, s-maxage=300')
  response.headers.set('Cache-Tag', 'articles')
  
  return response
}
```

### Direct service usage
```typescript
import { articlesService } from '@/lib/articles'

// Get article by slug
const article = await articlesService.getArticleBySlug('my-article')

// Create article with tags and categories
const article = await articlesService.createArticle(
  articleData,
  ['tag-id-1', 'tag-id-2'],
  ['category-id-1']
)
```

## Content Handling

### Tiptap JSON Format
Articles use Tiptap JSON format for rich content:

```typescript
const content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello world!' }
      ]
    }
  ]
}
```

### Markdown Conversion
```typescript
import { markdownToTiptapJSON, tiptapJSONToMarkdown } from '@/lib/utils'

// Convert markdown to Tiptap JSON
const json = markdownToTiptapJSON('# Hello World\n\nThis is **bold** text.')

// Convert Tiptap JSON to markdown
const markdown = tiptapJSONToMarkdown(json)
```

### Slug Generation
```typescript
import { generateSlug } from '@/lib/utils'

// Generate unique slug
const slug = generateSlug('My Article Title', ['existing-slug'])
// Output: 'my-article-title-2'
```

### Read Time Calculation
```typescript
import { calculateReadTime, extractPlainText } from '@/lib/utils'

// Calculate read time from Tiptap JSON
const plainText = extractPlainText(tiptapJson)
const readTime = calculateReadTime(plainText)
```

## Error Handling

### Validation Errors
All inputs are validated using Zod schemas:

```typescript
try {
  const articleData = ArticleInput.parse(input)
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Invalid data', details: error.errors },
      { status: 400 }
    )
  }
}
```

### Database Errors
Service methods throw descriptive errors:

```typescript
try {
  const article = await articlesService.getArticleBySlug(slug)
} catch (error) {
  if (error.message === 'Article not found') {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }
  throw error
}
```

## Testing

### Unit Tests
Tests cover:
- Slug generation uniqueness
- Read time calculation accuracy
- Content serialization
- Service method behavior
- Error handling

### Test Structure
```typescript
describe('generateSlug', () => {
  it('should generate slug from text', () => {
    expect(generateSlug('Hello World!')).toBe('hello-world')
  })
  
  it('should ensure uniqueness', () => {
    const slug = generateSlug('Hello', ['hello'])
    expect(slug).toBe('hello-2')
  })
})
```

## Performance Considerations

### Database Indexes
Recommended indexes for optimal performance:

```sql
-- Articles
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_published ON articles(published_at);
CREATE INDEX idx_articles_view_count ON articles(view_count);

-- Tags
CREATE INDEX idx_tags_slug ON tags(slug);

-- Categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Comments
CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comments_status ON comments(status);

-- Junction tables
CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);
CREATE INDEX idx_article_categories_article ON article_categories(article_id);
CREATE INDEX idx_article_categories_category ON article_categories(category_id);
```

### Query Optimization
- Use specific column selection instead of `SELECT *`
- Implement proper pagination with `LIMIT` and `OFFSET`
- Use database functions for complex operations (view count increment)
- Consider materialized views for article statistics

## Security Considerations

### Input Validation
- All inputs validated with Zod schemas
- SQL injection prevention through parameterized queries
- Content sanitization for user-generated content

### Authorization
- Server-side permission checks
- Row-level security policies in Supabase
- Rate limiting for API endpoints

### Data Privacy
- PII handling compliance
- Secure file upload for featured images
- Comment moderation workflow

## Deployment Notes

### Environment Variables
Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Database Migration
Run migrations in order:

1. Create base tables
2. Add indexes
3. Create views and functions
4. Set up RLS policies

### Monitoring
- Monitor API response times
- Track cache hit rates
- Log database query performance
- Set up alerts for error rates
