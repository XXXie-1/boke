// Mock data for development and testing
export const mockArticles = [
  {
    id: '1',
    title: 'Getting Started with Next.js 14 and TypeScript',
    slug: 'getting-started-nextjs-typescript',
    excerpt: 'Learn how to build modern web applications with Next.js 14, TypeScript, and Tailwind CSS.',
    featured_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ text: 'Getting Started with Next.js 14 and TypeScript', type: 'text' }]
        },
        {
          type: 'paragraph',
          content: [
            { text: 'Next.js 14 brings exciting new features and improvements for building modern web applications. In this comprehensive guide, we\'ll explore how to set up a new project with TypeScript and Tailwind CSS.', type: 'text' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ text: 'Setting Up Your Development Environment', type: 'text' }]
        },
        {
          type: 'paragraph',
          content: [
            { text: 'Before we begin, make sure you have Node.js installed on your machine. You\'ll also need a code editor like VS Code with the official extensions for better development experience.', type: 'text' }
          ]
        },
        {
          type: 'codeBlock',
          attrs: { language: 'bash' },
          content: [{ text: 'npx create-next-app@latest my-app --typescript --tailwind --eslint', type: 'text' }]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ text: 'Understanding the Project Structure', type: 'text' }]
        },
        {
          type: 'paragraph',
          content: [
            { text: 'The new Next.js 14 structure includes several important directories and files that you should be familiar with.', type: 'text' }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ text: 'app/ - Contains your application routes and layouts', type: 'text' }]
            },
            {
              type: 'listItem',
              content: [{ text: 'components/ - Reusable UI components', type: 'text' }]
            },
            {
              type: 'listItem',
              content: [{ text: 'lib/ - Utility functions and configurations', type: 'text' }]
            }
          ]
        }
      ]
    },
    author_id: 'author-1',
    status: 'published' as const,
    published_at: '2024-01-15T10:00:00Z',
    view_count: 1250,
    read_time_minutes: 8,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    author: {
      id: 'author-1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b6c6?w=32&h=32&fit=crop&crop=face'
    },
    article_tags: [
      {
        tag: {
          id: 'tag-1',
          name: 'Next.js',
          slug: 'nextjs',
          color: '#000000'
        }
      },
      {
        tag: {
          id: 'tag-2',
          name: 'TypeScript',
          slug: 'typescript',
          color: '#3178c6'
        }
      }
    ],
    article_categories: [
      {
        category: {
          id: 'cat-1',
          name: 'Web Development',
          slug: 'web-development',
          description: 'Articles about modern web development'
        }
      }
    ]
  },
  {
    id: '2',
    title: 'Building Responsive Layouts with Tailwind CSS',
    slug: 'responsive-layouts-tailwind',
    excerpt: 'Master the art of creating beautiful, responsive layouts using Tailwind CSS utility classes.',
    featured_image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=400&fit=crop',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ text: 'Building Responsive Layouts with Tailwind CSS', type: 'text' }]
        },
        {
          type: 'paragraph',
          content: [
            { text: 'Tailwind CSS revolutionizes the way we approach styling in web development. Let\'s explore how to create stunning responsive layouts.', type: 'text' }
          ]
        }
      ]
    },
    author_id: 'author-2',
    status: 'published' as const,
    published_at: '2024-01-10T14:30:00Z',
    view_count: 890,
    read_time_minutes: 6,
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z',
    author: {
      id: 'author-2',
      name: 'Mike Chen',
      email: 'mike@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
    },
    article_tags: [
      {
        tag: {
          id: 'tag-3',
          name: 'CSS',
          slug: 'css',
          color: '#1572b6'
        }
      },
      {
        tag: {
          id: 'tag-4',
          name: 'Tailwind',
          slug: 'tailwind',
          color: '#06b6d4'
        }
      }
    ],
    article_categories: [
      {
        category: {
          id: 'cat-1',
          name: 'Web Development',
          slug: 'web-development',
          description: 'Articles about modern web development'
        }
      }
    ]
  },
  {
    id: '3',
    title: 'Advanced React Patterns You Should Know',
    slug: 'advanced-react-patterns',
    excerpt: 'Explore powerful React patterns that will take your development skills to the next level.',
    featured_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ text: 'Advanced React Patterns You Should Know', type: 'text' }]
        },
        {
          type: 'paragraph',
          content: [
            { text: 'React offers numerous patterns for solving common problems. Let\'s dive into some advanced patterns that experienced developers should master.', type: 'text' }
          ]
        }
      ]
    },
    author_id: 'author-1',
    status: 'published' as const,
    published_at: '2024-01-05T09:15:00Z',
    view_count: 2100,
    read_time_minutes: 12,
    created_at: '2024-01-05T09:15:00Z',
    updated_at: '2024-01-05T09:15:00Z',
    author: {
      id: 'author-1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b6c6?w=32&h=32&fit=crop&crop=face'
    },
    article_tags: [
      {
        tag: {
          id: 'tag-5',
          name: 'React',
          slug: 'react',
          color: '#61dafb'
        }
      },
      {
        tag: {
          id: 'tag-6',
          name: 'JavaScript',
          slug: 'javascript',
          color: '#f7df1e'
        }
      }
    ],
    article_categories: [
      {
        category: {
          id: 'cat-2',
          name: 'Frontend',
          slug: 'frontend',
          description: 'Frontend development articles'
        }
      }
    ]
  },
  {
    id: '4',
    title: 'Database Design Best Practices',
    slug: 'database-design-best-practices',
    excerpt: 'Learn the fundamental principles of designing efficient and scalable databases.',
    featured_image: 'https://images.unsplash.com/photo-1558494949-ef010cbcc31e?w=800&h=400&fit=crop',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ text: 'Database Design Best Practices', type: 'text' }]
        },
        {
          type: 'paragraph',
          content: [
            { text: 'A well-designed database is crucial for application performance and scalability. Let\'s explore the best practices for database design.', type: 'text' }
          ]
        }
      ]
    },
    author_id: 'author-3',
    status: 'published' as const,
    published_at: '2024-01-01T16:45:00Z',
    view_count: 1560,
    read_time_minutes: 10,
    created_at: '2024-01-01T16:45:00Z',
    updated_at: '2024-01-01T16:45:00Z',
    author: {
      id: 'author-3',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
    },
    article_tags: [
      {
        tag: {
          id: 'tag-7',
          name: 'Database',
          slug: 'database',
          color: '#336791'
        }
      },
      {
        tag: {
          id: 'tag-8',
          name: 'PostgreSQL',
          slug: 'postgresql',
          color: '#336791'
        }
      }
    ],
    article_categories: [
      {
        category: {
          id: 'cat-3',
          name: 'Backend',
          slug: 'backend',
          description: 'Backend development articles'
        }
      }
    ]
  }
]

export const mockTags = [
  {
    id: 'tag-1',
    name: 'Next.js',
    slug: 'nextjs',
    color: '#000000',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tag-2',
    name: 'TypeScript',
    slug: 'typescript',
    color: '#3178c6',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tag-3',
    name: 'CSS',
    slug: 'css',
    color: '#1572b6',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tag-4',
    name: 'Tailwind',
    slug: 'tailwind',
    color: '#06b6d4',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tag-5',
    name: 'React',
    slug: 'react',
    color: '#61dafb',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tag-6',
    name: 'JavaScript',
    slug: 'javascript',
    color: '#f7df1e',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tag-7',
    name: 'Database',
    slug: 'database',
    color: '#336791',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tag-8',
    name: 'PostgreSQL',
    slug: 'postgresql',
    color: '#336791',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

export const mockCategories = [
  {
    id: 'cat-1',
    name: 'Web Development',
    slug: 'web-development',
    description: 'Articles about modern web development',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-2',
    name: 'Frontend',
    slug: 'frontend',
    description: 'Frontend development articles',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-3',
    name: 'Backend',
    slug: 'backend',
    description: 'Backend development articles',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]