'use client'

import { memo } from 'react'
import { generateJSON } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import YouTube from '@tiptap/extension-youtube'
import Link from '@tiptap/extension-link'

interface ArticlePreviewProps {
  content: any
  title?: string
  featuredImage?: string
}

// Memoized preview component to prevent unnecessary re-renders
const ArticlePreview = memo<ArticlePreviewProps>(({ content, title, featuredImage }) => {
  const renderTiptapContent = (node: any, index: number): JSX.Element => {
    if (!node) return null

    // Handle text nodes
    if (node.type === 'text') {
      return <span key={index}>{node.text}</span>
    }

    // Handle paragraph
    if (node.type === 'paragraph') {
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </p>
      )
    }

    // Handle headings
    if (node.type === 'heading') {
      const HeadingTag = `h${node.attrs?.level || 1}` as keyof JSX.IntrinsicElements
      const headingClasses = {
        1: 'text-3xl font-bold mb-4',
        2: 'text-2xl font-semibold mb-3',
        3: 'text-xl font-semibold mb-2',
        4: 'text-lg font-semibold mb-2',
        5: 'text-base font-semibold mb-2',
        6: 'text-sm font-semibold mb-2',
      }

      return (
        <HeadingTag
          key={index}
          className={headingClasses[node.attrs?.level as keyof typeof headingClasses] || headingClasses[1]}
        >
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </HeadingTag>
      )
    }

    // Handle bold text
    if (node.type === 'bold') {
      return (
        <strong key={index}>
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </strong>
      )
    }

    // Handle italic text
    if (node.type === 'italic') {
      return (
        <em key={index}>
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </em>
      )
    }

    // Handle underline
    if (node.type === 'underline') {
      return (
        <u key={index}>
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </u>
      )
    }

    // Handle links
    if (node.type === 'link') {
      return (
        <a
          key={index}
          href={node.attrs?.href}
          className="text-blue-600 hover:text-blue-800 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </a>
      )
    }

    // Handle bullet lists
    if (node.type === 'bulletList') {
      return (
        <ul key={index} className="list-disc list-inside mb-4 space-y-2">
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </ul>
      )
    }

    // Handle ordered lists
    if (node.type === 'orderedList') {
      return (
        <ol key={index} className="list-decimal list-inside mb-4 space-y-2">
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </ol>
      )
    }

    // Handle list items
    if (node.type === 'listItem') {
      return (
        <li key={index} className="leading-relaxed">
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </li>
      )
    }

    // Handle blockquotes
    if (node.type === 'blockquote') {
      return (
        <blockquote
          key={index}
          className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600"
        >
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </blockquote>
      )
    }

    // Handle code blocks
    if (node.type === 'codeBlock') {
      return (
        <pre
          key={index}
          className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-4 text-sm font-mono"
        >
          <code>{node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}</code>
        </pre>
      )
    }

    // Handle inline code
    if (node.type === 'code') {
      return (
        <code
          key={index}
          className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
        >
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </code>
      )
    }

    // Handle images
    if (node.type === 'image') {
      return (
        <img
          key={index}
          src={node.attrs?.src}
          alt={node.attrs?.alt || ''}
          className="max-w-full h-auto rounded-lg my-4"
          loading="lazy"
        />
      )
    }

    // Handle YouTube videos
    if (node.type === 'youtube') {
      const videoId = node.attrs?.src?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1]
      if (videoId) {
        return (
          <div key={index} className="aspect-video my-4">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
        )
      }
    }

    // Handle tables
    if (node.type === 'table') {
      return (
        <div key={index} className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-gray-300">
            <tbody>
              {node.content?.map((row: any, rowIndex: number) =>
                renderTiptapContent(row, rowIndex)
              )}
            </tbody>
          </table>
        </div>
      )
    }

    // Handle table rows
    if (node.type === 'tableRow') {
      return (
        <tr key={index}>
          {node.content?.map((cell: any, cellIndex: number) =>
            renderTiptapContent(cell, cellIndex)
          )}
        </tr>
      )
    }

    // Handle table cells
    if (node.type === 'tableCell' || node.type === 'tableHeader') {
      const Tag = node.type === 'tableHeader' ? 'th' : 'td'
      const cellClasses = node.type === 'tableHeader'
        ? 'border border-gray-300 bg-gray-50 font-semibold px-4 py-2 text-left'
        : 'border border-gray-300 px-4 py-2'

      return (
        <Tag key={index} className={cellClasses}>
          {node.content?.map((child: any, childIndex: number) =>
            renderTiptapContent(child, childIndex)
          )}
        </Tag>
      )
    }

    // Handle horizontal rules
    if (node.type === 'horizontalRule') {
      return <hr key={index} className="my-6 border-gray-300" />
    }

    // Handle hard breaks
    if (node.type === 'hardBreak') {
      return <br key={index} />
    }

    // Fallback for unknown node types
    return (
      <div key={index} className="mb-2 text-gray-500">
        [Unknown content type: {node.type}]
      </div>
    )
  }

  return (
    <div className="prose prose-lg max-w-none">
      {/* Featured image */}
      {featuredImage && (
        <div className="mb-6">
          <img
            src={featuredImage}
            alt="Featured"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Title */}
      {title && (
        <h1 className="text-4xl font-bold mb-6 text-gray-900">{title}</h1>
      )}

      {/* Content */}
      <div className="text-gray-800 leading-relaxed">
        {content?.content?.map((node: any, index: number) =>
          renderTiptapContent(node, index)
        )}
      </div>
    </div>
  )
})

ArticlePreview.displayName = 'ArticlePreview'

export { ArticlePreview }