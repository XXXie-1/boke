import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { Database } from '../types/database'

type UserProfile = Database['public']['Tables']['profiles']['Row']
type Post = Database['public']['Tables']['posts']['Row'] & {
  profiles: Pick<UserProfile, 'username' | 'full_name'>
}

type HomeProps = {
  user: UserProfile | null
  posts: Post[]
}

export default function Home({ user, posts }: HomeProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">boke 博客</h1>
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
                  {user && (
                    <button
                      onClick={() => router.push('/posts/create')}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                    >
                      写文章
                    </button>
                  )}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            欢迎来到我的博客
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            分享技术、生活和思考的地方
          </p>
        </div>

        {/* Blog Posts */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">还没有发布的文章</p>
              {user && (
                <button
                  onClick={() => router.push('/posts/create')}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                >
                  写第一篇文章
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(post.published_at || post.created_at).toLocaleDateString('zh-CN')}
                    </span>
                    <span className="text-sm text-gray-500">
                      作者: {post.profiles?.full_name || post.profiles?.username || '匿名'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link href={`/posts/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </p>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    阅读更多 →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 boke 博客. 基于 Next.js 和 Supabase 构建.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient<Database>(ctx)
  
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

  // Fetch published posts with author information
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        username,
        full_name
      )
    `)
    .eq('published', true)
    .order('published_at', { ascending: false })

  return {
    props: {
      user,
      posts: posts || [],
    },
  }
}