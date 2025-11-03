import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { generateMetadata as generateSEOMetadata } from '@/lib/metadata'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = generateSEOMetadata({
  title: 'Blog',
  description: 'A modern blog platform built with Next.js, TypeScript, and Tailwind CSS. Read our latest articles and insights.',
  canonical: process.env.NEXT_PUBLIC_SITE_URL,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
        <link rel="alternate" type="application/atom+xml" title="Atom Feed" href="/atom.xml" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
