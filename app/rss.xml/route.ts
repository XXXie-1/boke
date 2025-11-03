import { NextResponse } from 'next/server'
import { articlesService } from '@/lib/articles'
import { SITE_URL, SITE_NAME } from '@/lib/metadata'

export async function GET() {
  try {
    // Get latest published articles
    const articlesResponse = await articlesService.getArticles({
      page: 1,
      limit: 20, // Latest 20 articles
      status: 'published',
      sort_by: 'published_at',
      sort_order: 'desc',
    })

    const articles = articlesResponse.data

    // Generate RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <description>A modern blog built with Next.js and TypeScript</description>
    <link>${SITE_URL}</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${articles
      .map(article => {
        const publishedDate = article.published_at 
          ? new Date(article.published_at).toUTCString()
          : new Date().toUTCString()
        
        const updatedDate = article.updated_at
          ? new Date(article.updated_at).toUTCString()
          : publishedDate

        const description = article.excerpt || 'Read more on our blog'
        const content = extractTextFromTiptapJSON(article.content)
        
        return `    <item>
      <title>${escapeXml(article.title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${SITE_URL}/articles/${article.slug}</link>
      <guid>${SITE_URL}/articles/${article.slug}</guid>
      <pubDate>${publishedDate}</pubDate>
      <lastBuildDate>${updatedDate}</lastBuildDate>
      ${article.author ? `<author>${escapeXml(article.author.name || article.author.email || 'Anonymous')}</author>` : ''}
      ${article.read_time_minutes ? `<docs>Reading time: ${article.read_time_minutes} minutes</docs>` : ''}
      ${article.view_count ? `<comments>Views: ${article.view_count}</comments>` : ''}
      ${article.featured_image ? `<enclosure url="${escapeXml(article.featured_image)}" type="image/jpeg" />` : ''}
    </item>`
      })
      .join('\n')}
  </channel>
</rss>`

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}

// Helper function to extract text from Tiptap JSON
function extractTextFromTiptapJSON(json: any): string {
  if (!json || typeof json !== 'object') {
    return ''
  }

  function extractTextFromNode(node: any): string {
    if (node.type === 'text') {
      return node.text || ''
    }
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractTextFromNode).join('')
    }
    
    return ''
  }

  return extractTextFromNode(json)
}

// Helper function to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}