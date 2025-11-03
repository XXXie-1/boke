import { Metadata } from 'next'

export interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: string
  twitterCard?: 'summary' | 'summary_large_image'
  noindex?: boolean
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  readTime?: number
  viewCount?: number
}

export interface StructuredDataProps {
  type: 'Article' | 'Blog' | 'WebPage' | 'Website'
  title: string
  description: string
  url: string
  image?: string
  publishedTime?: string
  modifiedTime?: string
  author?: {
    name: string
    url?: string
  }
  publisher?: {
    name: string
    logo?: string
  }
  readTime?: number
  viewCount?: number
  keywords?: string[]
}

const getSiteConfig = () => ({
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Blog',
  DEFAULT_OG_IMAGE: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/og-image.png`,
})

// Export the site config for use in route handlers
export const { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } = getSiteConfig()

export function generateMetadata(seo: SEOProps = {}): Metadata {
  const {
    title,
    description,
    canonical,
    ogImage,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    noindex = false,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    readTime,
    viewCount
  } = seo

  const { SITE_NAME, DEFAULT_OG_IMAGE } = getSiteConfig()
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const metaDescription = description || 'A modern blog built with Next.js and TypeScript'

  const metadata: Metadata = {
    title: fullTitle,
    description: metaDescription,
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
      },
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: canonical,
      title: fullTitle,
      description: metaDescription,
      siteName: SITE_NAME,
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        }
      ],
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags,
    },
    twitter: {
      card: twitterCard,
      title: fullTitle,
      description: metaDescription,
      images: ogImage ? [ogImage] : [DEFAULT_OG_IMAGE],
      creator: author,
    },
    alternates: {
      canonical: canonical,
    },
    other: {
      'article:read_time': readTime ? `${readTime} minutes` : undefined,
      'article:view_count': viewCount?.toString(),
    },
  }

  // Remove undefined values
  Object.keys(metadata.other || {}).forEach(key => {
    if (metadata.other?.[key] === undefined) {
      delete metadata.other?.[key]
    }
  })

  return metadata
}

export function generateStructuredData(data: StructuredDataProps): string {
  const {
    type,
    title,
    description,
    url,
    image,
    publishedTime,
    modifiedTime,
    author,
    publisher,
    readTime,
    viewCount,
    keywords
  } = data

  const { SITE_NAME, DEFAULT_OG_IMAGE } = getSiteConfig()

  let structuredData: any = {
    '@context': 'https://schema.org',
    '@type': type,
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  if (image) {
    structuredData.image = {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630,
    }
  }

  if (publishedTime) {
    structuredData.datePublished = publishedTime
  }

  if (modifiedTime) {
    structuredData.dateModified = modifiedTime
  }

  if (author) {
    structuredData.author = {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    }
  }

  if (publisher) {
    structuredData.publisher = {
      '@type': 'Organization',
      name: publisher.name,
      ...(publisher.logo && {
        logo: {
          '@type': 'ImageObject',
          url: publisher.logo,
        },
      }),
    }
  }

  if (type === 'Article') {
    structuredData = {
      ...structuredData,
      articleSection: 'Technology',
      keywords: keywords?.join(', '),
      ...(readTime && {
        timeRequired: `PT${readTime}M`,
      }),
      ...(viewCount && {
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/ViewAction',
          userInteractionCount: viewCount,
        },
      }),
    }
  }

  if (type === 'Blog') {
    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: title,
      description,
      url,
      publisher: publisher ? {
        '@type': 'Organization',
        name: publisher.name,
        ...(publisher.logo && {
          logo: {
            '@type': 'ImageObject',
            url: publisher.logo,
          },
        }),
      } : {
        '@type': 'Organization',
        name: SITE_NAME,
      },
      inLanguage: 'en-US',
    }
  }

  return JSON.stringify(structuredData, null, 2)
}

export function generateArticleStructuredData(article: {
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at?: string
  updated_at?: string
  author?: { name: string; email?: string; avatar_url?: string }
  read_time_minutes?: number
  view_count?: number
  tags?: Array<{ name: string; slug: string }>
  categories?: Array<{ name: string; slug: string }>
}) {
  const { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } = getSiteConfig()
  
  return generateStructuredData({
    type: 'Article',
    title: article.title,
    description: article.excerpt || '',
    url: `${SITE_URL}/articles/${article.slug}`,
    image: article.featured_image,
    publishedTime: article.published_at,
    modifiedTime: article.updated_at || article.published_at,
    author: article.author ? {
      name: article.author.name,
    } : undefined,
    publisher: {
      name: SITE_NAME,
      logo: DEFAULT_OG_IMAGE,
    },
    readTime: article.read_time_minutes,
    viewCount: article.view_count,
    keywords: [
      ...(article.tags?.map(tag => tag.name) || []),
      ...(article.categories?.map(cat => cat.name) || []),
    ],
  })
}

export function generateBlogStructuredData() {
  const { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } = getSiteConfig()
  
  return generateStructuredData({
    type: 'Blog',
    title: SITE_NAME,
    description: 'A modern blog built with Next.js and TypeScript',
    url: SITE_URL,
    publisher: {
      name: SITE_NAME,
      logo: DEFAULT_OG_IMAGE,
    },
  })
}