import { describe, it, expect } from 'vitest'
import { generateMetadata, generateStructuredData, generateArticleStructuredData } from '@/lib/metadata'

describe('Metadata Utils', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SITE_URL: 'https://example.com',
      NEXT_PUBLIC_SITE_NAME: 'Test Blog',
      NEXT_PUBLIC_DEFAULT_OG_IMAGE: 'https://example.com/og-image.png',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('generateMetadata', () => {
    it('should generate basic metadata', () => {
      const metadata = generateMetadata({
        title: 'Test Article',
        description: 'Test description',
      })

      expect(metadata.title).toBe('Test Article | Test Blog')
      expect(metadata.description).toBe('Test description')
      expect(metadata.openGraph?.title).toBe('Test Article | Test Blog')
      expect(metadata.twitter?.card).toBe('summary_large_image')
    })

    it('should include SEO properties', () => {
      const metadata = generateMetadata({
        title: 'Test Article',
        description: 'Test description',
        canonical: 'https://example.com/test',
        ogImage: 'https://example.com/image.jpg',
        readTime: 5,
        viewCount: 100,
      })

      expect(metadata.alternates?.canonical).toBe('https://example.com/test')
      expect(metadata.openGraph?.images?.[0]?.url).toBe('https://example.com/image.jpg')
      expect(metadata.other?.['article:read_time']).toBe('5 minutes')
      expect(metadata.other?.['article:view_count']).toBe('100')
    })

    it('should handle noindex', () => {
      const metadata = generateMetadata({
        title: 'Test Article',
        noindex: true,
      })

      expect(metadata.robots?.index).toBe(false)
      expect(metadata.robots?.follow).toBe(false)
    })
  })

  describe('generateStructuredData', () => {
    it('should generate Article structured data', () => {
      const structuredData = generateStructuredData({
        type: 'Article',
        title: 'Test Article',
        description: 'Test description',
        url: 'https://example.com/test',
        publishedTime: '2023-01-01T00:00:00Z',
        readTime: 5,
        viewCount: 100,
      })

      const parsed = JSON.parse(structuredData)
      expect(parsed['@type']).toBe('Article')
      expect(parsed.headline).toBe('Test Article')
      expect(parsed.description).toBe('Test description')
      expect(parsed.url).toBe('https://example.com/test')
      expect(parsed.datePublished).toBe('2023-01-01T00:00:00Z')
      expect(parsed.timeRequired).toBe('PT5M')
      expect(parsed.interactionStatistic.userInteractionCount).toBe(100)
    })

    it('should generate Blog structured data', () => {
      const structuredData = generateStructuredData({
        type: 'Blog',
        title: 'Test Blog',
        description: 'Test blog description',
        url: 'https://example.com',
      })

      const parsed = JSON.parse(structuredData)
      expect(parsed['@type']).toBe('Blog')
      expect(parsed.name).toBe('Test Blog')
      expect(parsed.description).toBe('Test blog description')
      expect(parsed.url).toBe('https://example.com')
    })
  })

  describe('generateArticleStructuredData', () => {
    it('should generate structured data from article object', () => {
      const article = {
        title: 'Test Article',
        slug: 'test-article',
        excerpt: 'Test excerpt',
        featured_image: 'https://example.com/image.jpg',
        published_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        author: { name: 'Test Author' },
        read_time_minutes: 5,
        view_count: 100,
        tags: [{ name: 'tag1' }, { name: 'tag2' }],
        categories: [{ name: 'category1' }],
      }

      const structuredData = generateArticleStructuredData(article)
      const parsed = JSON.parse(structuredData)

      expect(parsed['@type']).toBe('Article')
      expect(parsed.headline).toBe('Test Article')
      expect(parsed.description).toBe('Test excerpt')
      expect(parsed.url).toBe('https://example.com/articles/test-article')
      expect(parsed.image.url).toBe('https://example.com/image.jpg')
      expect(parsed.author.name).toBe('Test Author')
      expect(parsed.timeRequired).toBe('PT5M')
      expect(parsed.interactionStatistic.userInteractionCount).toBe(100)
      expect(parsed.keywords).toContain('tag1')
      expect(parsed.keywords).toContain('category1')
    })

    it('should handle missing optional fields', () => {
      const article = {
        title: 'Test Article',
        slug: 'test-article',
      }

      const structuredData = generateArticleStructuredData(article)
      const parsed = JSON.parse(structuredData)

      expect(parsed['@type']).toBe('Article')
      expect(parsed.headline).toBe('Test Article')
      expect(parsed.description).toBe('')
      expect(parsed.url).toBe('https://example.com/articles/test-article')
      expect(parsed.image).toBeUndefined()
      expect(parsed.author).toBeUndefined()
      expect(parsed.timeRequired).toBeUndefined()
      expect(parsed.interactionStatistic).toBeUndefined()
    })
  })
})