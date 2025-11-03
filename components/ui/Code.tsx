'use client'

import { useState, useEffect } from 'react'
import { Button } from './Button'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

export function Code({ code, language = 'text', showLineNumbers = true, className }: CodeProps) {
  const [copied, setCopied] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState('')

  useEffect(() => {
    const highlightCode = async () => {
      try {
        // Dynamic import of lowlight to avoid SSR issues
        const { default: lowlight } = await import('lowlight')
        
        if (language === 'text') {
          setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`)
        } else {
          const result = lowlight.highlight(language, code)
          setHighlightedCode(result.value)
        }
      } catch (error) {
        // Fallback to plain text if highlighting fails
        setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`)
      }
    }

    highlightCode()
  }, [code, language])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  return (
    <div className={cn('relative rounded-lg overflow-hidden border bg-muted', className)}>
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <span className="text-xs font-medium text-muted-foreground">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyCode}
          className="h-6 px-2 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div 
        className="overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        style={{
          // Add line numbers if needed
          counterReset: showLineNumbers ? 'line' : 'none'
        }}
      />

      {/* Custom styles for line numbers */}
      <style jsx>{`
        pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
          font-family: 'Fira Code', 'Monaco', 'Consolas', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          background: transparent;
        }

        pre code {
          display: block;
          ${showLineNumbers ? `
            &::before {
              counter-increment: line;
              content: counter(line);
              display: inline-block;
              width: 2rem;
              margin-right: 1rem;
              text-align: right;
              color: #6b7280;
              user-select: none;
            }
          ` : ''}
        }

        /* Syntax highlighting styles - these will be enhanced by lowlight */
        .hljs-comment,
        .hljs-quote {
          color: #6b7280;
          font-style: italic;
        }

        .hljs-keyword,
        .hljs-selector-tag,
        .hljs-subst {
          color: #dc2626;
          font-weight: bold;
        }

        .hljs-number,
        .hljs-literal,
        .hljs-variable,
        .hljs-template-variable,
        .hljs-tag .hljs-attr {
          color: #2563eb;
        }

        .hljs-string,
        .hljs-doctag {
          color: #059669;
        }

        .hljs-title,
        .hljs-section,
        .hljs-selector-id {
          color: #7c3aed;
          font-weight: bold;
        }

        .hljs-type,
        .hljs-class .hljs-title {
          color: #ea580c;
          font-weight: bold;
        }

        .hljs-tag,
        .hljs-name,
        .hljs-attribute {
          color: #b91c1c;
          font-weight: normal;
        }

        .hljs-regexp,
        .hljs-link {
          color: #7c3aed;
        }

        .hljs-symbol,
        .hljs-bullet {
          color: #059669;
        }

        .hljs-built_in,
        .hljs-builtin-name {
          color: #2563eb;
        }

        .hljs-meta {
          color: #6b7280;
        }

        .hljs-deletion {
          background: #fee2e2;
        }

        .hljs-addition {
          background: #dcfce7;
        }

        .hljs-emphasis {
          font-style: italic;
        }

        .hljs-strong {
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}