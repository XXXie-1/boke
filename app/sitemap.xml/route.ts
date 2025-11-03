import { NextResponse } from 'next/server'
import { articlesService } from '@/lib/articles'
import { SITE_URL } from '@/lib/metadata'

export async function GET() {
  try {
    // Get all published articles
    const articlesResponse = await articlesService.getArticles({
      page: 1,
      limit: 1000, // Get all articles
      status: 'published',
      sort_by: 'published_at',
      sort_order: 'desc',
    })

    const articles = articlesResponse.data

    // Static pages
    const staticPages = [
      {
        url: SITE_URL,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0,
      },
      {
        url: `${SITE_URL}/articles`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      },
    ]

    // Article pages
    const articlePages = articles.map(article => ({
      url: `${SITE_URL}/articles/${article.slug}`,
      lastmod: article.updated_at || article.published_at || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
    }))

    // Combine all pages
    const allPages = [...staticPages, ...articlePages]

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}