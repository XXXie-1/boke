import type { Metadata } from 'next'

export interface SEOParams {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

export function generateMetadata({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  keywords = [],
  author,
  publishedTime,
  modifiedTime
}: SEOParams): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'
  
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl
  const defaultOgImage = ogImage || `${siteUrl}/og-image.png`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: canonicalUrl,
      title: fullTitle,
      description,
      siteName,
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime,
      modifiedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [defaultOgImage],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export function generateArticleMetadata(article: {
  title: string
  excerpt?: string
  slug: string
  featured_image?: string
  published_at?: string
  updated_at?: string
  author?: {
    name?: string
  }
  tags?: { tag: { name: string } }[]
  categories?: { category: { name: string } }[]
}): Metadata {
  return generateMetadata({
    title: article.title,
    description: article.excerpt || `Read ${article.title}`,
    canonical: `/articles/${article.slug}`,
    ogImage: article.featured_image,
    ogType: 'article',
    author: article.author?.name,
    publishedTime: article.published_at,
    modifiedTime: article.updated_at,
    keywords: [
      ...(article.tags?.map(t => t.tag.name) || []),
      ...(article.categories?.map(c => c.category.name) || []),
    ],
  })
}

export function generateTagMetadata(tag: {
  name: string
  slug: string
  article_count?: number
}): Metadata {
  const description = `Browse all articles tagged with "${tag.name}"${tag.article_count ? ` (${tag.article_count} articles)` : ''}`
  
  return generateMetadata({
    title: `${tag.name} Tag`,
    description,
    canonical: `/tags/${tag.slug}`,
    keywords: [tag.name],
  })
}

export function generateCategoryMetadata(category: {
  name: string
  slug: string
  description?: string
  article_count?: number
}): Metadata {
  const description = category.description || `Browse all articles in the "${category.name}" category${category.article_count ? ` (${category.article_count} articles)` : ''}`
  
  return generateMetadata({
    title: `${category.name} Category`,
    description,
    canonical: `/categories/${category.slug}`,
    keywords: [category.name],
  })
}

export function generateArchiveMetadata(year: number, month?: number, articleCount?: number): Metadata {
  const monthName = month ? new Date(year, month - 1).toLocaleString('default', { month: 'long' }) : ''
  const title = month ? `${monthName} ${year}` : `${year}`
  const description = `Browse all articles from ${title.toLowerCase()}${articleCount ? ` (${articleCount} articles)` : ''}`
  const canonical = month ? `/archive/${year}/${month}` : `/archive/${year}`
  
  return generateMetadata({
    title: `${title} Archive`,
    description,
    canonical,
    keywords: [title, 'archive', 'blog'],
  })
}

export function generateSearchMetadata(query?: string): Metadata {
  const title = query ? `Search results for "${query}"` : 'Search'
  const description = query 
    ? `Find articles matching "${query}" across our blog`
    : 'Search our blog for articles, topics, and more'
  
  return generateMetadata({
    title,
    description,
    canonical: query ? `/search?q=${encodeURIComponent(query)}` : '/search',
    keywords: ['search', 'blog', 'articles', ...(query ? [query] : [])],
  })
}

export function generateAboutMetadata(): Metadata {
  return generateMetadata({
    title: 'About',
    description: 'Learn more about our blog, our mission, and the team behind the content.',
    canonical: '/about',
    keywords: ['about', 'blog', 'team', 'mission'],
  })
}