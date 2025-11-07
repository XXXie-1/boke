import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { Database } from '../../types/database'

type UserProfile = Database['public']['Tables']['profiles']['Row']
type Post = Database['public']['Tables']['posts']['Row'] & {
  profiles: Pick<UserProfile, 'username' | 'full_name'>
}

type PostPageProps = {
  post: Post | null
  user: UserProfile | null
}

export default function PostPage({ post, user }: PostPageProps) {
  const router = useRouter()

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">文章未找到</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                boke 博客
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">欢迎, {user.email}</span>
                  <button
                    onClick={() => router.push('/api/auth/logout')}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded"
                  >
                    登出
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
                  >
                    登录
                  </button>
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                  >
                    注册
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>
                    作者: {post.profiles?.full_name || post.profiles?.username || '匿名'}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(post.published_at || post.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {post.content}
              </div>
            </div>
          </div>
        </article>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← 返回首页
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 boke 博客. 基于 Next.js 和 Supabase 构建.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext<{ slug: string }>) {
  const supabase = createServerSupabaseClient<Database>(ctx)
  const { slug } = ctx.params!

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let user = null
  if (session?.user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    user = data
  }

  // Fetch the post
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        username,
        full_name
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !post) {
    return {
      props: {
        post: null,
        user,
      },
    }
  }

  return {
    props: {
      post,
      user,
    },
  }
}
