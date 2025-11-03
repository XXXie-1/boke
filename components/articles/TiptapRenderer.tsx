'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Code } from '@/components/ui/Code'
import { cn } from '@/lib/utils'

interface TiptapNode {
  type: string
  attrs?: Record<string, any>
  content?: TiptapNode[]
  text?: string
  marks?: Array<{
    type: string
    attrs?: Record<string, any>
  }>
}

interface TiptapRendererProps {
  content: TiptapNode
  className?: string
}

const TiptapRenderer = memo(({ content, className }: TiptapRendererProps) => {
  const renderNode = (node: TiptapNode, index: number): React.ReactNode => {
    if (!node) return null

    switch (node.type) {
      case 'doc':
        return (
          <div key={index} className={cn('tiptap-content', className)}>
            {node.content?.map((child, i) => renderNode(child, i))}
          </div>
        )

      case 'paragraph':
        return (
          <p key={index} className="mb-4 last:mb-0 leading-relaxed">
            {node.content?.map((child, i) => renderNode(child, i))}
          </p>
        )

      case 'heading':
        const HeadingTag = `h${node.attrs?.level || 1}` as keyof JSX.IntrinsicElements
        const headingId = `heading-${node.attrs?.level || 1}-${index}`
        return (
          <HeadingTag
            key={index}
            id={headingId}
            className={cn(
              'scroll-mt-24 font-bold tracking-tight',
              {
                'text-4xl mb-6 mt-8': node.attrs?.level === 1,
                'text-3xl mb-4 mt-6': node.attrs?.level === 2,
                'text-2xl mb-3 mt-5': node.attrs?.level === 3,
                'text-xl mb-2 mt-4': node.attrs?.level === 4,
                'text-lg mb-2 mt-3': node.attrs?.level === 5,
                'text-base mb-2 mt-2': node.attrs?.level === 6,
              }
            )}
          >
            {node.content?.map((child, i) => renderNode(child, i))}
          </HeadingTag>
        )

      case 'text':
        let TextElement = <span key={index}>{node.text}</span>
        
        if (node.marks) {
          node.marks.forEach((mark) => {
            switch (mark.type) {
              case 'bold':
                TextElement = <strong key={index}>{TextElement}</strong>
                break
              case 'italic':
                TextElement = <em key={index}>{TextElement}</em>
                break
              case 'underline':
                TextElement = <u key={index}>{TextElement}</u>
                break
              case 'strike':
                TextElement = <s key={index}>{TextElement}</s>
                break
              case 'code':
                TextElement = <code key={index} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{TextElement}</code>
                break
              case 'link':
                TextElement = (
                  <Link
                    key={index}
                    href={mark.attrs?.href || '#'}
                    className="text-primary hover:underline underline-offset-4"
                    target={mark.attrs?.target}
                    rel={mark.attrs?.rel}
                  >
                    {TextElement}
                  </Link>
                )
                break
            }
          })
        }
        
        return TextElement

      case 'bulletList':
        return (
          <ul key={index} className="list-disc list-inside mb-4 space-y-1">
            {node.content?.map((child, i) => renderNode(child, i))}
          </ul>
        )

      case 'orderedList':
        return (
          <ol key={index} className="list-decimal list-inside mb-4 space-y-1">
            {node.content?.map((child, i) => renderNode(child, i))}
          </ol>
        )

      case 'listItem':
        return (
          <li key={index} className="mb-1">
            {node.content?.map((child, i) => renderNode(child, i))}
          </li>
        )

      case 'blockquote':
        return (
          <blockquote key={index} className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
            {node.content?.map((child, i) => renderNode(child, i))}
          </blockquote>
        )

      case 'codeBlock':
        return (
          <div key={index} className="relative mb-4">
            <Code
              code={node.content?.map(child => child.text || '').join('\n') || ''}
              language={node.attrs?.language || 'text'}
            />
          </div>
        )

      case 'horizontalRule':
        return <hr key={index} className="my-8 border-border" />

      case 'image':
        return (
          <div key={index} className="relative my-6">
            <Image
              src={node.attrs?.src || ''}
              alt={node.attrs?.alt || ''}
              width={node.attrs?.width || 800}
              height={node.attrs?.height || 400}
              className="rounded-lg object-cover w-full"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
            {node.attrs?.title && (
              <p className="text-sm text-muted-foreground mt-2 text-center italic">
                {node.attrs.title}
              </p>
            )}
          </div>
        )

      case 'video':
        return (
          <div key={index} className="relative my-6">
            {node.attrs?.src ? (
              <video
                src={node.attrs.src}
                controls
                className="w-full rounded-lg"
                poster={node.attrs?.poster}
              >
                Your browser does not support the video tag.
              </video>
            ) : node.attrs?.iframeSrc ? (
              <div className="relative aspect-video">
                <iframe
                  src={node.attrs.iframeSrc}
                  title={node.attrs?.title || 'Video'}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            ) : null}
          </div>
        )

      case 'table':
        return (
          <div key={index} className="my-6 overflow-x-auto">
            <table className="min-w-full border-collapse border border-border">
              <tbody>
                {node.content?.map((child, i) => renderNode(child, i))}
              </tbody>
            </table>
          </div>
        )

      case 'tableRow':
        return (
          <tr key={index} className="border-b border-border">
            {node.content?.map((child, i) => renderNode(child, i))}
          </tr>
        )

      case 'tableCell':
        return (
          <td
            key={index}
            className={cn(
              'border border-border px-4 py-2 text-left',
              node.attrs?.colspan && `col-span-${node.attrs.colspan}`,
              node.attrs?.rowspan && `row-span-${node.attrs.rowspan}`
            )}
            colSpan={node.attrs?.colspan}
            rowSpan={node.attrs?.rowspan}
          >
            {node.content?.map((child, i) => renderNode(child, i))}
          </td>
        )

      case 'tableHeader':
        return (
          <th
            key={index}
            className={cn(
              'border border-border px-4 py-2 text-left font-semibold bg-muted',
              node.attrs?.colspan && `col-span-${node.attrs.colspan}`,
              node.attrs?.rowspan && `row-span-${node.attrs.rowspan}`
            )}
            colSpan={node.attrs?.colspan}
            rowSpan={node.attrs?.rowspan}
          >
            {node.content?.map((child, i) => renderNode(child, i))}
          </th>
        )

      case 'hardBreak':
        return <br key={index} />

      default:
        console.warn(`Unsupported node type: ${node.type}`)
        return null
    }
  }

  return renderNode(content, 0)
})

TiptapRenderer.displayName = 'TiptapRenderer'

export { TiptapRenderer }