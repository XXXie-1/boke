'use client'

import { CommentsSection } from '@/components/comments/CommentsSection'

const SampleArticlePage = () => {
  const sampleArticleId = '00000000-0000-0000-0000-000000000000' // Fixed UUID for demo

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Article header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight">
              Welcome to Our Comment System Demo
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Published {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span>Demo Article</span>
            </div>
          </div>

          {/* Article content */}
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed">
              <p>
                This is a sample article demonstrating our advanced commenting system. 
                Feel free to explore all the features below!
              </p>
              
              <h2>Features to Try:</h2>
              <ul>
                <li><strong>Post a comment</strong> - Use the form below to share your thoughts</li>
                <li><strong>Markdown support</strong> - Try formatting with **bold**, *italic*, or code blocks</li>
                <li><strong>Live preview</strong> - Toggle preview to see how your comment will look</li>
                <li><strong>Character counter</strong> - See real-time character count as you type</li>
                <li><strong>Reply to comments</strong> - Create threaded discussions (up to 3 levels deep)</li>
                <li><strong>Smart avatars</strong> - Each nickname gets a unique, deterministic avatar</li>
                <li><strong>Timestamps</strong> - See relative time formatting (e.g., "2 hours ago")</li>
              </ul>

              <h2>Comment Guidelines:</h2>
              <p>
                All comments are moderated before appearing publicly. This ensures a respectful 
                and constructive discussion environment. Your comment will be visible once approved 
                by an administrator.
              </p>

              <h2>Markdown Examples:</h2>
              <p>Try these in your comment:</p>
              <pre><code>{`**Bold text**
*Italic text*
[Link](https://example.com)
\`Inline code\`

\`\`\`javascript
// Code block
console.log('Hello World');
\`\`\`

> Blockquote
- List item 1
- List item 2`}</code></pre>

              <p>
                Explore the admin dashboard to see how comment moderation works. 
                You can approve, reject, or delete comments as needed.
              </p>
            </div>
          </div>

          {/* Comments section */}
          <CommentsSection 
            articleId={sampleArticleId}
            maxNestingLevel={3}
          />
        </div>
      </div>
    </div>
  )
}

export default SampleArticlePage
