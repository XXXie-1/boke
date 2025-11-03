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

    // Generate Atom XML
    const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${SITE_NAME}</title>
  <subtitle>A modern blog built with Next.js and TypeScript</subtitle>
  <link href="${SITE_URL}" />
  <link href="${SITE_URL}/atom.xml" rel="self" />
  <id>${SITE_URL}</id>
  <updated>${new Date().toISOString()}</updated>
  ${articles
    .map(article => {
      const publishedDate = article.published_at 
        ? new Date(article.published_at).toISOString()
        : new Date().toISOString()
      
      const updatedDate = article.updated_at
        ? new Date(article.updated_at).toISOString()
        : publishedDate

      const description = article.excerpt || 'Read more on our blog'
      const content = extractTextFromTiptapJSON(article.content)
      
      return `  <entry>
    <title>${escapeXml(article.title)}</title>
    <link href="${SITE_URL}/articles/${article.slug}" />
    <id>${SITE_URL}/articles/${article.slug}</id>
    <published>${publishedDate}</published>
    <updated>${updatedDate}</updated>
    <summary type="html">${escapeXml(description)}</summary>
    <content type="html">${escapeXml(content.substring(0, 500))}${content.length > 500 ? '...' : ''}</content>
    ${article.author ? `<author><name>${escapeXml(article.author.name || article.author.email || 'Anonymous')}</name></author>` : ''}
    ${article.read_time_minutes ? `<title>Reading time: ${article.read_time_minutes} minutes</title>` : ''}
    ${article.view_count ? `<title>Views: ${article.view_count}</title>` : ''}
  </entry>`
    })
    .join('\n')}
</feed>`

    return new NextResponse(atom, {
      status: 200,
      headers: {
        'Content-Type': 'application/atom+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating Atom feed:', error)
    return new NextResponse('Error generating Atom feed', { status: 500 })
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