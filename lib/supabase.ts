import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/anonymous access
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Client for server-side operations with elevated permissions
export const createSupabaseServerClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Database types (these should be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          content: string // JSON content from Tiptap
          excerpt?: string
          featured_image?: string
          author_id: string
          status: 'draft' | 'published' | 'archived'
          published_at?: string
          view_count: number
          read_time_minutes?: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['articles']['Row'],
          'id' | 'created_at' | 'updated_at' | 'view_count'
        >
        Update: Partial<Database['public']['Tables']['articles']['Row']>
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          color?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['tags']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['tags']['Row']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description?: string
          parent_id?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['categories']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['categories']['Row']>
      }
      comments: {
        Row: {
          id: string
          article_id: string
          nickname: string
          content: string
          ip_hash: string
          parent_id?: string
          status: 'pending' | 'approved' | 'rejected'
          moderation_reason?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['comments']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['comments']['Row']>
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: Database['public']['Tables']['article_tags']['Row']
        Update: Partial<Database['public']['Tables']['article_tags']['Row']>
      }
      article_categories: {
        Row: {
          article_id: string
          category_id: string
        }
        Insert: Database['public']['Tables']['article_categories']['Row']
        Update: Partial<
          Database['public']['Tables']['article_categories']['Row']
        >
      }
    }
    Views: {
      article_stats: {
        Row: {
          article_id: string
          title: string
          slug: string
          view_count: number
          comment_count: number
          tag_count: number
          category_count: number
          published_at: string
        }
      }
    }
    Functions: {
      increment_view_count: {
        Args: {
          article_id: string
        }
        Returns: {
          view_count: number
        }
      }
    }
  }
}

export type Article = Database['public']['Tables']['articles']['Row']
export type ArticleInsert = Database['public']['Tables']['articles']['Insert']
export type ArticleUpdate = Database['public']['Tables']['articles']['Update']
export type Tag = Database['public']['Tables']['tags']['Row']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type Category = Database['public']['Tables']['categories']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type ArticleStats = Database['public']['Views']['article_stats']['Row']
