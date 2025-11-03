import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/metadata'

export function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml

# Block common non-content paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /*?*`

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}