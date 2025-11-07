import Link from 'next/link'

export default function AppRouterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          App Router Home
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          This is the App Router version of the home page.
        </p>
        <div className="space-y-4">
          <Link 
            href="/" 
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Go to Pages Router Home
          </Link>
          <Link 
            href="/auth/login" 
            className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}