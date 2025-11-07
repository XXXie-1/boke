import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '../../../types/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = createServerSupabaseClient<Database>({ req, res })
    
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { title, content, excerpt } = req.body

    if (!title.trim() || !content.trim()) {
      return res.status(400).json({ error: 'Title and content are required' })
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now()

    // Create the post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        author_id: session.user.id,
        published: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return res.status(500).json({ error: 'Failed to create post' })
    }

    res.status(200).json({ 
      message: 'Post created successfully',
      slug: post.slug 
    })

  } catch (error) {
    console.error('Error in create post API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
