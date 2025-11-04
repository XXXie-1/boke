import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { Pagination } from '@/components/ui/Pagination'
import { categoriesService } from '@/lib/articles'
import { generateCategoryMetadata } from '@/lib/metadata'

interface CategoryPageProps {
  params: { slug: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const category = await categoriesService.getCategoryBySlug(params.slug)
    return generateCategoryMetadata(category)
  } catch {
    return generateCategoryMetadata({ name: 'Category not found', slug: params.slug })
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const page = parseInt(searchParams.page || '1', 10)

  try {
    const [category, articlesResponse] = await Promise.all([
      categoriesService.getCategoryBySlug(params.slug),
      categoriesService.getArticlesByCategory(params.slug, page, 12)
    ])

    const { data: articles, pagination } = articlesResponse

    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <nav className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/categories" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Categories
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">{category.name}</span>
          </nav>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {category.name}
          </h1>
          
          {category.description && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              {category.description}
            </p>
          )}
          
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Browse {category.article_count} {category.article_count === 1 ? 'article' : 'articles'} in this category
          </p>
        </header>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No articles found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              There are no articles in the "{category.name}" category yet.
            </p>
            <Link
              href="/articles"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Browse all articles
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  showCategories={true}
                  showTags={true}
                  showReadTime={true}
                  showViewCount={true}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              pagination={pagination}
              baseUrl={`/categories/${params.slug}`}
              className="justify-center"
            />
          </>
        )}
      </main>
    )
  } catch (error) {
    console.error('Error loading category page:', error)
    notFound()
  }
}