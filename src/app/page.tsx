import Link from 'next/link'
import { SearchBox } from '@/components/search/SearchBox'
import { MagnifyingGlassIcon, TagIcon, FolderIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Blog
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/articles" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Articles
                </Link>
                <Link href="/tags" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Tags
                </Link>
                <Link href="/categories" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Categories
                </Link>
                <Link href="/archive" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Archive
                </Link>
                <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  About
                </Link>
              </nav>
            </div>
            
            <Link
              href="/search"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Discover Amazing Articles
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
            Explore our collection of articles on technology, development, and innovation. 
            Find exactly what you're looking for with our powerful search and discovery features.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBox
              placeholder="Search articles, topics, and more..."
              className="text-lg"
            />
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/articles"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Articles
            </Link>
            <Link
              href="/tags"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Explore Tags
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              View Categories
            </Link>
          </div>
        </section>

        {/* Discovery Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Discovery Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link
              href="/search"
              className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <MagnifyingGlassIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Smart Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Full-text search with debounced input and intelligent results.
              </p>
            </Link>

            <Link
              href="/tags"
              className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <TagIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Tag Navigation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Browse articles by tags with color-coded organization.
              </p>
            </Link>

            <Link
              href="/categories"
              className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <FolderIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Categories
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Organized content by topics and subjects.
              </p>
            </Link>

            <Link
              href="/archive"
              className="group block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                <CalendarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Archive
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Browse articles by year and month.
              </p>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                SEO-Friendly URLs
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Clean, semantic URLs with proper metadata for search engines.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500 font-mono">
                /tags/[tag]<br />
                /categories/[category]<br />
                /archive/[year]/[month]
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Related Articles
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Discover related content based on shared tags and topics.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Smart recommendations powered by tag overlap analysis
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Advanced Filtering
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Filter articles by tags, categories, and search terms.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Real-time filtering with URL state management
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Reading History
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Track your reading progress and history across articles.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Persistent reading history with progress tracking
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Performance Optimized
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Fast loading with SSR, caching, and optimized queries.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Built with Next.js 14 and Supabase
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Responsive Design
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Beautiful, accessible UI that works on all devices.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Mobile-first design with Tailwind CSS
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Start Exploring
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Dive into our collection of articles and discover new insights.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/articles"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Browse All Articles
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
            >
              Learn More
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Blog
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Discover amazing articles on technology, development, and innovation.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Explore
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/articles" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Articles
                  </Link>
                </li>
                <li>
                  <Link href="/tags" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Tags
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/archive" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Archive
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Features
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/search" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Search
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/rss.xml" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    RSS Feed
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Connect
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>&copy; 2024 Blog. Built with Next.js, TypeScript, and Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}