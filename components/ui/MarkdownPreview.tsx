import { cn } from '@/lib'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

const MarkdownPreview = ({ content, className }: MarkdownPreviewProps) => {
  return (
    <div 
      className={cn(
        'prose prose-sm max-w-none',
        'prose-headings:font-semibold prose-headings:text-foreground',
        'prose-p:text-foreground prose-p:leading-relaxed',
        'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
        'prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground prose-blockquote:pl-4 prose-blockquote:italic',
        'prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm prose-code:font-mono',
        'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto',
        'prose-ul:list-disc prose-ol:list-decimal',
        'prose-li:marker:text-muted-foreground',
        'prose-table:border prose-table:border-border',
        'prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left',
        'prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

export { MarkdownPreview }
