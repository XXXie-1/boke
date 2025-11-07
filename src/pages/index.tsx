import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import type { Database } from '../types/database'

type UserProfile = Database['public']['Tables']['profiles']['Row']

export default function Home({ user }: { user: UserProfile | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Vercel + Supabase Starter
              </h1>
              {user ? (
                <div>
                  <p className="text-lg text-gray-600 mb-4">
                    Welcome, {user.email}!
                  </p>
                  <button
                    onClick={() => router.push('/api/auth/logout')}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-lg text-gray-600 mb-4">
                    Get started by signing in or creating an account
                  </p>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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

  return {
    props: {
      user,
    },
  }
}